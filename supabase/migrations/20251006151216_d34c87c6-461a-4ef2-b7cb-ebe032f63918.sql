-- Part 1: Clean up stale engaged credits for completed/failed jobs
DELETE FROM public.credits_engaged
WHERE job_id IN (
  SELECT id FROM public.jobs 
  WHERE status IN ('completed', 'failed')
);

-- Part 2: Create trigger function to auto-release credits when jobs complete/fail
CREATE OR REPLACE FUNCTION public.auto_release_credits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- When a job is marked as completed or failed, delete its engaged credit entry
  IF NEW.status IN ('completed', 'failed') AND OLD.status NOT IN ('completed', 'failed') THEN
    DELETE FROM public.credits_engaged
    WHERE job_id = NEW.id;
    
    RAISE LOG 'Auto-released credit for job %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on jobs table
DROP TRIGGER IF EXISTS trigger_auto_release_credits ON public.jobs;
CREATE TRIGGER trigger_auto_release_credits
  AFTER UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_release_credits();