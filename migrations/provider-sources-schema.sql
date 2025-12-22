-- Provider Sources & Matching Schema Migration
-- This migration adds tables for storing raw API data and tracking provider matches
-- DO NOT MODIFY EXISTING TABLES

-- Ensure required extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- PROVIDER SOURCES TABLE
-- Stores raw data from Yelp and Google Places APIs
-- Single table with normalized fields common to both sources
-- Schema based on actual API responses
-- ============================================================================

CREATE TABLE IF NOT EXISTS provider_sources (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Source identification
    source VARCHAR(50) NOT NULL CHECK (source IN ('yelp', 'google')),
    source_provider_id VARCHAR(255) NOT NULL, -- Yelp: id, Google: place_id
    
    -- Link to canonical provider (set after matching)
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    
    -- Category for matching (slug format: djs, photographers, videographers)
    category_slug VARCHAR(100) NOT NULL,
    
    -- ========================================================================
    -- NORMALIZED FIELDS (Common to both sources)
    -- ========================================================================
    name VARCHAR(255) NOT NULL,
    phone_normalized VARCHAR(20), -- Digits only, no formatting (e.g., "12123024545")
    address VARCHAR(500), -- Full formatted address
    address_line1 VARCHAR(255), -- Street address
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    country VARCHAR(100) DEFAULT 'US',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    
    -- Ratings and reviews
    rating DECIMAL(2, 1) CHECK (rating >= 0 AND rating <= 5),
    review_count INTEGER DEFAULT 0,
    
    -- Business info
    price_range VARCHAR(10), -- $, $$, $$$, $$$$
    photo_url TEXT, -- Primary photo URL
    website TEXT,
    categories TEXT[], -- Array of category strings
    
    -- ========================================================================
    -- YELP-SPECIFIC FIELDS
    -- Based on actual Yelp API response structure
    -- ========================================================================
    yelp_alias VARCHAR(255), -- e.g., "valerie-new-york"
    yelp_url TEXT, -- Full Yelp business page URL
    yelp_display_phone VARCHAR(50), -- Formatted phone: "(212) 302-4545"
    yelp_is_closed BOOLEAN DEFAULT FALSE,
    yelp_transactions TEXT[], -- ["delivery", "pickup", "restaurant_reservation"]
    yelp_distance DECIMAL(15, 6), -- Distance from search location in meters
    yelp_business_hours JSONB, -- Full business hours structure
    yelp_attributes JSONB, -- Additional attributes (menu_url, open24_hours, etc.)
    yelp_image_url TEXT, -- Original image URL from Yelp
    
    -- ========================================================================
    -- GOOGLE-SPECIFIC FIELDS
    -- Based on actual Google Places API response structure
    -- ========================================================================
    google_formatted_address TEXT, -- Full formatted address from Google
    google_types TEXT[], -- ["establishment", "point_of_interest", etc.]
    google_international_phone VARCHAR(50), -- "+1 347-245-1706"
    google_photos JSONB, -- Array of photo references
    google_viewport JSONB, -- Viewport bounds from geometry
    google_html_attributions TEXT[], -- HTML attributions from Google
    
    -- ========================================================================
    -- RAW DATA & METADATA
    -- ========================================================================
    raw_data JSONB NOT NULL, -- Complete API response for audit/debugging
    
    -- Timestamps
    fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one record per source + source_provider_id
    UNIQUE (source, source_provider_id)
);

-- ============================================================================
-- PROVIDER MATCHES TABLE
-- Stores confidence scores and match details for provider linking
-- ============================================================================

CREATE TABLE IF NOT EXISTS provider_matches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    
    -- Link to canonical provider
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    
    -- Source identification
    source VARCHAR(50) NOT NULL CHECK (source IN ('yelp', 'google')),
    source_provider_id VARCHAR(255) NOT NULL,
    
    -- Confidence scoring
    confidence_score DECIMAL(5, 4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1), -- 0.0000 – 1.0000
    match_type VARCHAR(20) NOT NULL CHECK (match_type IN ('auto', 'partial', 'manual')),
    
    -- Detailed match breakdown for auditing
    matched_fields JSONB, -- { "name_score": 0.95, "phone_match": true, "address_score": 0.87, ... }
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint: one match per source + source_provider_id
    UNIQUE (source, source_provider_id)
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Trigram index for fuzzy name matching
CREATE INDEX IF NOT EXISTS idx_provider_sources_name_trgm
ON provider_sources USING gin (name gin_trgm_ops);

-- Trigram index for address matching
CREATE INDEX IF NOT EXISTS idx_provider_sources_address_trgm
ON provider_sources USING gin (address gin_trgm_ops);

-- Geo index for distance-based candidate selection
CREATE INDEX IF NOT EXISTS idx_provider_sources_geo
ON provider_sources (latitude, longitude);

-- Index for finding unlinked sources
CREATE INDEX IF NOT EXISTS idx_provider_sources_provider_id
ON provider_sources (provider_id);

-- Index for source + category filtering
CREATE INDEX IF NOT EXISTS idx_provider_sources_source_category
ON provider_sources (source, category_slug);

-- Index for source lookup
CREATE INDEX IF NOT EXISTS idx_provider_sources_source_id
ON provider_sources (source, source_provider_id);

