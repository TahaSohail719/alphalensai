-- Allow public read access to plan_parameters
CREATE POLICY "Anyone can view plan parameters"
ON public.plan_parameters
FOR SELECT
USING (true);