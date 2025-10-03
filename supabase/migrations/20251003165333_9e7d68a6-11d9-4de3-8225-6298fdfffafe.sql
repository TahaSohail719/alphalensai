-- Add progress_message column to jobs table
ALTER TABLE public.jobs 
ADD COLUMN IF NOT EXISTS progress_message TEXT;

-- Add index for better performance when querying jobs with progress
CREATE INDEX IF NOT EXISTS idx_jobs_progress 
ON public.jobs(user_id, status, updated_at DESC) 
WHERE progress_message IS NOT NULL;