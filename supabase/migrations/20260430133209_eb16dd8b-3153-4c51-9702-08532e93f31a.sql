-- Allow league_rewards.from_league/to_league to represent demotion when bonus_xp = 0 and to_league index < from_league index
-- Recreate process_league_promotions to also register demotions

CREATE OR REPLACE FUNCTION public.process_league_promotions()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  prev_week date := (date_trunc('week', CURRENT_DATE) - interval '7 days')::date;
  current_week date := date_trunc('week', CURRENT_DATE)::date;
  league_order text[] := ARRAY['bronze', 'prata', 'ouro', 'safira', 'rubi', 'esmeralda', 'ametista', 'diamante', 'mestre', 'lenda'];
  league_labels text[] := ARRAY['Bronze', 'Prata', 'Ouro', 'Safira', 'Rubi', 'Esmeralda', 'Ametista', 'Diamante', 'Mestre', 'Lenda'];
  bonus_xp int[] := ARRAY[0, 100, 200, 400, 600, 1000, 1500, 2500, 4000, 7500];
  r RECORD;
  current_idx integer;
  new_league text;
  new_idx integer;
  was_promoted boolean;
  was_demoted boolean;
  title_name text;
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
    
    was_promoted := false;
    was_demoted := false;
    
    IF r.pos <= 3 AND current_idx < array_length(league_order, 1) THEN
      new_idx := current_idx + 1;
      new_league := league_order[new_idx];
      was_promoted := true;
    ELSIF r.pos > (r.total - 3) AND r.total > 3 AND current_idx > 1 THEN
      new_idx := current_idx - 1;
      new_league := league_order[new_idx];
      was_demoted := true;
    ELSE
      new_league := r.league_name;
      new_idx := current_idx;
    END IF;
    
    UPDATE public.leagues SET position = r.pos WHERE user_id = r.user_id AND week_start = prev_week;
    
    INSERT INTO public.leagues (user_id, league_name, week_start, xp_earned)
    VALUES (r.user_id, new_league, current_week, 0)
    ON CONFLICT (user_id, week_start) DO UPDATE SET league_name = new_league;
    
    IF was_promoted THEN
      title_name := 'Campeão ' || league_labels[new_idx];
      
      UPDATE public.profiles
      SET xp = xp + bonus_xp[new_idx]
      WHERE user_id = r.user_id;
      
      INSERT INTO public.titles (user_id, title, description, min_level)
      VALUES (r.user_id, title_name, 'Promovido para a liga ' || league_labels[new_idx] || ' por excelência competitiva.', 1)
      ON CONFLICT DO NOTHING;
      
      INSERT INTO public.league_rewards (user_id, from_league, to_league, bonus_xp, title_earned)
      VALUES (r.user_id, r.league_name, new_league, bonus_xp[new_idx], title_name);
    ELSIF was_demoted THEN
      -- Register demotion (bonus_xp = 0, no title)
      INSERT INTO public.league_rewards (user_id, from_league, to_league, bonus_xp, title_earned)
      VALUES (r.user_id, r.league_name, new_league, 0, NULL);
    END IF;
  END LOOP;
END;
$function$;