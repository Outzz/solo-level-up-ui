import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, CheckCircle, Calendar, TrendingUp, Star, Shield, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import GameCard from "@/components/GameCard";
import { useProfile, useMissions, useAchievements, useTitles } from "@/hooks/useProfile";

const Progress = () => {
  const { data: profile } = useProfile();
  const { data: missions = [] } = useMissions();
  const { data: achievements = [] } = useAchievements();
  const { data: titles = [] } = useTitles();
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);

  const totalMissions = missions.length;
  const completedMissions = missions.filter(m => m.completed).length;
  const completionRate = totalMissions > 0 ? Math.round((completedMissions / totalMissions) * 100) : 0;
  const totalXpEarned = missions.filter(m => m.completed).reduce((sum, m) => sum + m.xp, 0);

  // Mock weekly XP data based on real data
  const weeklyXpData = [
    { day: "Seg", xp: Math.round(totalXpEarned * 0.12) },
    { day: "Ter", xp: Math.round(totalXpEarned * 0.18) },
    { day: "Qua", xp: Math.round(totalXpEarned * 0.08) },
    { day: "Qui", xp: Math.round(totalXpEarned * 0.15) },
    { day: "Sex", xp: Math.round(totalXpEarned * 0.22) },
    { day: "Sáb", xp: Math.round(totalXpEarned * 0.14) },
    { day: "Dom", xp: Math.round(totalXpEarned * 0.11) },
  ];

  const monthlyData = [
    { week: "Sem 1", rate: Math.min(100, completionRate + 5) },
    { week: "Sem 2", rate: Math.min(100, completionRate - 10) },
    { week: "Sem 3", rate: Math.min(100, completionRate + 2) },
    { week: "Sem 4", rate: completionRate },
  ];

  // Habit history from missions
  const habitHistory = missions.slice(0, 5).map(m => {
    const rate = m.completed ? Math.floor(70 + Math.random() * 30) : Math.floor(30 + Math.random() * 40);
    const streak = m.completed ? Math.floor(3 + Math.random() * 12) : 0;
    return { name: m.name, icon: m.icon, rate, streak };
  });

  const statCards = [
    { label: "XP ESTA SEMANA", value: totalXpEarned, icon: TrendingUp, color: "text-neon-green" },
    { label: "MISSÕES FEITAS", value: completedMissions, icon: CheckCircle, color: "text-neon-blue" },
    { label: "TAXA CONCLUSÃO", value: `${completionRate}%`, icon: Calendar, color: "text-neon-purple" },
    { label: "MELHOR STREAK", value: `${profile?.streak ?? 0} dias`, icon: BarChart3, color: "text-neon-gold" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold text-glow-blue text-accent flex items-center gap-3">
          <BarChart3 size={28} /> PROGRESSO
        </h1>
        <p className="text-muted-foreground font-body">Acompanhe sua evolução</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <GameCard>
              <stat.icon size={18} className={stat.color + " mb-2"} />
              <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground font-display mt-1">{stat.label}</div>
            </GameCard>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GameCard>
          <h2 className="font-display text-sm text-muted-foreground mb-4 font-bold">XP Semanal</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyXpData}>
              <XAxis dataKey="day" stroke="hsl(220 10% 55%)" fontSize={12} fontFamily="Rajdhani" />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} fontFamily="Rajdhani" />
              <Tooltip
                contentStyle={{ background: "hsl(240 12% 9%)", border: "1px solid hsl(260 30% 20%)", borderRadius: 8, fontFamily: "Rajdhani" }}
                labelStyle={{ color: "hsl(220 20% 90%)" }}
              />
              <Bar dataKey="xp" fill="hsl(260 80% 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GameCard>

        <GameCard>
          <h2 className="font-display text-sm text-muted-foreground mb-4 font-bold">Conclusão Mensal (%)</h2>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={monthlyData}>
              <XAxis dataKey="week" stroke="hsl(220 10% 55%)" fontSize={12} fontFamily="Rajdhani" />
              <YAxis stroke="hsl(220 10% 55%)" fontSize={12} fontFamily="Rajdhani" domain={[0, 100]} />
              <Tooltip
                contentStyle={{ background: "hsl(240 12% 9%)", border: "1px solid hsl(260 30% 20%)", borderRadius: 8, fontFamily: "Rajdhani" }}
              />
              <defs>
                <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(200 100% 50%)" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="hsl(200 100% 50%)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="rate" stroke="hsl(200 100% 50%)" fill="url(#colorRate)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </GameCard>
      </div>

      {/* Habit history */}
      <GameCard>
        <h2 className="font-display text-sm text-muted-foreground mb-4 font-bold italic">Histórico de Hábitos</h2>
        <div className="space-y-3">
          {habitHistory.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3">
              <span className="w-24 text-sm font-body text-foreground truncate font-semibold">{h.name}</span>
              <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${h.rate}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, hsl(260 80% 55%), hsl(200 100% 50%))` }}
                />
              </div>
              <span className="text-sm font-display text-neon-green w-10 text-right">{h.rate}%</span>
              <span className="text-sm">🔥</span>
              <span className="text-sm font-display text-neon-gold w-10">{h.streak}d</span>
            </motion.div>
          ))}
          {habitHistory.length === 0 && <p className="text-muted-foreground font-body text-center py-4">Nenhuma missão ainda.</p>}
        </div>
      </GameCard>

      {/* Completion ring (existing) */}
      <GameCard glowColor="blue">
        <h2 className="font-display text-sm text-muted-foreground mb-4">TAXA DE CONCLUSÃO</h2>
        <div className="flex items-center gap-6">
          <div className="relative w-28 h-28 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
              <motion.circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--accent))" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={264} initial={{ strokeDashoffset: 264 }}
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

      {/* Titles */}
      <GameCard>
        <h2 className="font-display text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <Shield size={16} className="text-primary" /> TÍTULOS
        </h2>
        <div className="space-y-2">
          {titles.map((t, i) => {
            const unlocked = (profile?.level ?? 1) >= (t as any).min_level;
            const isSelected = selectedTitle === t.id;
            return (
              <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <button
                  onClick={() => setSelectedTitle(isSelected ? null : t.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between ${
                    unlocked ? "bg-primary/10 border-primary/30 hover:border-primary/50" : "bg-secondary/50 border-border opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{unlocked ? "🏅" : "🔒"}</span>
                    <span className="font-body font-semibold text-foreground">{t.title}</span>
                  </div>
                  <span className="text-xs font-display text-muted-foreground">Nv. {(t as any).min_level ?? "?"}</span>
                </button>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-4 py-3 ml-4 border-l-2 border-primary/30 mt-1">
                        <p className="text-sm font-body text-muted-foreground">{(t as any).description || "Sem descrição."}</p>
                        <p className="text-xs font-display text-primary mt-1">{unlocked ? "✓ Desbloqueado" : `Desbloqueie no nível ${(t as any).min_level}`}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          {titles.length === 0 && <p className="text-muted-foreground font-body text-sm">Nenhum título ainda.</p>}
        </div>
      </GameCard>

      {/* Achievements */}
      <GameCard glowColor="blue">
        <h2 className="font-display text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <Star size={16} className="text-neon-gold" /> CONQUISTAS
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((ach, i) => {
            const isSelected = selectedAchievement === ach.id;
            return (
              <motion.div key={ach.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <button
                  onClick={() => setSelectedAchievement(isSelected ? null : ach.id)}
                  className={`w-full text-center p-3 rounded-lg border transition-all ${
                    ach.unlocked ? "bg-primary/10 border-primary/30 hover:border-primary/50" : "bg-secondary/50 border-border opacity-50 hover:opacity-70"
                  }`}
                >
                  <span className="text-2xl block mb-1">{ach.icon}</span>
                  <span className="text-xs font-body font-semibold text-foreground">{ach.name}</span>
                  {!ach.unlocked && <span className="block text-xs text-muted-foreground mt-1">🔒</span>}
                </button>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden">
                      <div className="px-2 py-2 mt-1 text-center">
                        <p className="text-xs font-body text-muted-foreground">{(ach as any).description || "Sem descrição."}</p>
                        {ach.unlocked && ach.unlocked_at && (
                          <p className="text-xs font-display text-neon-green mt-1">Desbloqueado em {new Date(ach.unlocked_at).toLocaleDateString("pt-BR")}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </GameCard>

      {/* Mission summary */}
      <GameCard>
        <h2 className="font-display text-sm text-muted-foreground mb-4">RESUMO DE MISSÕES</h2>
        <div className="space-y-3">
          {missions.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
              <div className="flex items-center gap-3">
                <span className="text-lg">{m.icon}</span>
                <span className={`font-body text-sm ${m.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>{m.name}</span>
              </div>
              <span className={`text-xs font-display ${m.completed ? "text-neon-green" : "text-muted-foreground"}`}>
                {m.completed ? "✓" : `+${m.xp} XP`}
              </span>
            </motion.div>
          ))}
          {missions.length === 0 && <p className="text-muted-foreground font-body text-center py-4">Nenhuma missão ainda.</p>}
        </div>
      </GameCard>
    </div>
  );
};

export default Progress;
