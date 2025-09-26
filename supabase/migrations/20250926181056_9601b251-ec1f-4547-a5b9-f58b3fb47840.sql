-- Create plan type enum
CREATE TYPE public.plan_type AS ENUM ('basic', 'standard', 'premium', 'free_trial', 'broker_free');

-- Create plan_parameters table (managed by Super Admins only)
CREATE TABLE public.plan_parameters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_type plan_type NOT NULL UNIQUE,
  max_queries INTEGER NOT NULL DEFAULT 0,
  max_ideas INTEGER NOT NULL DEFAULT 0,
  max_reports INTEGER NOT NULL DEFAULT 0,
  trial_duration_days INTEGER DEFAULT 7,
  renewal_cycle_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_credits table
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_type plan_type NOT NULL DEFAULT 'free_trial',
  credits_queries_remaining INTEGER NOT NULL DEFAULT 0,
  credits_ideas_remaining INTEGER NOT NULL DEFAULT 0,
  credits_reports_remaining INTEGER NOT NULL DEFAULT 0,
  last_reset_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.plan_parameters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;

-- RLS policies for plan_parameters (Super Admin only)
CREATE POLICY "Only super users can manage plan parameters"
ON public.plan_parameters
FOR ALL
USING (has_role(auth.uid(), 'super_user'::app_role));

-- RLS policies for user_credits
CREATE POLICY "Users can view their own credits"
ON public.user_credits
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
ON public.user_credits
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Super users and admins can view all credits"
ON public.user_credits
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_user'::app_role));

CREATE POLICY "Super users can manage all credits"
ON public.user_credits
FOR ALL
USING (has_role(auth.uid(), 'super_user'::app_role));

-- Create triggers for updating timestamps
CREATE TRIGGER update_plan_parameters_updated_at
BEFORE UPDATE ON public.plan_parameters
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER update_user_credits_updated_at
BEFORE UPDATE ON public.user_credits
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Insert default plan parameters
INSERT INTO public.plan_parameters (plan_type, max_queries, max_ideas, max_reports, trial_duration_days, renewal_cycle_days) VALUES
('free_trial', 5, 3, 1, 7, NULL),
('broker_free', 20, 10, 5, NULL, 30),
('basic', 50, 25, 10, NULL, 30),
('standard', 150, 75, 25, NULL, 30),
('premium', 500, 250, 100, NULL, 30);

-- Function to initialize user credits based on plan
CREATE OR REPLACE FUNCTION public.initialize_user_credits(target_user_id UUID, target_plan_type plan_type)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  plan_params RECORD;
BEGIN
  -- Get plan parameters
  SELECT * INTO plan_params FROM public.plan_parameters WHERE plan_type = target_plan_type;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan type % not found', target_plan_type;
  END IF;
  
  -- Insert or update user credits
  INSERT INTO public.user_credits (
    user_id,
    plan_type,
    credits_queries_remaining,
    credits_ideas_remaining,
    credits_reports_remaining,
    last_reset_date
  ) VALUES (
    target_user_id,
    target_plan_type,
    plan_params.max_queries,
    plan_params.max_ideas,
    plan_params.max_reports,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    plan_type = EXCLUDED.plan_type,
    credits_queries_remaining = EXCLUDED.credits_queries_remaining,
    credits_ideas_remaining = EXCLUDED.credits_ideas_remaining,
    credits_reports_remaining = EXCLUDED.credits_reports_remaining,
    last_reset_date = EXCLUDED.last_reset_date,
    updated_at = now();
END;
$$;

-- Function to decrement credits
CREATE OR REPLACE FUNCTION public.decrement_credit(target_user_id UUID, credit_type TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_credits INTEGER;
  update_column TEXT;
BEGIN
  -- Determine which column to update
  CASE credit_type
    WHEN 'queries' THEN update_column := 'credits_queries_remaining';
    WHEN 'ideas' THEN update_column := 'credits_ideas_remaining';
    WHEN 'reports' THEN update_column := 'credits_reports_remaining';
    ELSE RAISE EXCEPTION 'Invalid credit type: %', credit_type;
  END CASE;
  
  -- Get current credits and decrement if > 0
  EXECUTE format('
    UPDATE public.user_credits 
    SET %I = %I - 1, updated_at = now()
    WHERE user_id = $1 AND %I > 0
    RETURNING %I', update_column, update_column, update_column, update_column)
  INTO current_credits
  USING target_user_id;
  
  -- Return whether the decrement was successful
  RETURN current_credits IS NOT NULL;
END;
$$;