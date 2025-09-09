-- Créer les profils manquants pour les utilisateurs existants
INSERT INTO public.profiles (user_id, broker_name, status, role)
SELECT 
  u.id as user_id,
  u.raw_user_meta_data->>'broker_name' as broker_name,
  'pending' as status,
  'user' as role
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE p.user_id IS NULL;

-- Mettre à jour le profil existant pour avoir l'email dans le meta-data pour référence
COMMENT ON TABLE public.profiles IS 'Profiles table with synchronized users from auth.users';