-- Index for provider_matches lookups
CREATE INDEX IF NOT EXISTS idx_provider_matches_provider_id
ON provider_matches (provider_id);

CREATE INDEX IF NOT EXISTS idx_provider_matches_source
ON provider_matches (source, source_provider_id);

-- Index for fetched_at to find stale records
CREATE INDEX IF NOT EXISTS idx_provider_sources_fetched_at
ON provider_sources (fetched_at);

-- Index for unlinked sources (NULL provider_id)
CREATE INDEX IF NOT EXISTS idx_provider_sources_unlinked
ON provider_sources (source, category_slug) WHERE provider_id IS NULL;

-- Index on phone_normalized for exact matching
CREATE INDEX IF NOT EXISTS idx_provider_sources_phone
ON provider_sources (phone_normalized) WHERE phone_normalized IS NOT NULL;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp for provider_sources
CREATE TRIGGER update_provider_sources_updated_at
    BEFORE UPDATE ON provider_sources
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-update updated_at timestamp for provider_matches
CREATE TRIGGER update_provider_matches_updated_at
    BEFORE UPDATE ON provider_matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS FOR MATCHING
-- ============================================================================

-- Function to normalize phone numbers (extract digits only)
CREATE OR REPLACE FUNCTION normalize_phone(phone TEXT)
RETURNS TEXT AS $$
BEGIN
    IF phone IS NULL OR phone = '' THEN
        RETURN NULL;
    END IF;
    -- Remove all non-digit characters and leading country code variations
    RETURN regexp_replace(phone, '[^0-9]', '', 'g');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate Haversine distance between two points (in meters)
CREATE OR REPLACE FUNCTION haversine_distance(
    lat1 DECIMAL,
    lon1 DECIMAL,
    lat2 DECIMAL,
    lon2 DECIMAL
)
RETURNS DECIMAL AS $$
DECLARE
    r DECIMAL := 6371000; -- Earth's radius in meters
    dlat DECIMAL;
    dlon DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
        RETURN NULL;
    END IF;
    
    dlat := radians(lat2 - lat1);
    dlon := radians(lon2 - lon1);
    
    a := sin(dlat/2) * sin(dlat/2) +
         cos(radians(lat1)) * cos(radians(lat2)) *
         sin(dlon/2) * sin(dlon/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN r * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to extract domain from URL
CREATE OR REPLACE FUNCTION extract_domain(url TEXT)
RETURNS TEXT AS $$
BEGIN
    IF url IS NULL OR url = '' THEN
        RETURN NULL;
    END IF;
    -- Extract domain from URL, removing protocol and www
    RETURN lower(regexp_replace(
        regexp_replace(url, '^https?://(www\.)?', ''),
        '/.*$', ''
    ));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate trigram similarity score
CREATE OR REPLACE FUNCTION name_similarity(name1 TEXT, name2 TEXT)
RETURNS DECIMAL AS $$
BEGIN
    IF name1 IS NULL OR name2 IS NULL THEN
        RETURN 0;
    END IF;
    RETURN similarity(lower(name1), lower(name2));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE provider_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_matches ENABLE ROW LEVEL SECURITY;

-- Allow public read access to provider_sources (for admin dashboard)
CREATE POLICY "Allow read access to provider_sources" ON provider_sources
FOR SELECT USING (true);

-- Allow public read access to provider_matches
CREATE POLICY "Allow read access to provider_matches" ON provider_matches
FOR SELECT USING (true);

-- Allow authenticated users to insert/update (for sync jobs)
CREATE POLICY "Allow authenticated insert to provider_sources" ON provider_sources
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update to provider_sources" ON provider_sources
FOR UPDATE USING (true);

CREATE POLICY "Allow authenticated insert to provider_matches" ON provider_matches
FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow authenticated update to provider_matches" ON provider_matches
FOR UPDATE USING (true);

-- Allow delete for cleanup operations
CREATE POLICY "Allow authenticated delete on provider_sources" ON provider_sources
FOR DELETE USING (true);

CREATE POLICY "Allow authenticated delete on provider_matches" ON provider_matches
FOR DELETE USING (true);

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON provider_sources TO authenticated;
GRANT ALL ON provider_matches TO authenticated;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE provider_sources IS 'Stores raw data from Yelp and Google Places APIs. Each record represents a single business from a single source.';
COMMENT ON TABLE provider_matches IS 'Stores confidence scores and match details linking provider_sources to canonical providers.';

COMMENT ON COLUMN provider_sources.source IS 'API source: yelp or google';
COMMENT ON COLUMN provider_sources.source_provider_id IS 'Unique ID from source API (Yelp id or Google place_id)';
COMMENT ON COLUMN provider_sources.phone_normalized IS 'Phone number with only digits, for exact matching';
COMMENT ON COLUMN provider_sources.raw_data IS 'Complete API response JSON for audit and debugging';

COMMENT ON COLUMN provider_matches.confidence_score IS 'Match confidence from 0.0000 to 1.0000';
COMMENT ON COLUMN provider_matches.match_type IS 'auto (>=0.85), partial (0.65-0.84), or manual';
COMMENT ON COLUMN provider_matches.matched_fields IS 'Breakdown of individual field match scores';
