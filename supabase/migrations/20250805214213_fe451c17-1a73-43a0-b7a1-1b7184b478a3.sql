-- Créer une politique pour permettre la lecture publique de asset_profiles
CREATE POLICY "Allow public read access to asset_profiles" 
ON public.asset_profiles 
FOR SELECT 
USING (true);

-- Créer une politique pour permettre la lecture publique de prices si elle n'existe pas déjà
DROP POLICY IF EXISTS "Anyone can view prices" ON public.prices;
CREATE POLICY "Anyone can view prices" 
ON public.prices 
FOR SELECT 
USING (true);