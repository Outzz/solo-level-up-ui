import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart3, CheckCircle, Calendar, TrendingUp, Star, Shield, Info } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { useQuery } from "@tanstack/react-query";
import GameCard from "@/components/GameCard";
import { useProfile, useMissions, useAchievements, useTitles } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

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

  // Real weekly XP data from daily_progress
  const { data: dailyProgress = [] } = useQuery({
    queryKey: ["daily_progress", user?.id],
    queryFn: async () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
      const { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", user!.id)
        .gte("date", startOfWeek.toISOString().split("T")[0])
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const dayNames = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const weeklyXpData = (() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay() + 1);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const entry = dailyProgress.find((p: any) => p.date === dateStr);
      days.push({ day: dayNames[(d.getDay())], xp: entry ? entry.xp_earned : 0 });
    }
    return days;
  })();

  // Real monthly data from daily_progress (last 4 weeks)
  const { data: monthlyProgress = [] } = useQuery({
    queryKey: ["monthly_progress", user?.id],
    queryFn: async () => {
      const today = new Date();
      const fourWeeksAgo = new Date(today);
      fourWeeksAgo.setDate(today.getDate() - 28);
      const { data, error } = await supabase
        .from("daily_progress")
        .select("*")
        .eq("user_id", user!.id)
        .gte("date", fourWeeksAgo.toISOString().split("T")[0])
        .order("date", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const monthlyData = (() => {
    const weeks: { week: string; rate: number }[] = [];
    for (let w = 0; w < 4; w++) {
      const weekEntries = monthlyProgress.filter((_: any, idx: number) => {
        const entryDate = new Date((monthlyProgress[idx] as any).date);
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 28 + w * 7);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        return entryDate >= weekStart && entryDate < weekEnd;
      });
      const totalCompleted = weekEntries.reduce((s: number, e: any) => s + e.missions_completed, 0);
      const totalMissionsWeek = weekEntries.reduce((s: number, e: any) => s + e.missions_total, 0);
      const rate = totalMissionsWeek > 0 ? Math.round((totalCompleted / totalMissionsWeek) * 100) : 0;
      weeks.push({ week: `Sem ${w + 1}`, rate });
    }
    return weeks;
  })();

  // Real habit history: completion count per mission
  const habitHistory = (() => {
    if (missions.length === 0) return [];
    return missions.slice(0, 5).map(m => {
      const completed = m.completed ? 1 : 0;
      return { name: m.name, icon: m.icon, rate: completed * 100, streak: 0 };
    });
  })();

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
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 200, damping: 20 }}
              >
                <motion.button
                  onClick={() => setSelectedTitle(isSelected ? null : t.id)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-center justify-between ${
                    unlocked
                      ? "bg-primary/10 border-primary/30 hover:border-primary/60 hover:bg-primary/20"
                      : "bg-secondary/50 border-border opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <motion.span
                      className="text-lg"
                      animate={unlocked ? { rotate: [0, -10, 10, -5, 5, 0], scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.6, delay: i * 0.1 + 0.5 }}
                    >
                      {unlocked ? "🏅" : "🔒"}
                    </motion.span>
                    <span className="font-body font-semibold text-foreground">{t.title}</span>
                  </div>
                  <motion.span
                    className={`text-xs font-display ${unlocked ? "text-primary" : "text-muted-foreground"}`}
                    animate={unlocked ? { textShadow: ["0 0 0px transparent", "0 0 8px hsl(var(--primary))", "0 0 0px transparent"] } : {}}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                  >
                    Nv. {(t as any).min_level ?? "?"}
                  </motion.span>
                </motion.button>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, y: -10 }}
                      animate={{ height: "auto", opacity: 1, y: 0 }}
                      exit={{ height: 0, opacity: 0, y: -10 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        className="px-4 py-3 ml-4 border-l-2 border-primary/30 mt-1"
                        initial={{ x: -10 }}
                        animate={{ x: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <p className="text-sm font-body text-muted-foreground">{(t as any).description || "Sem descrição."}</p>
                        <p className="text-xs font-display text-primary mt-1">
                          {unlocked ? "✓ Desbloqueado" : `Desbloqueie no nível ${(t as any).min_level}`}
                        </p>
                      </motion.div>
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
              <motion.div
                key={ach.id}
                initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: i * 0.07, type: "spring", stiffness: 260, damping: 20 }}
              >
                <motion.button
                  onClick={() => setSelectedAchievement(isSelected ? null : ach.id)}
                  whileHover={{
                    scale: 1.08,
                    boxShadow: ach.unlocked
                      ? "0 0 20px hsl(var(--primary) / 0.4)"
                      : "0 0 10px hsl(var(--muted) / 0.2)",
                  }}
                  whileTap={{ scale: 0.92 }}
                  className={`w-full text-center p-4 rounded-xl border transition-colors relative overflow-hidden ${
                    ach.unlocked
                      ? "bg-primary/10 border-primary/30 hover:border-primary/60"
                      : "bg-secondary/50 border-border opacity-50 hover:opacity-70"
                  }`}
                >
                  {ach.unlocked && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  )}
                  <motion.span
                    className="text-3xl block mb-2 relative z-10"
                    animate={ach.unlocked ? {
                      y: [0, -4, 0],
                      scale: [1, 1.15, 1],
                    } : {}}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 2 + i * 0.5 }}
                  >
                    {ach.icon}
                  </motion.span>
                  <span className="text-xs font-body font-semibold text-foreground relative z-10">{ach.name}</span>
                  {!ach.unlocked && (
                    <motion.span
                      className="block text-xs text-muted-foreground mt-1"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      🔒
                    </motion.span>
                  )}
                </motion.button>
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ height: 0, opacity: 0, scale: 0.95 }}
                      animate={{ height: "auto", opacity: 1, scale: 1 }}
                      exit={{ height: 0, opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                      className="overflow-hidden"
                    >
                      <motion.div
                        className="px-2 py-3 mt-1 text-center"
                        initial={{ y: -5 }}
                        animate={{ y: 0 }}
                      >
                        <p className="text-xs font-body text-muted-foreground">{(ach as any).description || "Sem descrição."}</p>
                        {ach.unlocked && ach.unlocked_at && (
                          <motion.p
                            className="text-xs font-display text-neon-green mt-1"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15 }}
                          >
                            ✨ Desbloqueado em {new Date(ach.unlocked_at).toLocaleDateString("pt-BR")}
                          </motion.p>
                        )}
                      </motion.div>
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
