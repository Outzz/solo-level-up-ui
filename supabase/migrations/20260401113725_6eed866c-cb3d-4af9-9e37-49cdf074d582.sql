
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, hunter_name, xp, level, streak, xp_to_next)
  VALUES (NEW.id, public.generate_hunter_name(), 0, 1, 0, 500);
  
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
  
  INSERT INTO public.missions (user_id, name, xp, type, icon, completed) VALUES
    (NEW.id, 'Acordar às 6h', 50, 'daily', '🌅', false),
    (NEW.id, 'Treinar 1 hora', 50, 'daily', '💪', false),
    (NEW.id, 'Ler 30 páginas', 50, 'daily', '📖', false),
    (NEW.id, 'Meditar 15 min', 50, 'daily', '🧘', false),
    (NEW.id, 'Estudar 2 horas', 50, 'daily', '📚', false),
    (NEW.id, 'Correr 5km', 150, 'weekly', '🏃', false),
    (NEW.id, 'Projeto pessoal', 150, 'weekly', '🚀', false),
    (NEW.id, 'Revisão mensal de metas', 500, 'monthly', '🎯', false),
    (NEW.id, 'Desafio do mês', 500, 'monthly', '🏆', false);

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
$function$;
