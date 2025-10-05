-- RankingHub Enhanced Database Schema
-- This file contains the comprehensive SQL schema for the RankingHub platform

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7), -- Hex color code
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create providers table (enhanced)
CREATE TABLE IF NOT EXISTS providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    position INTEGER NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    verified BOOLEAN DEFAULT FALSE,
    featured BOOLEAN DEFAULT FALSE,
    country VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    city VARCHAR(100),
    state VARCHAR(50),
    zip_code VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    image_url TEXT,
    bio TEXT,
    short_bio VARCHAR(500),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    website TEXT,
    instagram VARCHAR(100),
    facebook VARCHAR(100),
    twitter VARCHAR(100),
    youtube VARCHAR(100),
    tiktok VARCHAR(100),
    linkedin VARCHAR(100),
    price_range VARCHAR(20), -- $, $$, $$$, $$$$
    availability_status VARCHAR(20) DEFAULT 'available', -- available, busy, unavailable
    years_experience INTEGER,
    languages TEXT[], -- Array of languages spoken
    service_areas TEXT[], -- Array of service areas
    specialties TEXT[], -- Array of specialties
    equipment_list TEXT[], -- Array of equipment
    awards TEXT[], -- Array of awards
    certifications TEXT[], -- Array of certifications
    portfolio_images TEXT[], -- Array of portfolio image URLs
    portfolio_videos TEXT[], -- Array of portfolio video URLs
    social_proof_count INTEGER DEFAULT 0, -- Number of reviews/social proof
    view_count INTEGER DEFAULT 0,
    contact_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_claimed BOOLEAN DEFAULT FALSE, -- Whether provider has claimed their profile
    claimed_at TIMESTAMP WITH TIME ZONE,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table (enhanced)
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    punctuality INTEGER NOT NULL CHECK (punctuality >= 1 AND punctuality <= 5),
    professionalism INTEGER NOT NULL CHECK (professionalism >= 1 AND professionalism <= 5),
    reliability INTEGER NOT NULL CHECK (reliability >= 1 AND reliability <= 5),
    price INTEGER NOT NULL CHECK (price >= 1 AND price <= 5),
    client_satisfaction INTEGER NOT NULL CHECK (client_satisfaction >= 1 AND client_satisfaction <= 5),
    communication INTEGER DEFAULT 5 CHECK (communication >= 1 AND communication <= 5),
    creativity INTEGER DEFAULT 5 CHECK (creativity >= 1 AND creativity <= 5),
    flexibility INTEGER DEFAULT 5 CHECK (flexibility >= 1 AND flexibility <= 5),
    overall_rating DECIMAL(2,1) GENERATED ALWAYS AS (
        (punctuality + professionalism + reliability + price + client_satisfaction + 
         COALESCE(communication, 5) + COALESCE(creativity, 5) + COALESCE(flexibility, 5)) / 8.0
    ) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    client_name VARCHAR(255) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    event_type VARCHAR(100),
    event_date DATE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact submissions table (enhanced)
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    event_date DATE,
    event_type VARCHAR(100),
    event_location VARCHAR(255),
    guest_count INTEGER,
    budget_range VARCHAR(20),
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new', -- new, contacted, interested, not_interested, booked
    admin_notes TEXT,
    provider_response TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter subscribers table (enhanced)
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    interests TEXT[], -- Array of interests/categories
    source VARCHAR(100), -- How they subscribed
    status VARCHAR(20) DEFAULT 'active', -- active, unsubscribed, bounced
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    last_email_sent TIMESTAMP WITH TIME ZONE,
    email_count INTEGER DEFAULT 0
);

