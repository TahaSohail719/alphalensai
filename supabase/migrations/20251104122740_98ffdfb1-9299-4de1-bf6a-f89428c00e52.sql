-- ============================================================
-- PHASE 1: Nettoyage Immédiat des Données Corrompues
-- ============================================================

-- Supprimer TOUS les credits_engaged zombies (ils sont obsolètes)
DELETE FROM public.credits_engaged 
WHERE user_id = 'ecb4200a-52e5-4f07-a1a1-c5a10dd2e98d';

-- Nettoyer les jobs orphelins 'pending' de plus de 5 minutes
DELETE FROM public.jobs 
WHERE user_id = 'ecb4200a-52e5-4f07-a1a1-c5a10dd2e98d'
  AND status = 'pending'
  AND created_at < NOW() - INTERVAL '5 minutes';

-- ============================================================
-- PHASE 2: FIX CRITIQUE du Trigger auto_manage_credits
-- Bug: Le trigger ne libérait JAMAIS les credits_engaged sur failed/error
-- ============================================================

CREATE OR REPLACE FUNCTION public.auto_manage_credits()
RETURNS TRIGGER AS $$
DECLARE
  engaged_feature TEXT;
  credit_column TEXT;
  current_credits INTEGER;
BEGIN
  -- Skip if status hasn't changed
  IF OLD.status = NEW.status THEN
    RETURN NEW;
  END IF;

  -- Find if there's an engaged credit for this job
  SELECT feature INTO engaged_feature 
  FROM public.credits_engaged 
  WHERE job_id = NEW.id 
  LIMIT 1;
  
  IF engaged_feature IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Map feature to credit column
  credit_column := CASE engaged_feature
    WHEN 'queries' THEN 'credits_queries_remaining'
    WHEN 'ideas' THEN 'credits_ideas_remaining'
    WHEN 'reports' THEN 'credits_reports_remaining'
    ELSE 'credits_ideas_remaining'
  END;

  -- ✅ DEBIT on completion
  IF NEW.status = 'completed' AND OLD.status NOT IN ('completed', 'failed', 'error') THEN
    EXECUTE format('
      SELECT %I FROM public.user_credits 
      WHERE user_id = $1 
      FOR UPDATE
    ', credit_column)
    INTO current_credits
    USING NEW.user_id;
    
    IF current_credits > 0 THEN
      EXECUTE format('
        UPDATE public.user_credits 
        SET %I = %I - 1, 
            updated_at = NOW() 
        WHERE user_id = $1
      ', credit_column, credit_column)
      USING NEW.user_id;
      
      RAISE LOG '[CREDIT] Debited on completion: user=%, feature=%, job=%, remaining=%', 
        NEW.user_id, engaged_feature, NEW.id, current_credits - 1;
    ELSE
      RAISE WARNING '[CREDIT] Job % completed but no credits to debit (already 0)', NEW.id;
    END IF;
    
    -- Release engagement
    DELETE FROM public.credits_engaged WHERE job_id = NEW.id;
    
  -- ✅ RELEASE on failure/error (CRITICAL FIX - était absent avant)
  ELSIF NEW.status IN ('failed', 'error') AND OLD.status NOT IN ('completed', 'failed', 'error') THEN
    DELETE FROM public.credits_engaged WHERE job_id = NEW.id;
    RAISE LOG '[CREDIT] Released on failure: user=%, job=%, status=%', 
      NEW.user_id, NEW.id, NEW.status;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- ============================================================
-- PHASE 3: Fonction de Cleanup Automatique
-- Purge les engagements zombies toutes les 5 minutes
-- ============================================================

-- Note: La fonction cleanup_stale_engaged_credits() existe déjà
-- On la met à jour pour être plus agressive

CREATE OR REPLACE FUNCTION public.cleanup_stale_engaged_credits()
RETURNS void AS $$
DECLARE
  cleaned_count INT;
BEGIN
  -- Supprimer les engagements qui n'ont pas de job actif associé
  -- OU qui sont engagés depuis plus de 10 minutes
  DELETE FROM public.credits_engaged ce
  WHERE NOT EXISTS (
    SELECT 1 FROM public.jobs j
    WHERE j.id = ce.job_id 
      AND j.status IN ('pending', 'running')
  )
  OR ce.engaged_at < NOW() - INTERVAL '10 minutes';
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  
  IF cleaned_count > 0 THEN
    RAISE LOG '[CLEANUP] Purged % stale credits_engaged entries', cleaned_count;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';