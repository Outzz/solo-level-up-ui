
-- Create leagues table to track weekly league assignments
CREATE TABLE public.leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  league_name text NOT NULL DEFAULT 'bronze',
  week_start date NOT NULL DEFAULT date_trunc('week', CURRENT_DATE)::date,
  xp_earned integer NOT NULL DEFAULT 0,
  position integer DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);

ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view league data" ON public.leagues
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert their own league" ON public.leagues
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own league" ON public.leagues
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Security definer function to get leaderboard for current week
CREATE OR REPLACE FUNCTION public.get_weekly_leaderboard()
RETURNS TABLE(
  user_id uuid,
  hunter_name text,
  avatar_url text,
  level integer,
  xp_earned integer,
  league_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    l.user_id,
    p.hunter_name,
    p.avatar_url,
    p.level,
    l.xp_earned,
    l.league_name
  FROM public.leagues l
  JOIN public.profiles p ON p.user_id = l.user_id
  WHERE l.week_start = date_trunc('week', CURRENT_DATE)::date
  ORDER BY l.xp_earned DESC
  LIMIT 50;
$$;

-- Function to ensure user has a league entry for current week
CREATE OR REPLACE FUNCTION public.ensure_league_entry(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_week date := date_trunc('week', CURRENT_DATE)::date;
  prev_league text;
BEGIN
  -- Check if entry exists
  IF EXISTS (SELECT 1 FROM public.leagues WHERE user_id = p_user_id AND week_start = current_week) THEN
    RETURN;
  END IF;
  
  -- Get previous league
  SELECT league_name INTO prev_league
  FROM public.leagues
  WHERE user_id = p_user_id
  ORDER BY week_start DESC
  LIMIT 1;
  
  INSERT INTO public.leagues (user_id, league_name, week_start, xp_earned)
  VALUES (p_user_id, COALESCE(prev_league, 'bronze'), current_week, 0);
END;
$$;

-- Function to add XP to league when mission completed
CREATE OR REPLACE FUNCTION public.add_league_xp(p_user_id uuid, p_xp integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_week date := date_trunc('week', CURRENT_DATE)::date;
BEGIN
  PERFORM public.ensure_league_entry(p_user_id);
  
  UPDATE public.leagues
  SET xp_earned = xp_earned + p_xp
  WHERE user_id = p_user_id AND week_start = current_week;
END;
$$;

-- Function to promote/demote leagues weekly (called by cron or edge function)
CREATE OR REPLACE FUNCTION public.process_league_promotions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_week date := (date_trunc('week', CURRENT_DATE) - interval '7 days')::date;
  current_week date := date_trunc('week', CURRENT_DATE)::date;
  league_order text[] := ARRAY['bronze', 'prata', 'ouro', 'safira', 'rubi', 'esmeralda', 'ametista', 'diamante', 'mestre', 'lenda'];
  r RECORD;
  total_in_league integer;
  user_position integer;
  current_idx integer;
  new_league text;
BEGIN
  FOR r IN 
    SELECT l.user_id, l.league_name, l.xp_earned,
           ROW_NUMBER() OVER (PARTITION BY l.league_name ORDER BY l.xp_earned DESC) as pos,
           COUNT(*) OVER (PARTITION BY l.league_name) as total
    FROM public.leagues l
    WHERE l.week_start = prev_week
  LOOP
    current_idx := array_position(league_order, r.league_name);
    IF current_idx IS NULL THEN current_idx := 1; END IF;
    
    -- Top 3 promote (if not max league)
    IF r.pos <= 3 AND current_idx < array_length(league_order, 1) THEN
      new_league := league_order[current_idx + 1];
    -- Bottom 3 demote (if not min league)  
    ELSIF r.pos > (r.total - 3) AND r.total > 3 AND current_idx > 1 THEN
      new_league := league_order[current_idx - 1];
    ELSE
      new_league := r.league_name;
    END IF;
    
    -- Update position
    UPDATE public.leagues SET position = r.pos WHERE user_id = r.user_id AND week_start = prev_week;
    
    -- Create new week entry
    INSERT INTO public.leagues (user_id, league_name, week_start, xp_earned)
    VALUES (r.user_id, new_league, current_week, 0)
    ON CONFLICT (user_id, week_start) DO UPDATE SET league_name = new_league;
  END LOOP;
END;
$$;
