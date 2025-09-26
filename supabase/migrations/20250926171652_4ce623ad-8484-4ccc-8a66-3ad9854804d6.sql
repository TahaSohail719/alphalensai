-- ROLLBACK-SAFE MIGRATION TO FIX PROFILES RLS RECURSION AND ENSURE ADMIN ACCESS

-- 1) Create roles enum and user_roles table (idempotent)
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin','moderator','user','super_user');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2) Role check function (uses user_roles, NOT profiles)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- 3) Update existing helper to avoid profiles recursion anywhere it's used
CREATE OR REPLACE FUNCTION public.is_admin_or_super_user(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.has_role(is_admin_or_super_user.user_id, 'admin')
      OR public.has_role(is_admin_or_super_user.user_id, 'super_user');
$function$;

-- 4) Backfill user_roles from profiles and ensure every user has a 'user' role
INSERT INTO public.user_roles (user_id, role)
SELECT p.user_id, p.role::public.app_role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON ur.user_id = p.user_id AND ur.role = p.role::public.app_role
WHERE ur.user_id IS NULL;

INSERT INTO public.user_roles (user_id, role)
SELECT u.id, 'user'::public.app_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON ur.user_id = u.id AND ur.role = 'user'
WHERE ur.user_id IS NULL;

-- 5) Fix recursive policies on profiles: drop ones that reference profiles and recreate using has_role
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins and super users can update all profiles') THEN
    DROP POLICY "Admins and super users can update all profiles" ON public.profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins and super users can view all profiles') THEN
    DROP POLICY "Admins and super users can view all profiles" ON public.profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins can update profiles in their broker') THEN
    DROP POLICY "Admins can update profiles in their broker" ON public.profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins can view profiles in their broker') THEN
    DROP POLICY "Admins can view profiles in their broker" ON public.profiles;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='profiles' 
      AND policyname='Admins and super users can view all profiles (roles table)'
  ) THEN
    CREATE POLICY "Admins and super users can view all profiles (roles table)"
    ON public.profiles
    FOR SELECT
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_user'));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='profiles' 
      AND policyname='Admins and super users can update all profiles (roles table)'
  ) THEN
    CREATE POLICY "Admins and super users can update all profiles (roles table)"
    ON public.profiles
    FOR UPDATE
    USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'super_user'));
  END IF;
END $$;

-- 6) Ensure handle_new_user also inserts default role, and create trigger if missing
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  broker_uuid UUID;
BEGIN
  -- Broker association from metadata if available
  IF NEW.raw_user_meta_data ->> 'broker_id' IS NOT NULL THEN
    broker_uuid := (NEW.raw_user_meta_data ->> 'broker_id')::UUID;
  ELSE
    IF NEW.raw_user_meta_data ->> 'broker_name' IS NOT NULL THEN
      SELECT id INTO broker_uuid 
      FROM public.brokers 
      WHERE name = NEW.raw_user_meta_data ->> 'broker_name'
      LIMIT 1;
    END IF;
  END IF;

  INSERT INTO public.profiles (user_id, broker_name, broker_id, status, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'broker_name',
    broker_uuid,
    'pending',
    'user'
  )
  ON CONFLICT DO NOTHING;

  -- Assign default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN NEW;
END;
$function$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created'
  ) THEN
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  END IF;
END $$;

-- 7) Backfill missing profiles for existing users (safe defaults)
INSERT INTO public.profiles (user_id, status, role)
SELECT u.id, 'pending', 'user'
FROM auth.users u
LEFT JOIN public.profiles p ON p.user_id = u.id
WHERE p.user_id IS NULL;
