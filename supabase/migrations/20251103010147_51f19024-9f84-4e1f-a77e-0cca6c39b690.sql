-- Table news_feed avec RLS policies
CREATE TABLE IF NOT EXISTS public.news_feed (
  id BIGINT PRIMARY KEY,
  category TEXT NOT NULL,
  datetime TIMESTAMPTZ NOT NULL,
  headline TEXT NOT NULL,
  image TEXT,
  source TEXT NOT NULL,
  summary TEXT,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index performance
CREATE INDEX IF NOT EXISTS idx_news_feed_created_at ON public.news_feed(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_feed_category ON public.news_feed(category);

-- RLS Policies (lecture publique)
ALTER TABLE public.news_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read news" ON public.news_feed
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage news" ON public.news_feed
  FOR ALL USING (auth.role() = 'service_role');