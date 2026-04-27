CREATE TABLE IF NOT EXISTS public.controller_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  specialist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.controller_plan_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id TEXT NOT NULL,
  plan_id UUID NOT NULL REFERENCES public.controller_plans(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  done BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE public.controller_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.controller_plan_tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "controller_plans_select_policy" ON public.controller_plans;
DROP POLICY IF EXISTS "controller_plans_insert_policy" ON public.controller_plans;
DROP POLICY IF EXISTS "controller_plans_update_policy" ON public.controller_plans;
DROP POLICY IF EXISTS "controller_plans_delete_policy" ON public.controller_plans;

CREATE POLICY "controller_plans_select_policy"
ON public.controller_plans
FOR SELECT
TO authenticated
USING (
  auth.uid() = specialist_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
  )
);

CREATE POLICY "controller_plans_insert_policy"
ON public.controller_plans
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = specialist_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
  )
);

CREATE POLICY "controller_plans_update_policy"
ON public.controller_plans
FOR UPDATE
TO authenticated
USING (
  auth.uid() = specialist_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
  )
);

CREATE POLICY "controller_plans_delete_policy"
ON public.controller_plans
FOR DELETE
TO authenticated
USING (
  auth.uid() = specialist_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
  )
);

DROP POLICY IF EXISTS "controller_plan_tasks_select_policy" ON public.controller_plan_tasks;
DROP POLICY IF EXISTS "controller_plan_tasks_insert_policy" ON public.controller_plan_tasks;
DROP POLICY IF EXISTS "controller_plan_tasks_update_policy" ON public.controller_plan_tasks;
DROP POLICY IF EXISTS "controller_plan_tasks_delete_policy" ON public.controller_plan_tasks;

CREATE POLICY "controller_plan_tasks_select_policy"
ON public.controller_plan_tasks
FOR SELECT
TO authenticated
USING (
  auth.uid() = specialist_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
  )
);

CREATE POLICY "controller_plan_tasks_insert_policy"
ON public.controller_plan_tasks
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = specialist_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
  )
);

CREATE POLICY "controller_plan_tasks_update_policy"
ON public.controller_plan_tasks
FOR UPDATE
TO authenticated
USING (
  auth.uid() = specialist_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
  )
);

CREATE POLICY "controller_plan_tasks_delete_policy"
ON public.controller_plan_tasks
FOR DELETE
TO authenticated
USING (
  auth.uid() = specialist_id
  OR EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
  )
);