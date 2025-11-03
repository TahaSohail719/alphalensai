-- Update existing 'top news' category to 'general'
UPDATE public.news_feed SET category = 'general' WHERE category = 'top news';

-- Add CHECK constraint for category validation
ALTER TABLE public.news_feed 
  ADD CONSTRAINT valid_category 
  CHECK (category IN ('general', 'forex', 'crypto', 'merger'));

-- Composite index for optimized category + date queries
CREATE INDEX IF NOT EXISTS idx_news_feed_category_datetime 
  ON public.news_feed(category, datetime DESC);

-- User news preferences table
CREATE TABLE IF NOT EXISTS public.user_news_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  preferred_category TEXT DEFAULT 'general',
  last_viewed_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for user_news_preferences
ALTER TABLE public.user_news_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_news_preferences
CREATE POLICY "Users read own preferences" 
  ON public.user_news_preferences
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own preferences" 
  ON public.user_news_preferences
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own preferences" 
  ON public.user_news_preferences
  FOR UPDATE 
  USING (auth.uid() = user_id);