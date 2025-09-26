-- Assign super_user role to the current authenticated user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('ecb4200a-52e5-4f07-a1a1-c5a10dd2e98d', 'super_user') 
ON CONFLICT (user_id, role) DO NOTHING;