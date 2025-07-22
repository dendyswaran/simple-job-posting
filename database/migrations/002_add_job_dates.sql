-- Add start_date and end_date columns to job_posts table
ALTER TABLE job_posts 
ADD COLUMN start_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN end_date DATE NULL;

-- Add check constraint to ensure start_date is not in the past
ALTER TABLE job_posts 
ADD CONSTRAINT check_start_date_not_past 
CHECK (start_date >= CURRENT_DATE);

-- Add check constraint to ensure end_date is after start_date when provided
ALTER TABLE job_posts 
ADD CONSTRAINT check_end_date_after_start 
CHECK (end_date IS NULL OR end_date >= start_date);

-- Create index for efficient date range queries
CREATE INDEX idx_job_posts_start_date ON job_posts(start_date);
CREATE INDEX idx_job_posts_end_date ON job_posts(end_date) WHERE end_date IS NOT NULL; 