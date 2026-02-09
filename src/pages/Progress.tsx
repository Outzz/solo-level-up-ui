import { motion } from "framer-motion";
import GameCard from "@/components/GameCard";
import { mockWeeklyProgress, mockMonthlyProgress, mockMissions, mockPlayer } from "@/lib/mockData";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

const Progress = () => {
  const totalMissions = mockMissions.length;
  const completedMissions = mockMissions.filter(m => m.completed).length;
  const completionRate = Math.round((completedMissions / totalMissions) * 100);

  const weeklyData = mockWeeklyProgress.map(d => ({
    name: d.day,
    concluídas: d.completed,
    total: d.total,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-glow-blue text-accent">PROGRESSO</h1>
        <p className="text-muted-foreground font-body">Acompanhe sua evolução, Hunter</p>
      </div>

      {/* Completion rate */}
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
            <p className="text-muted-foreground text-sm">Streak atual: <span className="text-neon-gold font-bold">{mockPlayer.streak} dias 🔥</span></p>
          </div>
        </div>
      </GameCard>

      {/* Weekly chart */}
      <GameCard>
        <h2 className="font-display text-sm text-muted-foreground mb-4">PROGRESSO SEMANAL</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(240 12% 9%)",
                border: "1px solid hsl(260 30% 20%)",
                borderRadius: "8px",
                color: "hsl(220 20% 90%)",
                fontFamily: "Rajdhani",
              }}
            />
            <Bar dataKey="concluídas" fill="hsl(260 80% 55%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </GameCard>

      {/* Monthly progress */}
      <GameCard glowColor="green">
        <h2 className="font-display text-sm text-muted-foreground mb-4">PROGRESSO MENSAL</h2>
        <div className="space-y-4">
          {mockMonthlyProgress.map((week, i) => (
            <motion.div
              key={week.week}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex justify-between text-sm font-body mb-1">
                <span className="text-foreground">{week.week}</span>
                <span className="text-neon-green font-bold">{week.percentage}%</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-neon-purple to-neon-blue"
                  initial={{ width: 0 }}
                  animate={{ width: `${week.percentage}%` }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </GameCard>

      {/* History */}
      <GameCard>
        <h2 className="font-display text-sm text-muted-foreground mb-4">HISTÓRICO DE HÁBITOS</h2>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 28 }, (_, i) => {
            const intensity = Math.random();
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className="aspect-square rounded-sm"
                style={{
                  backgroundColor: intensity > 0.7
                    ? "hsl(260 80% 55%)"
                    : intensity > 0.4
                    ? "hsl(260 80% 55% / 0.5)"
                    : intensity > 0.1
                    ? "hsl(260 80% 55% / 0.2)"
                    : "hsl(var(--secondary))",
                }}
                title={`Dia ${i + 1}`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground font-body justify-end">
          <span>Menos</span>
          <div className="w-3 h-3 rounded-sm bg-secondary" />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(260 80% 55% / 0.2)" }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(260 80% 55% / 0.5)" }} />
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: "hsl(260 80% 55%)" }} />
          <span>Mais</span>
        </div>
      </GameCard>
    </div>
  );
};

export default Progress;
