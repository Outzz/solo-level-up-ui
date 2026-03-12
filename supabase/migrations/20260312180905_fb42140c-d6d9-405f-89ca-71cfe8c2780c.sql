
-- Storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Storage RLS policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

-- Add description columns to achievements and titles
ALTER TABLE public.achievements ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE public.titles ADD COLUMN IF NOT EXISTS min_level integer NOT NULL DEFAULT 1;

-- Update existing achievements with descriptions
UPDATE public.achievements SET description = 'Complete sua primeira missão para desbloquear' WHERE name = 'Primeira Missão';
UPDATE public.achievements SET description = 'Mantenha um streak de 7 dias seguidos' WHERE name = '7 Dias Seguidos';
UPDATE public.achievements SET description = 'Mantenha um streak de 30 dias seguidos' WHERE name = '30 Dias Seguidos';
UPDATE public.achievements SET description = 'Complete 100 missões no total' WHERE name = '100 Missões';
UPDATE public.achievements SET description = 'Alcance o nível 50' WHERE name = 'Nível 50';
UPDATE public.achievements SET description = 'Mantenha um streak de 30 dias' WHERE name = 'Streak 30';

-- Update existing title with description
UPDATE public.titles SET description = 'Todos começam aqui. Prove seu valor completando missões.', min_level = 1 WHERE title = 'Caçador Iniciante';

-- Update handle_new_user to add more achievements and titles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, hunter_name)
  VALUES (NEW.id, public.generate_hunter_name());
  
  INSERT INTO public.achievements (user_id, name, icon, unlocked, description) VALUES
    (NEW.id, 'Primeira Missão', '⚔️', false, 'Complete sua primeira missão para desbloquear'),
    (NEW.id, '7 Dias Seguidos', '🔥', false, 'Mantenha um streak de 7 dias seguidos'),
    (NEW.id, '30 Dias Seguidos', '💎', false, 'Mantenha um streak de 30 dias seguidos'),
    (NEW.id, '100 Missões', '🏆', false, 'Complete 100 missões no total'),
    (NEW.id, 'Nível 50', '👑', false, 'Alcance o nível 50'),
    (NEW.id, 'Streak 30', '⚡', false, 'Mantenha um streak de 30 dias'),
    (NEW.id, 'Madrugador', '🌅', false, 'Complete 10 missões antes das 8h'),
    (NEW.id, 'Guerreiro Semanal', '🗡️', false, 'Complete todas as missões semanais'),
    (NEW.id, 'Mestre das Missões', '🎯', false, 'Complete 500 missões no total'),
    (NEW.id, 'Lendário', '🐉', false, 'Alcance o nível 100'),
    (NEW.id, 'Imparável', '💪', false, 'Complete 50 missões sem falhar um dia'),
    (NEW.id, 'Colecionador', '📚', false, 'Desbloqueie 10 conquistas');
  
  INSERT INTO public.missions (user_id, name, xp, type, icon) VALUES
    (NEW.id, 'Acordar às 6h', 50, 'daily', '🌅'),
    (NEW.id, 'Treinar 1 hora', 100, 'daily', '💪'),
    (NEW.id, 'Ler 30 páginas', 75, 'daily', '📖'),
    (NEW.id, 'Meditar 15 min', 50, 'daily', '🧘'),
    (NEW.id, 'Estudar 2 horas', 120, 'daily', '📚'),
    (NEW.id, 'Correr 5km', 200, 'weekly', '🏃'),
    (NEW.id, 'Projeto pessoal', 300, 'weekly', '🚀');

  INSERT INTO public.titles (user_id, title, description, min_level) VALUES
    (NEW.id, 'Caçador Iniciante', 'Todos começam aqui. Prove seu valor completando missões.', 1),
    (NEW.id, 'Aprendiz das Sombras', 'As sombras começam a reconhecer seu potencial.', 5),
    (NEW.id, 'Guerreiro de Ferro', 'Sua determinação é tão forte quanto o aço.', 10),
    (NEW.id, 'Cavaleiro Arcano', 'Os segredos da magia começam a se revelar.', 20),
    (NEW.id, 'Mestre da Arena', 'Nenhum desafio é grande demais para você.', 30),
    (NEW.id, 'Senhor das Runas', 'O poder antigo flui através de suas veias.', 50),
    (NEW.id, 'Monarca Supremo', 'Você conquistou o respeito de todos os hunters.', 75),
    (NEW.id, 'Lenda Imortal', 'Seu nome será lembrado por toda a eternidade.', 100);

  RETURN NEW;
END;
$$;

-- Add avatar_url to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;
