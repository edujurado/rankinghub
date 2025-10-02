-- RankingHub Database Schema
-- This file contains the SQL schema for the RankingHub MVP

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create providers table
CREATE TABLE IF NOT EXISTS providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('djs', 'photographers', 'videographers')),
    position INTEGER NOT NULL,
    rating DECIMAL(2,1) NOT NULL CHECK (rating >= 0 AND rating <= 5),
    verified BOOLEAN DEFAULT FALSE,
    country VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_url TEXT,
    bio TEXT,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    website TEXT,
    instagram VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create skills table
CREATE TABLE IF NOT EXISTS skills (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
    punctuality INTEGER NOT NULL CHECK (punctuality >= 1 AND punctuality <= 5),
    professionalism INTEGER NOT NULL CHECK (professionalism >= 1 AND professionalism <= 5),
    reliability INTEGER NOT NULL CHECK (reliability >= 1 AND reliability <= 5),
    price INTEGER NOT NULL CHECK (price >= 1 AND price <= 5),
    client_satisfaction INTEGER NOT NULL CHECK (client_satisfaction >= 1 AND client_satisfaction <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID REFERENCES providers(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    event_date DATE,
    event_type VARCHAR(100),
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    active BOOLEAN DEFAULT TRUE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_providers_category ON providers(category);
CREATE INDEX IF NOT EXISTS idx_providers_position ON providers(category, position);
CREATE INDEX IF NOT EXISTS idx_providers_rating ON providers(rating DESC);
CREATE INDEX IF NOT EXISTS idx_providers_verified ON providers(verified);
CREATE INDEX IF NOT EXISTS idx_skills_provider_id ON skills(provider_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_provider_id ON contact_submissions(provider_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_active ON newsletter_subscribers(active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_providers_updated_at 
    BEFORE UPDATE ON providers 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_skills_updated_at 
    BEFORE UPDATE ON skills 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for MVP
INSERT INTO providers (name, category, position, rating, verified, country, location, image_url, bio, email, phone, website, instagram) VALUES
-- DJs
('Chris Evans', 'djs', 1, 5.0, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Professional DJ with 10+ years of experience in NYC nightlife and events.', 'chris@example.com', '+1 (555) 123-4567', 'https://chrisevansdj.com', '@chrisevansdj'),
('Lucas Pereira', 'djs', 2, 4.8, TRUE, 'Brazil', 'New York, NY', '/api/placeholder/150/150', 'Brazilian DJ specializing in Latin music and international events.', 'lucas@example.com', '+1 (555) 234-5678', NULL, '@lucaspereira'),
('Juan Martinez', 'djs', 3, 4.7, FALSE, 'Mexico', 'New York, NY', '/api/placeholder/150/150', 'Versatile DJ with expertise in multiple genres and event types.', 'juan@example.com', '+1 (555) 345-6789', NULL, NULL),
('Mark Johnson', 'djs', 4, 4.6, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'High-end DJ for luxury events and corporate functions.', 'mark@example.com', '+1 (555) 456-7890', 'https://markjohnsondj.com', NULL),
('David Smith', 'djs', 5, 4.5, FALSE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Budget-friendly DJ perfect for small to medium events.', 'david@example.com', '+1 (555) 567-8901', NULL, NULL),
('Mark Davis', 'djs', 6, 4.4, FALSE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Creative DJ with unique style and innovative mixes.', 'markd@example.com', '+1 (555) 678-9012', NULL, NULL),

-- Photographers
('Sarah Wilson', 'photographers', 1, 5.0, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Award-winning photographer specializing in weddings and corporate events.', 'sarah@example.com', '+1 (555) 789-0123', 'https://sarahwilsonphoto.com', '@sarahwilsonphoto'),
('Alex Chen', 'photographers', 2, 4.9, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Fashion and event photographer with international recognition.', 'alex@example.com', '+1 (555) 890-1234', NULL, '@alexchenphoto'),
('Maria Rodriguez', 'photographers', 3, 4.8, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Portrait and lifestyle photographer with a creative eye.', 'maria@example.com', '+1 (555) 901-2345', 'https://mariarodriguezphoto.com', '@mariarodriguezphoto'),
('James Thompson', 'photographers', 4, 4.7, FALSE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Commercial photographer specializing in corporate and product photography.', 'james@example.com', '+1 (555) 012-3456', NULL, NULL),
('Lisa Park', 'photographers', 5, 4.6, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Wedding photographer with a documentary style approach.', 'lisa@example.com', '+1 (555) 123-4567', 'https://lisaparkphoto.com', '@lisaparkphoto'),

-- Videographers
('Mike Rodriguez', 'videographers', 1, 5.0, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Professional videographer with expertise in event coverage and promotional videos.', 'mike@example.com', '+1 (555) 234-5678', 'https://mikerodriguezvideo.com', '@mikerodriguezvideo'),
('Emma Thompson', 'videographers', 2, 4.8, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Creative videographer specializing in wedding films and corporate content.', 'emma@example.com', '+1 (555) 345-6789', NULL, '@emmathompsonvideo'),
('Carlos Mendez', 'videographers', 3, 4.7, FALSE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Event videographer with a focus on capturing authentic moments.', 'carlos@example.com', '+1 (555) 456-7890', NULL, NULL),
('Jennifer Lee', 'videographers', 4, 4.6, TRUE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Documentary-style videographer for weddings and special events.', 'jennifer@example.com', '+1 (555) 567-8901', 'https://jenniferleevideo.com', '@jenniferleevideo'),
('Robert Kim', 'videographers', 5, 4.5, FALSE, 'USA', 'New York, NY', '/api/placeholder/150/150', 'Corporate videographer with expertise in promotional and training videos.', 'robert@example.com', '+1 (555) 678-9012', NULL, NULL);

-- Insert skills data for each provider
INSERT INTO skills (provider_id, punctuality, professionalism, reliability, price, client_satisfaction) 
SELECT 
    p.id,
    CASE 
        WHEN p.name = 'Chris Evans' THEN 5
        WHEN p.name = 'Lucas Pereira' THEN 5
        WHEN p.name = 'Juan Martinez' THEN 4
        WHEN p.name = 'Mark Johnson' THEN 5
        WHEN p.name = 'David Smith' THEN 4
        WHEN p.name = 'Mark Davis' THEN 4
        WHEN p.name = 'Sarah Wilson' THEN 5
        WHEN p.name = 'Alex Chen' THEN 5
        WHEN p.name = 'Maria Rodriguez' THEN 5
        WHEN p.name = 'James Thompson' THEN 4
        WHEN p.name = 'Lisa Park' THEN 5
        WHEN p.name = 'Mike Rodriguez' THEN 5
        WHEN p.name = 'Emma Thompson' THEN 5
        WHEN p.name = 'Carlos Mendez' THEN 4
        WHEN p.name = 'Jennifer Lee' THEN 5
        WHEN p.name = 'Robert Kim' THEN 4
    END,
    CASE 
        WHEN p.name = 'Chris Evans' THEN 5
        WHEN p.name = 'Lucas Pereira' THEN 5
        WHEN p.name = 'Juan Martinez' THEN 5
        WHEN p.name = 'Mark Johnson' THEN 4
        WHEN p.name = 'David Smith' THEN 4
        WHEN p.name = 'Mark Davis' THEN 4
        WHEN p.name = 'Sarah Wilson' THEN 5
        WHEN p.name = 'Alex Chen' THEN 5
        WHEN p.name = 'Maria Rodriguez' THEN 5
        WHEN p.name = 'James Thompson' THEN 4
        WHEN p.name = 'Lisa Park' THEN 5
        WHEN p.name = 'Mike Rodriguez' THEN 5
        WHEN p.name = 'Emma Thompson' THEN 5
        WHEN p.name = 'Carlos Mendez' THEN 4
        WHEN p.name = 'Jennifer Lee' THEN 5
        WHEN p.name = 'Robert Kim' THEN 4
    END,
    CASE 
        WHEN p.name = 'Chris Evans' THEN 5
        WHEN p.name = 'Lucas Pereira' THEN 4
        WHEN p.name = 'Juan Martinez' THEN 4
        WHEN p.name = 'Mark Johnson' THEN 5
        WHEN p.name = 'David Smith' THEN 4
        WHEN p.name = 'Mark Davis' THEN 4
        WHEN p.name = 'Sarah Wilson' THEN 5
        WHEN p.name = 'Alex Chen' THEN 5
        WHEN p.name = 'Maria Rodriguez' THEN 5
        WHEN p.name = 'James Thompson' THEN 4
        WHEN p.name = 'Lisa Park' THEN 5
        WHEN p.name = 'Mike Rodriguez' THEN 5
        WHEN p.name = 'Emma Thompson' THEN 4
        WHEN p.name = 'Carlos Mendez' THEN 4
        WHEN p.name = 'Jennifer Lee' THEN 5
        WHEN p.name = 'Robert Kim' THEN 4
    END,
    CASE 
        WHEN p.name = 'Chris Evans' THEN 4
        WHEN p.name = 'Lucas Pereira' THEN 5
        WHEN p.name = 'Juan Martinez' THEN 4
        WHEN p.name = 'Mark Johnson' THEN 3
        WHEN p.name = 'David Smith' THEN 5
        WHEN p.name = 'Mark Davis' THEN 4
        WHEN p.name = 'Sarah Wilson' THEN 4
        WHEN p.name = 'Alex Chen' THEN 3
        WHEN p.name = 'Maria Rodriguez' THEN 4
        WHEN p.name = 'James Thompson' THEN 4
        WHEN p.name = 'Lisa Park' THEN 4
        WHEN p.name = 'Mike Rodriguez' THEN 4
        WHEN p.name = 'Emma Thompson' THEN 5
        WHEN p.name = 'Carlos Mendez' THEN 4
        WHEN p.name = 'Jennifer Lee' THEN 4
        WHEN p.name = 'Robert Kim' THEN 4
    END,
    CASE 
        WHEN p.name = 'Chris Evans' THEN 5
        WHEN p.name = 'Lucas Pereira' THEN 5
        WHEN p.name = 'Juan Martinez' THEN 5
        WHEN p.name = 'Mark Johnson' THEN 4
        WHEN p.name = 'David Smith' THEN 4
        WHEN p.name = 'Mark Davis' THEN 4
        WHEN p.name = 'Sarah Wilson' THEN 5
        WHEN p.name = 'Alex Chen' THEN 5
        WHEN p.name = 'Maria Rodriguez' THEN 5
        WHEN p.name = 'James Thompson' THEN 4
        WHEN p.name = 'Lisa Park' THEN 5
        WHEN p.name = 'Mike Rodriguez' THEN 5
        WHEN p.name = 'Emma Thompson' THEN 5
        WHEN p.name = 'Carlos Mendez' THEN 4
        WHEN p.name = 'Jennifer Lee' THEN 5
        WHEN p.name = 'Robert Kim' THEN 4
    END
FROM providers p;

-- Create a view for provider rankings with skills
CREATE OR REPLACE VIEW provider_rankings AS
SELECT 
    p.*,
    s.punctuality,
    s.professionalism,
    s.reliability,
    s.price,
    s.client_satisfaction
FROM providers p
LEFT JOIN skills s ON p.id = s.provider_id
ORDER BY p.category, p.position;

-- Grant necessary permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
