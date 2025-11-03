-- ÉTAPE 2: Corriger le trigger de libération automatique et ajouter fonction de nettoyage

-- 1. Corriger la fonction auto_manage_credits pour gérer les transitions NULL → completed/failed
CREATE OR REPLACE FUNCTION public.auto_manage_credits()
RETURNS TRIGGER AS $$
DECLARE
  engaged_feature TEXT;
  credit_column TEXT;
BEGIN
  -- Vérifier si c'est une vraie transition de status (OLD.status != NEW.status)
  IF OLD.status = NEW.status THEN
    RETURN NEW; -- Pas de changement de status, ignorer
  END IF;

  -- Récupérer la feature depuis l'engagement
  SELECT feature INTO engaged_feature 
  FROM public.credits_engaged 
  WHERE job_id = NEW.id 
  LIMIT 1;
  
  -- Si pas d'engagement trouvé, ignorer
  IF engaged_feature IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- Mapper la feature vers la colonne de crédit
  credit_column := CASE engaged_feature
    WHEN 'queries' THEN 'credits_queries_remaining'
    WHEN 'ideas' THEN 'credits_ideas_remaining'
    WHEN 'reports' THEN 'credits_reports_remaining'
    ELSE 'credits_ideas_remaining'
  END;

  IF NEW.status = 'completed' AND OLD.status NOT IN ('completed', 'failed', 'error') THEN
    -- Job réussi : DÉBITER le crédit dans user_credits
    EXECUTE format('
      UPDATE public.user_credits
      SET %I = %I - 1, updated_at = now()
      WHERE user_id = $1 AND %I > 0
    ', credit_column, credit_column, credit_column)
    USING NEW.user_id;
    
    -- Libérer l'engagement
    DELETE FROM public.credits_engaged WHERE job_id = NEW.id;
    
    RAISE LOG 'Job % completed: 1 credit debited from % and engagement released', NEW.id, credit_column;
    
  ELSIF NEW.status IN ('failed', 'error') AND OLD.status NOT IN ('completed', 'failed', 'error') THEN
    -- Job échoué : JUSTE libérer l'engagement, AUCUN débit
    DELETE FROM public.credits_engaged WHERE job_id = NEW.id;
    
    RAISE LOG 'Job % failed: engagement released, NO credit debited', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- 2. Ajouter une fonction de nettoyage pour les jobs orphelins (> 24h)
CREATE OR REPLACE FUNCTION public.cleanup_stale_engaged_credits()
RETURNS void AS $$
DECLARE
  cleaned_count INT;
BEGIN
  -- Libérer les crédits engagés pour des jobs créés il y a plus de 24h et non terminés
  DELETE FROM public.credits_engaged
  WHERE job_id IN (
    SELECT id FROM public.jobs
    WHERE created_at < NOW() - INTERVAL '24 hours'
      AND status NOT IN ('completed', 'failed', 'error')
  );
  
  GET DIAGNOSTICS cleaned_count = ROW_COUNT;
  RAISE NOTICE 'Cleaned up % stale engaged credits (jobs > 24h old)', cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';