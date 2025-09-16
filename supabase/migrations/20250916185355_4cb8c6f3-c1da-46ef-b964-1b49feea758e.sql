-- Ajouter le champ feature à la table jobs
ALTER TABLE public.jobs 
ADD COLUMN feature text;

-- Ajouter une contrainte pour valider les valeurs autorisées
ALTER TABLE public.jobs 
ADD CONSTRAINT jobs_feature_check 
CHECK (feature IN ('AI Trade Setup', 'Macro Commentary', 'Report'));