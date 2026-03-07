import { motion } from "framer-motion";
import GameCard from "@/components/GameCard";
import { useProfile, useMissions } from "@/hooks/useProfile";

const Progress = () => {
  const { data: profile } = useProfile();
  const { data: missions = [] } = useMissions();

  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.completed).length;
  const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-glow-blue text-accent">PROGRESSO</h1>
        <p className="text-muted-foreground font-body">Acompanhe sua evolução, Hunter</p>
      </div>

      <GameCard glowColor="blue">
        <h2 className="font-display text-sm text-muted-foreground mb-4">TAXA DE CONCLUSÃO</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
              <motion.circle
                cx="50" cy="50" r="42" fill="none"
                stroke="hsl(var(--accent))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={264}
                initial={{ strokeDashoffset: 264 }}
                animate={{ strokeDashoffset: 264 - (264 * completionRate / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-display font-bold text-accent">{completionRate}%</span>
            </div>
          </div>
          <div className="space-y-2 font-body">
            <p className="text-foreground"><span className="text-neon-green font-bold">{completedMissions}</span> missões completas</p>
            <p className="text-muted-foreground">{totalMissions - completedMissions} restantes</p>
            <p className="text-muted-foreground text-sm">Streak atual: <span className="text-neon-gold font-bold">{profile?.streak ?? 0} dias 🔥</span></p>
          </div>
        </div>
      </GameCard>

      <GameCard>
        <h2 className="font-display text-sm text-muted-foreground mb-4">RESUMO DE MISSÕES</h2>
        <div className="space-y-3">
          {missions.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-lg">{m.icon}</span>
                <span className={`font-body text-sm ${m.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{m.name}</span>
              </div>
              <span className={`text-xs font-display ${m.completed ? "text-neon-green" : "text-muted-foreground"}`}>
                {m.completed ? "✓" : `+${m.xp} XP`}
              </span>
            </motion.div>
          ))}
          {missions.length === 0 && (
            <p className="text-muted-foreground font-body text-center py-4">Nenhuma missão ainda.</p>
          )}
        </div>
      </GameCard>
    </div>
  );
};

export default Progress;
