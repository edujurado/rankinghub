-- Migration: Add is_direct_provider flag to providers table
-- Purpose: Filter out directories/platforms from public rankings
-- Only direct service providers should appear in public rankings
-- Directories can remain in database but be excluded from rankings

-- Add the is_direct_provider column
ALTER TABLE providers 
ADD COLUMN IF NOT EXISTS is_direct_provider BOOLEAN DEFAULT TRUE;

-- Add comment to explain the field
COMMENT ON COLUMN providers.is_direct_provider IS 
'TRUE for direct service providers (individual DJs/companies that perform services directly). 
FALSE for directories/platforms that aggregate multiple providers. 
Only direct providers appear in public rankings.';

-- Set all existing providers to direct providers by default
-- Admins can manually mark directories as FALSE
UPDATE providers 
SET is_direct_provider = TRUE 
WHERE is_direct_provider IS NULL;

-- Create index for better query performance on filtered rankings
CREATE INDEX IF NOT EXISTS idx_providers_direct_active 
ON providers(is_direct_provider, is_active) 
WHERE is_direct_provider = TRUE AND is_active = TRUE;

-- Add a check constraint to ensure data integrity
-- (Optional, but helps ensure the field is always set)
ALTER TABLE providers 
ALTER COLUMN is_direct_provider SET NOT NULL;
