-- Create table for caching historical price data from TwelveData
CREATE TABLE IF NOT EXISTS price_history_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instrument TEXT NOT NULL,
  interval TEXT NOT NULL, -- '1day', '1hour', etc.
  date DATE NOT NULL,
  open NUMERIC NOT NULL,
  high NUMERIC NOT NULL,
  low NUMERIC NOT NULL,
  close NUMERIC NOT NULL,
  volume NUMERIC,
  fetched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(instrument, interval, date)
);

-- Index for fast lookups
CREATE INDEX idx_price_cache_lookup ON price_history_cache(instrument, interval, date);

-- Index for cleanup jobs
CREATE INDEX idx_price_cache_cleanup ON price_history_cache(fetched_at);

-- Enable RLS
ALTER TABLE price_history_cache ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read cached prices
CREATE POLICY "Authenticated users can read price cache"
  ON price_history_cache
  FOR SELECT
  TO authenticated
  USING (true);