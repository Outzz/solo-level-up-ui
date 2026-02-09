import { useState } from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Target } from "lucide-react";
import GameCard from "@/components/GameCard";
import XPBar from "@/components/XPBar";
import MissionItem from "@/components/MissionItem";
import { mockPlayer, mockMissions, mockWeeklyProgress } from "@/lib/mockData";

const Dashboard = () => {
  const [missions, setMissions] = useState(mockMissions.filter(m => m.type === "daily"));
  const completedToday = missions.filter(m => m.completed).length;

  const handleComplete = (id: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
  };

  const statCards = [
    { label: "Nível", value: mockPlayer.level, icon: Zap, color: "text-neon-purple" },
    { label: "Streak", value: `${mockPlayer.streak} dias`, icon: Flame, color: "text-neon-gold" },
    { label: "Missões Hoje", value: `${completedToday}/${missions.length}`, icon: Target, color: "text-neon-blue" },
    { label: "XP Total", value: mockPlayer.xp.toLocaleString(), icon: Trophy, color: "text-neon-green" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted-foreground font-body text-lg">Bem-vindo de volta,</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-glow-purple text-primary">
          {mockPlayer.name}
        </h1>
      </motion.div>

      {/* XP */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <GameCard>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-display text-sm text-muted-foreground">NÍVEL {mockPlayer.level}</span>
            <span className="text-xs text-primary font-display">→ NÍVEL {mockPlayer.level + 1}</span>
          </div>
          <XPBar current={mockPlayer.xp} max={mockPlayer.xpToNext} size="lg" />
        </GameCard>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
          >
            <GameCard className="text-center">
              <stat.icon className={`mx-auto mb-2 ${stat.color}`} size={24} />
              <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground font-body mt-1">{stat.label}</div>
            </GameCard>
          </motion.div>
        ))}
      </div>

      {/* Missions */}
      <div>
        <h2 className="font-display text-lg font-bold mb-4 text-foreground flex items-center gap-2">
          <Zap size={18} className="text-neon-purple" /> MISSÕES DO DIA
        </h2>
        <div className="space-y-3">
          {missions.map(mission => (
            <MissionItem key={mission.id} mission={mission} onComplete={handleComplete} />
          ))}
        </div>
      </div>

      {/* Weekly progress */}
      <div>
        <h2 className="font-display text-lg font-bold mb-4 text-foreground">PROGRESSO SEMANAL</h2>
        <GameCard glowColor="blue">
          <div className="flex items-end gap-2 h-32">
            {mockWeeklyProgress.map((day, i) => {
              const pct = day.total > 0 ? (day.completed / day.total) * 100 : 0;
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    className="w-full rounded-t-md xp-gradient relative overflow-hidden"
                    style={{ minHeight: 4 }}
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ delay: 0.1 * i, duration: 0.8 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                  </motion.div>
                  <span className="text-xs text-muted-foreground font-body">{day.day}</span>
                </div>
              );
            })}
          </div>
        </GameCard>
      </div>
    </div>
  );
};

export default Dashboard;
