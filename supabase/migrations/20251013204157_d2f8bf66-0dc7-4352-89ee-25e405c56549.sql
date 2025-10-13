-- 1. Drop trigger first, then function
DROP TRIGGER IF EXISTS sync_trade_setups_on_job_complete ON jobs;
DROP TRIGGER IF EXISTS sync_trade_setup_trigger ON jobs;
DROP FUNCTION IF EXISTS sync_trade_setup_from_job() CASCADE;

-- 2. Create improved trigger function with camelCase JSON parsing
CREATE OR REPLACE FUNCTION public.sync_trade_setup_from_job()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  setup_data jsonb;
  setup_item jsonb;
  direction_value text;
  entry_price_value numeric;
  stop_loss_value numeric;
  take_profit_value numeric;
  confidence_value numeric;
  rr_ratio_value numeric;
  timeframe_value text;
  strategy_value text;
BEGIN
  -- Only process completed AI Trade Setup jobs
  IF NEW.status = 'completed' AND NEW.feature = 'AI Trade Setup' AND NEW.response_payload IS NOT NULL THEN
    
    -- Extract setups array from response (support multiple structures)
    setup_data := COALESCE(
      NEW.response_payload->'content'->'setups',
      jsonb_build_array(NEW.response_payload->'content'),
      jsonb_build_array(NEW.response_payload)
    );
    
    -- Loop through each setup and insert/update
    FOR setup_item IN SELECT * FROM jsonb_array_elements(setup_data)
    LOOP
      -- Normalize direction
      direction_value := COALESCE(setup_item->>'direction', 'Long');
      direction_value := CASE 
        WHEN LOWER(direction_value) = 'long' THEN 'Long'
        WHEN LOWER(direction_value) = 'short' THEN 'Short'
        ELSE 'Long'
      END;
      
      -- Extract entry price (support camelCase and snake_case)
      entry_price_value := COALESCE(
        (setup_item->>'entryPrice')::numeric,
        (setup_item->>'entry_price')::numeric,
        (setup_item->>'entry')::numeric
      );
      
      -- Extract stop loss
      stop_loss_value := COALESCE(
        (setup_item->>'stopLoss')::numeric,
        (setup_item->>'stop_loss')::numeric,
        (setup_item->>'sl')::numeric
      );
      
      -- Extract take profit (support array and direct formats)
      take_profit_value := COALESCE(
        (setup_item->'takeProfits'->>0)::numeric,
        (setup_item->>'takeProfit')::numeric,
        (setup_item->>'take_profit')::numeric,
        (setup_item->'targets'->>0)::numeric,
        (setup_item->>'tp')::numeric
      );
      
      -- Extract confidence (support nested and direct)
      confidence_value := COALESCE(
        (setup_item->'strategyMeta'->>'confidence')::numeric,
        (setup_item->>'confidence')::numeric
      );
      
      -- Extract risk/reward ratio
      rr_ratio_value := COALESCE(
        (setup_item->>'riskRewardRatio')::numeric,
        (setup_item->>'risk_reward_ratio')::numeric
      );
      
      -- Extract timeframe
      timeframe_value := COALESCE(
        setup_item->>'timeframe',
        setup_item->>'timeFrame'
      );
      
      -- Extract strategy
      strategy_value := COALESCE(
        setup_item->>'strategy',
        setup_item->'strategyMeta'->>'name'
      );
      
      -- Only insert if we have a valid entry price
      IF entry_price_value IS NOT NULL AND entry_price_value > 0 THEN
        INSERT INTO public.ai_trade_setups (
          user_id,
          job_id,
          instrument,
          direction,
          entry_price,
          stop_loss,
          take_profit_1,
          take_profit_2,
          take_profit_3,
          confidence,
          risk_reward_ratio,
          timeframe,
          strategy,
          raw_response,
          status,
          outcome
        ) VALUES (
          NEW.user_id,
          NEW.id,
          COALESCE(
            setup_item->>'instrument',
            NEW.request_payload->>'instrument',
            'UNKNOWN'
          ),
          direction_value,
          entry_price_value,
          stop_loss_value,
          take_profit_value,
          (setup_item->'takeProfits'->>1)::numeric,
          (setup_item->'takeProfits'->>2)::numeric,
          confidence_value,
          rr_ratio_value,
          timeframe_value,
          strategy_value,
          setup_item,
          'active',
          'open'
        )
        ON CONFLICT (job_id) DO UPDATE SET
          entry_price = EXCLUDED.entry_price,
          stop_loss = EXCLUDED.stop_loss,
          take_profit_1 = EXCLUDED.take_profit_1,
          take_profit_2 = EXCLUDED.take_profit_2,
          take_profit_3 = EXCLUDED.take_profit_3,
          confidence = EXCLUDED.confidence,
          risk_reward_ratio = EXCLUDED.risk_reward_ratio,
          timeframe = EXCLUDED.timeframe,
          strategy = EXCLUDED.strategy,
          raw_response = EXCLUDED.raw_response;
      END IF;
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 3. Recreate the trigger
CREATE TRIGGER sync_trade_setups_on_job_complete
AFTER INSERT OR UPDATE ON jobs
FOR EACH ROW
EXECUTE FUNCTION sync_trade_setup_from_job();

