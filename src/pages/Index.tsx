import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Flame, Zap, Trophy, Target } from "lucide-react";
import GameCard from "@/components/GameCard";
import XPBar from "@/components/XPBar";
import MissionItem from "@/components/MissionItem";
import FireAnimation from "@/components/FireAnimation";
import LevelUpAnimation from "@/components/LevelUpAnimation";
import { useProfile, useMissions, useCompleteMission } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { data: profile } = useProfile();
  const { data: missions = [] } = useMissions();
  const completeMission = useCompleteMission();
  const [showFire, setShowFire] = useState(false);
  const [fireTriggered, setFireTriggered] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState(1);

  const dailyMissions = missions.filter(m => m.type === "daily");
  const completedToday = dailyMissions.filter(m => m.completed).length;
  const allDailyComplete = dailyMissions.length > 0 && completedToday === dailyMissions.length;

  useEffect(() => {
    if (allDailyComplete && !fireTriggered) {
      setShowFire(true);
      setFireTriggered(true);
    }
  }, [allDailyComplete, fireTriggered]);

  const handleComplete = (id: string) => {
    completeMission.mutate(id, {
      onSuccess: (data) => {
        if (data?.leveledUp) {
          setLevelUpLevel(data.newLevel);
          setShowLevelUp(true);
        }
      },
    });
  };

  const statCards = [
    { label: "Nível", value: profile?.level ?? 1, icon: Zap, color: "text-neon-purple" },
    { label: "Streak", value: `${profile?.streak ?? 0} dias`, icon: Flame, color: "text-neon-gold" },
    { label: "Missões Hoje", value: `${completedToday}/${dailyMissions.length}`, icon: Target, color: "text-neon-blue" },
    { label: "XP Total", value: (profile?.xp ?? 0).toLocaleString(), icon: Trophy, color: "text-neon-green" },
  ];

  return (
    <div className="space-y-6">
      <FireAnimation show={showFire} onComplete={() => setShowFire(false)} />
      <LevelUpAnimation show={showLevelUp} newLevel={levelUpLevel} onComplete={() => setShowLevelUp(false)} />

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <p className="text-muted-foreground font-body text-lg">Bem-vindo de volta,</p>
        <h1 className="text-3xl md:text-4xl font-display font-bold text-glow-purple text-primary">
          {profile?.hunter_name ?? "Hunter"}
        </h1>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
        <GameCard>
          <div className="flex items-center gap-3 mb-3">
            <span className="font-display text-sm text-muted-foreground">NÍVEL {profile?.level ?? 1}</span>
            <span className="text-xs text-primary font-display">→ NÍVEL {(profile?.level ?? 1) + 1}</span>
          </div>
          <XPBar current={profile?.xp ?? 0} max={profile?.xp_to_next ?? 500} size="lg" />
        </GameCard>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
            <GameCard className="text-center">
              <stat.icon className={`mx-auto mb-2 ${stat.color}`} size={24} />
              <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground font-body mt-1">{stat.label}</div>
            </GameCard>
          </motion.div>
        ))}
      </div>

      {allDailyComplete && (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <GameCard glowColor="green" className="text-center py-6">
            <span className="text-4xl block mb-2">🔥</span>
            <h3 className="font-display text-lg font-bold text-neon-green">TODAS AS MISSÕES COMPLETAS!</h3>
            <p className="text-muted-foreground font-body text-sm">Você está em chamas hoje, Hunter!</p>
          </GameCard>
        </motion.div>
      )}

      <div>
        <h2 className="font-display text-lg font-bold mb-4 text-foreground flex items-center gap-2">
          <Zap size={18} className="text-neon-purple" /> MISSÕES DO DIA
        </h2>
        <div className="space-y-3">
          {dailyMissions.map(mission => (
            <MissionItem key={mission.id} mission={mission} onComplete={handleComplete} />
          ))}
          {dailyMissions.length === 0 && (
            <p className="text-muted-foreground font-body text-center py-8">Nenhuma missão diária ainda.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
