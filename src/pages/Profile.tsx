import { motion } from "framer-motion";
import { Crown, Shield, Star, TrendingUp } from "lucide-react";
import GameCard from "@/components/GameCard";
import XPBar from "@/components/XPBar";
import { mockPlayer } from "@/lib/mockData";

const Profile = () => {
  return (
    <div className="space-y-6">
      {/* Player header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-neon-purple to-neon-blue flex items-center justify-center glow-purple">
          <Crown size={40} className="text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-display font-bold text-glow-purple text-primary">
          {mockPlayer.name}
        </h1>
        <p className="text-neon-blue font-display text-sm mt-1">
          HUNTER NÍVEL {mockPlayer.level}
        </p>
        <div className="max-w-xs mx-auto mt-4">
          <XPBar current={mockPlayer.xp} max={mockPlayer.xpToNext} />
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {mockPlayer.stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <GameCard className="text-center" glowColor={i % 2 === 0 ? "purple" : "blue"}>
              <div className="text-2xl font-display font-bold text-foreground">{stat.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground font-body mt-1">{stat.label}</div>
            </GameCard>
          </motion.div>
        ))}
      </div>

      {/* Titles */}
      <GameCard>
        <h2 className="font-display text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <Shield size={16} className="text-neon-purple" /> TÍTULOS
        </h2>
        <div className="flex flex-wrap gap-2">
          {mockPlayer.titles.map((title, i) => (
            <motion.span
              key={title}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-body text-sm font-semibold"
            >
              {title}
            </motion.span>
          ))}
        </div>
      </GameCard>

      {/* Achievements */}
      <GameCard glowColor="blue">
        <h2 className="font-display text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <Star size={16} className="text-neon-gold" /> CONQUISTAS
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {mockPlayer.achievements.map((ach, i) => (
            <motion.div
              key={ach.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`text-center p-3 rounded-lg border transition-all ${
                ach.unlocked
                  ? "bg-primary/10 border-primary/30"
                  : "bg-secondary/50 border-border opacity-50"
              }`}
            >
              <span className="text-2xl block mb-1">{ach.icon}</span>
              <span className="text-xs font-body font-semibold text-foreground">{ach.name}</span>
              {!ach.unlocked && (
                <span className="block text-xs text-muted-foreground mt-1">🔒</span>
              )}
            </motion.div>
          ))}
        </div>
      </GameCard>
    </div>
  );
};

export default Profile;
