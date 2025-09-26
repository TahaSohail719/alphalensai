-- Add job_id foreign key column to ai_interactions table
ALTER TABLE public.ai_interactions 
ADD COLUMN job_id UUID;

-- Add foreign key constraint to jobs table
ALTER TABLE public.ai_interactions 
ADD CONSTRAINT fk_ai_interactions_job_id 
FOREIGN KEY (job_id) REFERENCES public.jobs(id) ON DELETE SET NULL;

-- Add composite index for performance
CREATE INDEX idx_ai_interactions_user_job ON public.ai_interactions(user_id, job_id);

-- Add index on job_id for foreign key performance
CREATE INDEX idx_ai_interactions_job_id ON public.ai_interactions(job_id);