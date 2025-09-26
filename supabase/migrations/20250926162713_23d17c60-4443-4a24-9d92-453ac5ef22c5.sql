-- Create brokers table
CREATE TABLE public.brokers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active',
  contact_email TEXT,
  logo_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on brokers table
ALTER TABLE public.brokers ENABLE ROW LEVEL SECURITY;

-- Create policies for brokers table
CREATE POLICY "Super users can manage all brokers" 
ON public.brokers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'super_user'
  )
);

CREATE POLICY "All authenticated users can read active brokers" 
ON public.brokers 
FOR SELECT 
USING (status = 'active');

-- Add broker_id column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN broker_id UUID REFERENCES public.brokers(id);

-- Create trigger for updated_at on brokers
CREATE TRIGGER update_brokers_updated_at
BEFORE UPDATE ON public.brokers
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

-- Migrate existing broker_name data to brokers table and set broker_id
DO $$
DECLARE
  broker_record RECORD;
  broker_uuid UUID;
BEGIN
  -- Insert distinct broker names into brokers table
  FOR broker_record IN 
    SELECT DISTINCT broker_name 
    FROM public.profiles 
    WHERE broker_name IS NOT NULL AND broker_name != ''
  LOOP
    INSERT INTO public.brokers (name) 
    VALUES (broker_record.broker_name)
    ON CONFLICT (name) DO NOTHING;
  END LOOP;

  -- Update profiles with broker_id based on broker_name
  FOR broker_record IN 
    SELECT id, name FROM public.brokers
  LOOP
    UPDATE public.profiles 
    SET broker_id = broker_record.id 
    WHERE broker_name = broker_record.name 
    AND broker_id IS NULL;
  END LOOP;
END $$;

-- Update RLS policies for profiles table to include broker scoping
CREATE POLICY "Admins can view profiles in their broker" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role = 'admin'
    AND admin_profile.broker_id = profiles.broker_id
  )
);

CREATE POLICY "Admins can update profiles in their broker" 
ON public.profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles admin_profile 
    WHERE admin_profile.user_id = auth.uid() 
    AND admin_profile.role = 'admin'
    AND admin_profile.broker_id = profiles.broker_id
  )
);