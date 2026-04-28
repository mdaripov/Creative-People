ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reports_authenticated_select"
ON public.reports
FOR SELECT
TO authenticated
USING (true);