-- 4. Create backfill function for historical data
CREATE OR REPLACE FUNCTION public.backfill_ai_trade_setups()
RETURNS TABLE(updated_count bigint, skipped_count bigint) AS $$
DECLARE
  job_record RECORD;
  setup_item jsonb;
  setup_data jsonb;
  updated_rows bigint := 0;
  skipped_rows bigint := 0;
  entry_price_value numeric;
  stop_loss_value numeric;
  take_profit_value numeric;
  confidence_value numeric;
  rr_ratio_value numeric;
  timeframe_value text;
  strategy_value text;
BEGIN
  -- For each completed AI Trade Setup job
  FOR job_record IN 
    SELECT id, user_id, response_payload, request_payload
    FROM jobs 
    WHERE feature = 'AI Trade Setup' 
      AND status = 'completed'
      AND response_payload IS NOT NULL
  LOOP
    -- Extract setups array
    setup_data := COALESCE(
      job_record.response_payload->'content'->'setups',
      jsonb_build_array(job_record.response_payload->'content'),
      jsonb_build_array(job_record.response_payload)
    );
    
    -- Parse setup data
    FOR setup_item IN 
      SELECT * FROM jsonb_array_elements(setup_data)
    LOOP
      -- Extract entry price
      entry_price_value := COALESCE(
        (setup_item->>'entryPrice')::numeric,
        (setup_item->>'entry_price')::numeric,
        (setup_item->>'entry')::numeric
      );
      
      -- Skip if no valid entry price
      IF entry_price_value IS NULL OR entry_price_value <= 0 THEN
        skipped_rows := skipped_rows + 1;
        CONTINUE;
      END IF;
      
      -- Extract other values
      stop_loss_value := COALESCE(
        (setup_item->>'stopLoss')::numeric,
        (setup_item->>'stop_loss')::numeric,
        (setup_item->>'sl')::numeric
      );
      
      take_profit_value := COALESCE(
        (setup_item->'takeProfits'->>0)::numeric,
        (setup_item->>'takeProfit')::numeric,
        (setup_item->>'take_profit')::numeric,
        (setup_item->'targets'->>0)::numeric,
        (setup_item->>'tp')::numeric
      );
      
      confidence_value := COALESCE(
        (setup_item->'strategyMeta'->>'confidence')::numeric,
        (setup_item->>'confidence')::numeric
      );
      
      rr_ratio_value := COALESCE(
        (setup_item->>'riskRewardRatio')::numeric,
        (setup_item->>'risk_reward_ratio')::numeric
      );
      
      timeframe_value := COALESCE(
        setup_item->>'timeframe',
        setup_item->>'timeFrame'
      );
      
      strategy_value := COALESCE(
        setup_item->>'strategy',
        setup_item->'strategyMeta'->>'name'
      );
      
      -- Update existing record
      UPDATE ai_trade_setups
      SET
        entry_price = entry_price_value,
        stop_loss = stop_loss_value,
        take_profit_1 = take_profit_value,
        take_profit_2 = (setup_item->'takeProfits'->>1)::numeric,
        take_profit_3 = (setup_item->'takeProfits'->>2)::numeric,
        confidence = confidence_value,
        risk_reward_ratio = rr_ratio_value,
        timeframe = COALESCE(timeframe_value, timeframe),
        strategy = COALESCE(strategy_value, strategy),
        raw_response = setup_item
      WHERE job_id = job_record.id;
      
      IF FOUND THEN
        updated_rows := updated_rows + 1;
      END IF;
    END LOOP;
  END LOOP;
  
  RETURN QUERY SELECT updated_rows, skipped_rows;
END;
$$ LANGUAGE plpgsql;

-- 5. Create monitoring view for incomplete trade setups
CREATE OR REPLACE VIEW incomplete_trade_setups AS
SELECT 
  id,
  instrument,
  direction,
  entry_price,
  stop_loss,
  take_profit_1,
  confidence,
  created_at,
  CASE 
    WHEN entry_price IS NULL OR entry_price <= 0 THEN 'Invalid/missing entry_price'
    WHEN stop_loss IS NULL THEN 'Missing stop_loss'
    WHEN take_profit_1 IS NULL THEN 'Missing take_profit'
    WHEN confidence IS NULL THEN 'Missing confidence'
    ELSE 'Unknown issue'
  END as issue
FROM ai_trade_setups
WHERE entry_price IS NULL 
   OR entry_price <= 0
   OR stop_loss IS NULL 
   OR take_profit_1 IS NULL
   OR confidence IS NULL;

-- 6. Execute the backfill to fix historical data
SELECT * FROM backfill_ai_trade_setups();