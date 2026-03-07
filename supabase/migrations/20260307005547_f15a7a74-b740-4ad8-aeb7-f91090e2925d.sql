-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  hunter_name TEXT NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  xp INTEGER NOT NULL DEFAULT 0,
  xp_to_next INTEGER NOT NULL DEFAULT 500,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Missions table
CREATE TABLE public.missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  xp INTEGER NOT NULL DEFAULT 50,
  type TEXT NOT NULL DEFAULT 'daily' CHECK (type IN ('daily', 'weekly')),
  completed BOOLEAN NOT NULL DEFAULT false,
  icon TEXT NOT NULL DEFAULT '⚔️',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own missions" ON public.missions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own missions" ON public.missions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own missions" ON public.missions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own missions" ON public.missions FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Progress tracking table
CREATE TABLE public.daily_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  missions_completed INTEGER NOT NULL DEFAULT 0,
  missions_total INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON public.daily_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.daily_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.daily_progress FOR UPDATE USING (auth.uid() = user_id);

-- Achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  unlocked BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own achievements" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own achievements" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own achievements" ON public.achievements FOR UPDATE USING (auth.uid() = user_id);

-- Titles table
CREATE TABLE public.titles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own titles" ON public.titles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own titles" ON public.titles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to generate random hunter name
CREATE OR REPLACE FUNCTION public.generate_hunter_name()
RETURNS TEXT AS $$
DECLARE
  prefixes TEXT[] := ARRAY['Shadow', 'Dark', 'Iron', 'Storm', 'Frost', 'Flame', 'Blood', 'Steel', 'Night', 'Void', 'Thunder', 'Crimson', 'Phantom', 'Savage', 'Lunar', 'Solar', 'Arcane', 'Mystic', 'Rune', 'Doom'];
  suffixes TEXT[] := ARRAY['Hunter', 'Slayer', 'Monarch', 'Knight', 'Warrior', 'Blade', 'Reaper', 'Walker', 'Striker', 'Warden', 'Seeker', 'Guardian', 'Breaker', 'Forger', 'Bringer', 'Lord', 'Master', 'Champion', 'Titan', 'Phantom'];
  random_num INTEGER;
BEGIN
  random_num := floor(random() * 9000 + 1000)::INTEGER;
  RETURN prefixes[1 + floor(random() * array_length(prefixes, 1))::INTEGER] || ' ' || suffixes[1 + floor(random() * array_length(suffixes, 1))::INTEGER] || ' #' || random_num;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, hunter_name)
  VALUES (NEW.id, public.generate_hunter_name());
  
  INSERT INTO public.achievements (user_id, name, icon, unlocked) VALUES
    (NEW.id, 'Primeira Missão', '⚔️', false),
    (NEW.id, '7 Dias Seguidos', '🔥', false),
    (NEW.id, '30 Dias Seguidos', '💎', false),
    (NEW.id, '100 Missões', '🏆', false),
    (NEW.id, 'Nível 50', '👑', false),
    (NEW.id, 'Streak 30', '⚡', false);
  
  INSERT INTO public.missions (user_id, name, xp, type, icon) VALUES
    (NEW.id, 'Acordar às 6h', 50, 'daily', '🌅'),
    (NEW.id, 'Treinar 1 hora', 100, 'daily', '💪'),
    (NEW.id, 'Ler 30 páginas', 75, 'daily', '📖'),
    (NEW.id, 'Meditar 15 min', 50, 'daily', '🧘'),
    (NEW.id, 'Estudar 2 horas', 120, 'daily', '📚'),
    (NEW.id, 'Correr 5km', 200, 'weekly', '🏃'),
    (NEW.id, 'Projeto pessoal', 300, 'weekly', '🚀');

  INSERT INTO public.titles (user_id, title) VALUES
    (NEW.id, 'Caçador Iniciante');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();