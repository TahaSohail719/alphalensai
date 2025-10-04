-- Create credits_engaged table for temporary credit reservations
CREATE TABLE IF NOT EXISTS public.credits_engaged (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature text NOT NULL CHECK (feature IN ('queries', 'ideas', 'reports')),
  job_id uuid NOT NULL,
  engaged_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT unique_job_engagement UNIQUE (job_id)
);

-- Optimize frequent queries
CREATE INDEX IF NOT EXISTS idx_credits_engaged_user_feature 
  ON public.credits_engaged (user_id, feature);

CREATE INDEX IF NOT EXISTS idx_credits_engaged_job 
  ON public.credits_engaged (job_id);

-- Enable RLS
ALTER TABLE public.credits_engaged ENABLE ROW LEVEL SECURITY;

-- Users can view their own engaged credits
CREATE POLICY "Users can view their own engaged credits"
  ON public.credits_engaged
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create their own engaged credits
CREATE POLICY "Users can create their own engaged credits"
  ON public.credits_engaged
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own engaged credits
CREATE POLICY "Users can delete their own engaged credits"
  ON public.credits_engaged
  FOR DELETE
  USING (auth.uid() = user_id);