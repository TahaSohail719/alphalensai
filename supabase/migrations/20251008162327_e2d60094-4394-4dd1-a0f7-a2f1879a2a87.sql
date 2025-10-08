-- 🔧 PATCH 3: Database-level safety net for stale engaged credits
-- This function cleans up orphaned credits_engaged entries older than 15 minutes
-- Can be called manually or scheduled via pg_cron

CREATE OR REPLACE FUNCTION public.cleanup_stale_engaged_credits()
RETURNS TABLE(deleted_count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted_count bigint;
BEGIN
  -- Delete engaged credits older than 15 minutes
  DELETE FROM public.credits_engaged
  WHERE engaged_at < now() - interval '15 minutes';
  
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
  
  RAISE LOG 'Cleaned up % stale engaged credits', v_deleted_count;
  
  RETURN QUERY SELECT v_deleted_count;
END;
$$;

-- Grant execute permission to authenticated users (for manual cleanup if needed)
GRANT EXECUTE ON FUNCTION public.cleanup_stale_engaged_credits() TO authenticated;

COMMENT ON FUNCTION public.cleanup_stale_engaged_credits() IS 
'Safety net: Removes orphaned credits_engaged entries older than 15 minutes. Called manually or via cron.';
