
-- Fix RLS policies to use authenticated role instead of public

-- missions
DROP POLICY IF EXISTS "Users can view their own missions" ON public.missions;
DROP POLICY IF EXISTS "Users can create their own missions" ON public.missions;
DROP POLICY IF EXISTS "Users can update their own missions" ON public.missions;
DROP POLICY IF EXISTS "Users can delete their own missions" ON public.missions;

CREATE POLICY "Users can view their own missions" ON public.missions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own missions" ON public.missions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own missions" ON public.missions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own missions" ON public.missions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- achievements
DROP POLICY IF EXISTS "Users can view their own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.achievements;
DROP POLICY IF EXISTS "Users can update their own achievements" ON public.achievements;

CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own achievements" ON public.achievements FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- titles
DROP POLICY IF EXISTS "Users can view their own titles" ON public.titles;
DROP POLICY IF EXISTS "Users can insert their own titles" ON public.titles;

CREATE POLICY "Users can view their own titles" ON public.titles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own titles" ON public.titles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- daily_progress
DROP POLICY IF EXISTS "Users can view their own progress" ON public.daily_progress;
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.daily_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.daily_progress;

CREATE POLICY "Users can view their own progress" ON public.daily_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.daily_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.daily_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enable pg_cron and pg_net for scheduled resets
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage on cron schema
GRANT USAGE ON SCHEMA cron TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA cron TO postgres;