-- Create blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    author_name VARCHAR(255),
    author_email VARCHAR(255),
    category VARCHAR(100),
    tags TEXT[],
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_published BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'provider', -- provider, admin, super_admin, editor
    permissions TEXT[], -- Array of specific permissions
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL, -- Link to provider profile if user is a provider
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    profile_image TEXT,
    phone VARCHAR(50),
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create analytics events table
CREATE TABLE IF NOT EXISTS analytics_events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    event_type VARCHAR(100) NOT NULL, -- page_view, contact_form, newsletter_signup, etc.
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    user_id UUID, -- If user is logged in
    session_id VARCHAR(255),
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address INET,
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    event_data JSONB, -- Additional event-specific data
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider claims table (for provider verification)
CREATE TABLE IF NOT EXISTS provider_claims (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    claimant_email VARCHAR(255) NOT NULL,
    claimant_name VARCHAR(255) NOT NULL,
    claimant_phone VARCHAR(50),
    business_license VARCHAR(255),
    tax_id VARCHAR(255),
    verification_documents TEXT[], -- Array of document URLs
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    admin_notes TEXT,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create email templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    subject VARCHAR(255) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    variables TEXT[], -- Array of available variables
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_providers_category_id ON providers(category_id);
CREATE INDEX IF NOT EXISTS idx_providers_position ON providers(category_id, position);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_providers_verified ON providers(verified);
CREATE INDEX IF NOT EXISTS idx_providers_featured ON providers(featured);
CREATE INDEX IF NOT EXISTS idx_providers_location ON providers(city, state);
CREATE INDEX IF NOT EXISTS idx_providers_coordinates ON providers(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_providers_search ON providers USING gin(to_tsvector('english', name || ' ' || bio || ' ' || location));
CREATE INDEX IF NOT EXISTS idx_skills_provider_id ON skills(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_provider_id ON reviews(provider_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_provider_id ON contact_submissions(provider_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(is_published, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_providers_updated_at 
    BEFORE UPDATE ON providers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at 
    BEFORE UPDATE ON skills 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at 
    BEFORE UPDATE ON reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contact_submissions_updated_at 
    BEFORE UPDATE ON contact_submissions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at 
    BEFORE UPDATE ON blog_posts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_provider_claims_updated_at 
    BEFORE UPDATE ON provider_claims 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at 
    BEFORE UPDATE ON email_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial categories
INSERT INTO categories (name, slug, description, icon, color, sort_order) VALUES
('DJs', 'djs', 'Professional DJs for all types of events', 'music', '#8B5CF6', 1),
('Photographers', 'photographers', 'Expert photographers for every occasion', 'camera', '#3B82F6', 2),
('Videographers', 'videographers', 'Professional video production services', 'video', '#10B981', 3);

-- Insert sample providers with enhanced data
INSERT INTO providers (name, category_id, position, rating, verified, featured, country, location, city, state, zip_code, latitude, longitude, image_url, bio, short_bio, email, phone, website, instagram, facebook, youtube, price_range, years_experience, languages, service_areas, specialties, equipment_list, awards, certifications, portfolio_images, social_proof_count, view_count, contact_count) 
SELECT 
    p.name,
    c.id,
    p.position,
    p.rating,
    p.verified,
    CASE WHEN p.position <= 3 THEN TRUE ELSE FALSE END,
    p.country,
    p.location,
    'New York',
    'NY',
    '10001',
    40.7128,
    -74.0060,
    p.image_url,
    p.bio,
    LEFT(p.bio, 200),
    p.email,
    p.phone,
    p.website,
    p.instagram,
    NULL,
    NULL,
    CASE 
        WHEN p.position <= 2 THEN '$$$$'
        WHEN p.position <= 4 THEN '$$$'
        ELSE '$$'
    END,
    FLOOR(RANDOM() * 15) + 5,
    ARRAY['English', 'Spanish'],
    ARRAY['Manhattan', 'Brooklyn', 'Queens'],
    ARRAY['Weddings', 'Corporate Events', 'Parties'],
    ARRAY['Professional Equipment', 'Lighting', 'Sound System'],
    ARRAY['Best DJ 2023', 'Event Excellence Award'],
    ARRAY['Certified Professional', 'Music Production'],
    ARRAY['/portfolio/1.jpg', '/portfolio/2.jpg', '/portfolio/3.jpg'],
    FLOOR(RANDOM() * 50) + 10,
    FLOOR(RANDOM() * 200) + 50,
    FLOOR(RANDOM() * 20) + 5
FROM (
    VALUES 
    ('Chris Evans', 1, 5.0, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Professional DJ with 10+ years of experience in NYC nightlife and events.', 'chris@example.com', '+1 (555) 123-4567', 'https://chrisevansdj.com', '@chrisevansdj'),
    ('Lucas Pereira', 2, 4.8, TRUE, 'Brazil', 'New York, NY', '/api/placeholder/150/150', 'Brazilian DJ specializing in Latin music and international events.', 'lucas@example.com', '+1 (555) 234-5678', NULL, '@lucaspereira'),
    ('Juan Martinez', 3, 4.7, FALSE, 'Mexico', 'New York, NY', '/api/placeholder/150/150', 'Versatile DJ with expertise in multiple genres and event types.', 'juan@example.com', '+1 (555) 345-6789', NULL, NULL),
    ('Mark Johnson', 4, 4.6, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'High-end DJ for luxury events and corporate functions.', 'mark@example.com', '+1 (555) 456-7890', 'https://markjohnsondj.com', NULL),
    ('David Smith', 5, 4.5, FALSE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Budget-friendly DJ perfect for small to medium events.', 'david@example.com', '+1 (555) 567-8901', NULL, NULL),
    ('Mark Davis', 6, 4.4, FALSE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Creative DJ with unique style and innovative mixes.', 'markd@example.com', '+1 (555) 678-9012', NULL, NULL),
    ('Sarah Wilson', 1, 5.0, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Award-winning photographer specializing in weddings and corporate events.', 'sarah@example.com', '+1 (555) 789-0123', 'https://sarahwilsonphoto.com', '@sarahwilsonphoto'),
    ('Alex Chen', 2, 4.9, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Fashion and event photographer with international recognition.', 'alex@example.com', '+1 (555) 890-1234', NULL, '@alexchenphoto'),
    ('Maria Rodriguez', 3, 4.8, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Portrait and lifestyle photographer with a creative eye.', 'maria@example.com', '+1 (555) 901-2345', 'https://mariarodriguezphoto.com', '@mariarodriguezphoto'),
    ('James Thompson', 4, 4.7, FALSE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Commercial photographer specializing in corporate and product photography.', 'james@example.com', '+1 (555) 012-3456', NULL, NULL),
    ('Lisa Park', 5, 4.6, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Wedding photographer with a documentary style approach.', 'lisa@example.com', '+1 (555) 123-4567', 'https://lisaparkphoto.com', '@lisaparkphoto'),
    ('Mike Rodriguez', 1, 5.0, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Professional videographer with expertise in event coverage and promotional videos.', 'mike@example.com', '+1 (555) 234-5678', 'https://mikerodriguezvideo.com', '@mikerodriguezvideo'),
    ('Emma Thompson', 2, 4.8, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Creative videographer specializing in wedding films and corporate content.', 'emma@example.com', '+1 (555) 345-6789', NULL, '@emmathompsonvideo'),
    ('Carlos Mendez', 3, 4.7, FALSE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Event videographer with a focus on capturing authentic moments.', 'carlos@example.com', '+1 (555) 456-7890', NULL, NULL),
    ('Jennifer Lee', 4, 4.6, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Documentary-style videographer for weddings and special events.', 'jennifer@example.com', '+1 (555) 567-8901', 'https://jenniferleevideo.com', '@jenniferleevideo'),
    ('Robert Kim', 5, 4.5, FALSE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Corporate videographer with expertise in promotional and training videos.', 'robert@example.com', '+1 (555) 678-9012', NULL, NULL)
) AS p(name, position, rating, verified, country, location, image_url, bio, email, phone, website, instagram)
CROSS JOIN categories c
WHERE c.slug = CASE 
    WHEN p.position <= 6 THEN 'djs'
    WHEN p.position <= 11 THEN 'photographers'
    ELSE 'videographers'
END;

-- Insert skills data for each provider
INSERT INTO skills (provider_id, punctuality, professionalism, reliability, price, client_satisfaction, communication, creativity, flexibility)
SELECT 
    p.id,
    CASE 
        WHEN p.position <= 2 THEN 5
        WHEN p.position <= 4 THEN 4
        ELSE 3
    END,
    CASE 
        WHEN p.position <= 2 THEN 5
        WHEN p.position <= 4 THEN 4
        ELSE 3
    END,
    CASE 
        WHEN p.position <= 2 THEN 5
        WHEN p.position <= 4 THEN 4
        ELSE 3
    END,
    CASE 
        WHEN p.position <= 2 THEN 4
        WHEN p.position <= 4 THEN 3
        ELSE 5
    END,
    CASE 
        WHEN p.position <= 2 THEN 5
        WHEN p.position <= 4 THEN 4
        ELSE 3
    END,
    CASE 
        WHEN p.position <= 2 THEN 5
        WHEN p.position <= 4 THEN 4
        ELSE 3
    END,
    CASE 
        WHEN p.position <= 2 THEN 5
        WHEN p.position <= 4 THEN 4
        ELSE 3
    END,
    CASE 
        WHEN p.position <= 2 THEN 5
        WHEN p.position <= 4 THEN 4
        ELSE 3
    END
FROM providers p;

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author_name, author_email, category, tags, meta_title, meta_description, is_published, is_featured, published_at) VALUES
('Top 10 DJs in NYC for 2024', 'top-10-djs-nyc-2024', 'Discover the best DJs in New York City for your next event.', 'New York City is home to some of the most talented DJs in the world...', '/blog/djs-2024.jpg', 'RankingHub Team', 'editor@rankinghub.com', 'DJs', ARRAY['DJs', 'NYC', 'Events', 'Music'], 'Top 10 DJs in NYC for 2024 | RankingHub', 'Find the best DJs in New York City for your event. Our comprehensive ranking features top-rated DJs with verified reviews.', TRUE, TRUE, NOW()),
('Best Event Photographers in NYC', 'best-event-photographers-nyc', 'Professional photographers for weddings, corporate events, and special occasions.', 'When it comes to capturing life''s most important moments...', '/blog/photographers-2024.jpg', 'RankingHub Team', 'editor@rankinghub.com', 'Photography', ARRAY['Photography', 'Events', 'Weddings', 'NYC'], 'Best Event Photographers in NYC | RankingHub', 'Professional event photographers in New York City. Find the perfect photographer for your wedding or corporate event.', TRUE, TRUE, NOW()),
('Ultimate Guide to Event Videography in NYC', 'event-videography-guide-nyc', 'Everything you need to know about hiring a videographer for your NYC event.', 'Event videography has become an essential part of modern celebrations...', '/blog/videography-guide.jpg', 'RankingHub Team', 'editor@rankinghub.com', 'Videography', ARRAY['Videography', 'Events', 'NYC', 'Guide'], 'Ultimate Guide to Event Videography in NYC | RankingHub', 'Complete guide to hiring videographers in NYC. Tips, costs, and our top recommendations for event videography.', TRUE, FALSE, NOW());

-- Insert sample email templates
INSERT INTO email_templates (name, subject, html_content, text_content, variables) VALUES
('contact_form_notification', 'New Contact Form Submission - {{provider_name}}', 
'<h2>New Contact Form Submission</h2><p>You have received a new contact form submission for {{provider_name}}.</p><p><strong>Name:</strong> {{client_name}}</p><p><strong>Email:</strong> {{client_email}}</p><p><strong>Event Date:</strong> {{event_date}}</p><p><strong>Message:</strong> {{message}}</p>',
'New Contact Form Submission\n\nProvider: {{provider_name}}\nName: {{client_name}}\nEmail: {{client_email}}\nEvent Date: {{event_date}}\nMessage: {{message}}',
ARRAY['provider_name', 'client_name', 'client_email', 'event_date', 'message']),

('newsletter_welcome', 'Welcome to RankingHub Newsletter!', 
'<h1>Welcome to RankingHub!</h1><p>Thank you for subscribing to our newsletter. You''ll receive updates about the best event service providers in NYC.</p>',
'Welcome to RankingHub!\n\nThank you for subscribing to our newsletter.',
ARRAY['first_name', 'email']);

-- Create views for common queries
CREATE OR REPLACE VIEW provider_rankings AS
SELECT 
    p.*,
    c.name as category_name,
    c.slug as category_slug,
    s.punctuality,
    s.professionalism,
    s.reliability,
    s.price,
    s.client_satisfaction,
    s.communication,
    s.creativity,
    s.flexibility,
    s.overall_rating,
    COUNT(r.id) as review_count,
    AVG(r.rating) as average_review_rating
FROM providers p
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN skills s ON p.id = s.provider_id
LEFT JOIN reviews r ON p.id = r.provider_id AND r.is_public = TRUE
WHERE p.is_active = TRUE
GROUP BY p.id, c.name, c.slug, s.punctuality, s.professionalism, s.reliability, s.price, s.client_satisfaction, s.communication, s.creativity, s.flexibility, s.overall_rating
ORDER BY p.category_id, p.position;

-- Create view for analytics dashboard
CREATE OR REPLACE VIEW analytics_summary AS
SELECT 
    DATE(created_at) as date,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT session_id) as unique_sessions,
    COUNT(DISTINCT provider_id) as unique_providers
FROM analytics_events
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at), event_type
ORDER BY date DESC, event_count DESC;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
FOR UPDATE USING (auth.uid() = id);

-- Allow public read access to providers
CREATE POLICY "Public read access to providers" ON providers
FOR SELECT USING (is_active = TRUE);

-- Allow public read access to skills
CREATE POLICY "Public read access to skills" ON skills
FOR SELECT USING (true);

-- Allow public read access to reviews
CREATE POLICY "Public read access to reviews" ON reviews
FOR SELECT USING (is_public = TRUE);

-- Allow public read access to blog posts
CREATE POLICY "Public read access to blog posts" ON blog_posts
FOR SELECT USING (is_published = TRUE);

-- Allow public insert to contact submissions
CREATE POLICY "Public insert to contact submissions" ON contact_submissions
FOR INSERT WITH CHECK (true);

-- Allow public insert to newsletter subscribers
CREATE POLICY "Public insert to newsletter subscribers" ON newsletter_subscribers
FOR INSERT WITH CHECK (true);

-- Allow public insert to analytics events
CREATE POLICY "Public insert to analytics events" ON analytics_events
FOR INSERT WITH CHECK (true);
