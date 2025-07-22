-- Create job_type enum
CREATE TYPE job_type AS ENUM ('Full-Time', 'Part-Time', 'Contract');

-- Create job_status enum
CREATE TYPE job_status AS ENUM ('Active', 'Inactive');

-- Create job_posts table
CREATE TABLE job_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    type job_type NOT NULL,
    status job_status NOT NULL DEFAULT 'Active',
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_job_posts_user_id ON job_posts(user_id);
CREATE INDEX idx_job_posts_status ON job_posts(status);
CREATE INDEX idx_job_posts_type ON job_posts(type);
CREATE INDEX idx_job_posts_created_at ON job_posts(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at
CREATE TRIGGER update_job_posts_updated_at BEFORE UPDATE ON job_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE job_posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can view all active job posts
CREATE POLICY "Anyone can view active job posts" ON job_posts
    FOR SELECT USING (status = 'Active');

-- Users can view their own job posts regardless of status
CREATE POLICY "Users can view own job posts" ON job_posts
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own job posts
CREATE POLICY "Users can insert own job posts" ON job_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own job posts
CREATE POLICY "Users can update own job posts" ON job_posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own job posts
CREATE POLICY "Users can delete own job posts" ON job_posts
    FOR DELETE USING (auth.uid() = user_id); 