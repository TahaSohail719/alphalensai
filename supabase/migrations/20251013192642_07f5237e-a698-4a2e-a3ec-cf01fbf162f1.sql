-- Create normalized_trade_setups table
CREATE TABLE IF NOT EXISTS public.normalized_trade_setups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  instrument TEXT,
  direction TEXT,
  entry_price FLOAT,
  tp FLOAT,
  sl FLOAT,
  confidence FLOAT,
  ai_generated_at TIMESTAMPTZ DEFAULT now(),
  source_feature TEXT DEFAULT 'AI_TRADE_SETUP',
  raw_json JSONB,
  performance_outcome TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.normalized_trade_setups ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own trade setups"
  ON public.normalized_trade_setups
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trade setups"
  ON public.normalized_trade_setups
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super users can view all trade setups"
  ON public.normalized_trade_setups
  FOR SELECT
  USING (has_role(auth.uid(), 'super_user') OR has_role(auth.uid(), 'admin'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_normalized_trade_setups_user_id 
  ON public.normalized_trade_setups(user_id);

CREATE INDEX IF NOT EXISTS idx_normalized_trade_setups_instrument 
  ON public.normalized_trade_setups(instrument);

-- Create trigger function
CREATE OR REPLACE FUNCTION public.sync_ai_trade_setups()
RETURNS TRIGGER AS $$
DECLARE
  trade_data JSONB;
  inst TEXT;
  dir TEXT;
  entry_val FLOAT;
  tp_val FLOAT;
  sl_val FLOAT;
  conf FLOAT;
BEGIN
  -- Only process completed AI Trade Setup jobs
  IF NEW.status = 'completed' AND (NEW.feature = 'AI Trade Setup' OR NEW.feature = 'ai_trade_setup') THEN

    -- Extract response payload
    trade_data := NEW.response_payload;

    -- Extract values with flexible JSON paths to handle LLM response variability
    inst := COALESCE(
      trade_data->>'instrument',
      trade_data->>'Instrument',
      trade_data->>'symbol',
      trade_data->'content'->>'instrument',
      NEW.request_payload->>'instrument'
    );

    dir := COALESCE(
      trade_data->>'direction',
      trade_data->>'Direction',
      trade_data->>'bias',
      trade_data->'content'->>'direction'
    );

    entry_val := COALESCE(
      (trade_data->>'entry_price')::FLOAT,
      (trade_data->>'entry')::FLOAT,
      (trade_data->'content'->>'entry_price')::FLOAT
    );

    tp_val := COALESCE(
      (trade_data->>'tp')::FLOAT,
      (trade_data->>'take_profit')::FLOAT,
      (trade_data->>'takeProfit')::FLOAT,
      (trade_data->'content'->>'tp')::FLOAT
    );

    sl_val := COALESCE(
      (trade_data->>'sl')::FLOAT,
      (trade_data->>'stop_loss')::FLOAT,
      (trade_data->>'stopLoss')::FLOAT,
      (trade_data->'content'->>'sl')::FLOAT
    );

    conf := COALESCE(
      (trade_data->>'confidence')::FLOAT,
      (trade_data->>'Confidence')::FLOAT,
      (trade_data->'content'->>'confidence')::FLOAT
    );

    -- Insert into normalized_trade_setups
    INSERT INTO public.normalized_trade_setups (
      user_id,
      instrument,
      direction,
      entry_price,
      tp,
      sl,
      confidence,
      ai_generated_at,
      source_feature,
      raw_json
    )
    VALUES (
      NEW.user_id,
      inst,
      dir,
      entry_val,
      tp_val,
      sl_val,
      conf,
      NOW(),
      'AI_TRADE_SETUP',
      trade_data
    )
    ON CONFLICT DO NOTHING;

  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trg_sync_ai_trade_setups ON public.jobs;

-- Create trigger on jobs table
CREATE TRIGGER trg_sync_ai_trade_setups
  AFTER UPDATE ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_ai_trade_setups();