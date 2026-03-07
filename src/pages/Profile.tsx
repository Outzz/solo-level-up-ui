import { useState } from "react";
import { motion } from "framer-motion";
import { Crown, Shield, Star, Pencil, Check, X } from "lucide-react";
import GameCard from "@/components/GameCard";
import XPBar from "@/components/XPBar";
import { useProfile, useUpdateProfile, useAchievements, useTitles } from "@/hooks/useProfile";

const Profile = () => {
  const { data: profile } = useProfile();
  const { data: achievements = [] } = useAchievements();
  const { data: titles = [] } = useTitles();
  const updateProfile = useUpdateProfile();

  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  const handleSaveName = () => {
    if (newName.trim()) {
      updateProfile.mutate({ hunter_name: newName });
    }
    setEditingName(false);
  };

  const stats = [
    { label: "Nível", value: profile?.level ?? 1 },
    { label: "XP Total", value: profile?.xp ?? 0 },
    { label: "Streak Atual", value: profile?.streak ?? 0 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-8">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-purple">
          <Crown size={40} className="text-primary-foreground" />
        </div>

        {editingName ? (
          <div className="flex items-center justify-center gap-2 max-w-xs mx-auto">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              className="bg-input border border-border rounded-lg px-3 py-2 text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary text-center"
              autoFocus
            />
            <button onClick={handleSaveName} className="p-2 text-neon-green hover:bg-secondary rounded-lg"><Check size={18} /></button>
            <button onClick={() => setEditingName(false)} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg"><X size={18} /></button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-display font-bold text-glow-purple text-primary">
              {profile?.hunter_name ?? "Hunter"}
            </h1>
            <button
              onClick={() => { setNewName(profile?.hunter_name ?? ""); setEditingName(true); }}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Pencil size={16} />
            </button>
          </div>
        )}

        <p className="text-accent font-display text-sm mt-1">
          HUNTER NÍVEL {profile?.level ?? 1}
        </p>
        <div className="max-w-xs mx-auto mt-4">
          <XPBar current={profile?.xp ?? 0} max={profile?.xp_to_next ?? 500} />
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}>
            <GameCard className="text-center" glowColor={i % 2 === 0 ? "purple" : "blue"}>
              <div className="text-2xl font-display font-bold text-foreground">{stat.value.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground font-body mt-1">{stat.label}</div>
            </GameCard>
          </motion.div>
        ))}
      </div>

      <GameCard>
        <h2 className="font-display text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <Shield size={16} className="text-primary" /> TÍTULOS
        </h2>
        <div className="flex flex-wrap gap-2">
          {titles.map((t, i) => (
            <motion.span key={t.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="px-3 py-1.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-body text-sm font-semibold">
              {t.title}
            </motion.span>
          ))}
          {titles.length === 0 && <p className="text-muted-foreground font-body text-sm">Nenhum título ainda.</p>}
        </div>
      </GameCard>

      <GameCard glowColor="blue">
        <h2 className="font-display text-sm text-muted-foreground mb-4 flex items-center gap-2">
          <Star size={16} className="text-neon-gold" /> CONQUISTAS
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {achievements.map((ach, i) => (
            <motion.div key={ach.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`text-center p-3 rounded-lg border transition-all ${ach.unlocked ? "bg-primary/10 border-primary/30" : "bg-secondary/50 border-border opacity-50"}`}>
              <span className="text-2xl block mb-1">{ach.icon}</span>
              <span className="text-xs font-body font-semibold text-foreground">{ach.name}</span>
              {!ach.unlocked && <span className="block text-xs text-muted-foreground mt-1">🔒</span>}
            </motion.div>
          ))}
        </div>
      </GameCard>
    </div>
  );
};

export default Profile;
