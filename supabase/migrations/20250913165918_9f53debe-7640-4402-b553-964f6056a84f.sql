-- Create ai_interactions table for logging user AI interactions
CREATE TABLE public.ai_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL CHECK (feature_name IN ('trade_setup', 'market_commentary', 'report')),
  user_query TEXT NOT NULL,
  ai_response JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own AI interactions" 
ON public.ai_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own AI interactions" 
ON public.ai_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for efficient queries
CREATE INDEX idx_ai_interactions_user_created 
ON public.ai_interactions (user_id, created_at DESC);

CREATE INDEX idx_ai_interactions_feature 
ON public.ai_interactions (user_id, feature_name, created_at DESC);