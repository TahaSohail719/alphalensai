-- Create ai_trade_setups table
CREATE TABLE public.ai_trade_setups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
  
  -- Core Trade Data
  instrument text NOT NULL,
  direction text NOT NULL CHECK (direction IN ('Long', 'Short')),
  entry_price numeric NOT NULL,
  stop_loss numeric,
  take_profit_1 numeric,
  take_profit_2 numeric,
  take_profit_3 numeric,
  
  -- Metadata
  confidence numeric CHECK (confidence >= 0 AND confidence <= 100),
  risk_reward_ratio numeric,
  timeframe text,
  strategy text,
  
  -- Raw AI Response (nullable for legacy data)
  raw_response jsonb,
  
  -- Status Tracking
  status text DEFAULT 'active' CHECK (status IN ('active', 'expired', 'archived')),
  outcome text CHECK (outcome IN ('tp_hit', 'sl_hit', 'open', 'manual_close')),
  
  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  expires_at timestamptz,
  
  -- Validation
  CONSTRAINT valid_prices CHECK (
    entry_price > 0 AND
    (stop_loss IS NULL OR stop_loss > 0) AND
    (take_profit_1 IS NULL OR take_profit_1 > 0)
  )
);

-- Indexes for performance
CREATE INDEX idx_ai_trade_setups_user_id ON public.ai_trade_setups(user_id);
CREATE INDEX idx_ai_trade_setups_instrument ON public.ai_trade_setups(instrument);
CREATE INDEX idx_ai_trade_setups_created_at ON public.ai_trade_setups(created_at DESC);
CREATE INDEX idx_ai_trade_setups_job_id ON public.ai_trade_setups(job_id);

-- Enable Row Level Security
ALTER TABLE public.ai_trade_setups ENABLE ROW LEVEL SECURITY;

-- Users can view their own setups
CREATE POLICY "Users can view own trade setups"
  ON public.ai_trade_setups FOR SELECT
  USING (auth.uid() = user_id);

-- Super users can view all setups (using user_roles table)
CREATE POLICY "Super users can view all trade setups"
  ON public.ai_trade_setups FOR SELECT
  USING (
    has_role(auth.uid(), 'super_user'::app_role) OR
    has_role(auth.uid(), 'admin'::app_role)
  );

-- Users can insert their own setups
CREATE POLICY "Users can insert own trade setups"
  ON public.ai_trade_setups FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own setups
CREATE POLICY "Users can update own trade setups"
  ON public.ai_trade_setups FOR UPDATE
  USING (auth.uid() = user_id);

-- Create function to sync trade setups from completed jobs
CREATE OR REPLACE FUNCTION public.sync_trade_setup_from_job()
RETURNS TRIGGER AS $$
DECLARE
  setup_data jsonb;
  setup_item jsonb;
  direction_value text;
  entry_price_value numeric;
BEGIN
  -- Only process completed AI Trade Setup jobs
  IF NEW.status = 'completed' AND NEW.feature = 'AI Trade Setup' AND NEW.response_payload IS NOT NULL THEN
    
    -- Extract setups array from response
    setup_data := NEW.response_payload->'content'->'setups';
    
    -- If no setups array, try direct setup object
    IF setup_data IS NULL THEN
      setup_data := jsonb_build_array(NEW.response_payload->'content');
    END IF;
    
    -- Loop through each setup and insert
    FOR setup_item IN SELECT * FROM jsonb_array_elements(setup_data)
    LOOP
      -- Normalize direction to capitalized format
      direction_value := COALESCE(setup_item->>'direction', 'Long');
      direction_value := CASE 
        WHEN LOWER(direction_value) = 'long' THEN 'Long'
        WHEN LOWER(direction_value) = 'short' THEN 'Short'
        ELSE 'Long'
      END;
      
      -- Extract entry price (skip if invalid)
      entry_price_value := COALESCE((setup_item->>'entry_price')::numeric, (setup_item->>'entry')::numeric);
      
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
          (setup_item->>'stop_loss')::numeric,
          (setup_item->'targets'->>0)::numeric,
          (setup_item->'targets'->>1)::numeric,
          (setup_item->'targets'->>2)::numeric,
          (setup_item->>'confidence')::numeric,
          (setup_item->>'risk_reward_ratio')::numeric,
          setup_item->>'timeframe',
          setup_item->>'strategy',
          setup_item,
          'active',
          'open'
        )
        ON CONFLICT DO NOTHING;
      END IF;
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to jobs table
CREATE TRIGGER sync_trade_setups_on_job_complete
  AFTER UPDATE ON public.jobs
  FOR EACH ROW
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION public.sync_trade_setup_from_job();

-- Backfill existing completed trade setups from jobs table (skip invalid entries)
INSERT INTO public.ai_trade_setups (
  user_id, job_id, instrument, direction, entry_price, stop_loss,
  take_profit_1, take_profit_2, take_profit_3, confidence, raw_response, created_at, status, outcome
)
SELECT 
  j.user_id,
  j.id,
  COALESCE(
    j.response_payload->'content'->'setups'->0->>'instrument',
    j.response_payload->'content'->>'instrument',
    j.request_payload->>'instrument',
    'UNKNOWN'
  ),
  CASE 
    WHEN LOWER(COALESCE(
      j.response_payload->'content'->'setups'->0->>'direction',
      j.response_payload->'content'->>'direction',
      'Long'
    )) = 'long' THEN 'Long'
    WHEN LOWER(COALESCE(
      j.response_payload->'content'->'setups'->0->>'direction',
      j.response_payload->'content'->>'direction',
      'Long'
    )) = 'short' THEN 'Short'
    ELSE 'Long'
  END,
  COALESCE(
    (j.response_payload->'content'->'setups'->0->>'entry_price')::numeric,
    (j.response_payload->'content'->'setups'->0->>'entry')::numeric,
    (j.response_payload->'content'->>'entry_price')::numeric,
    1  -- Fallback to 1 if no entry price found
  ),
  (j.response_payload->'content'->'setups'->0->>'stop_loss')::numeric,
  (j.response_payload->'content'->'setups'->0->'targets'->>0)::numeric,
  (j.response_payload->'content'->'setups'->0->'targets'->>1)::numeric,
  (j.response_payload->'content'->'setups'->0->'targets'->>2)::numeric,
  (j.response_payload->'content'->'setups'->0->>'confidence')::numeric,
  COALESCE(
    j.response_payload->'content'->'setups'->0,
    j.response_payload->'content',
    '{}'::jsonb  -- Empty JSON if null
  ),
  j.created_at,
  'active',
  'open'
FROM public.jobs j
WHERE j.feature = 'AI Trade Setup'
  AND j.status = 'completed'
  AND j.response_payload IS NOT NULL
  AND COALESCE(
    (j.response_payload->'content'->'setups'->0->>'entry_price')::numeric,
    (j.response_payload->'content'->'setups'->0->>'entry')::numeric,
    (j.response_payload->'content'->>'entry_price')::numeric,
    1
  ) > 0  -- Only insert rows with valid entry prices
ON CONFLICT DO NOTHING;