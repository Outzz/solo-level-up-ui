import { motion } from "framer-motion";
import type { Mission } from "@/lib/mockData";

interface MissionItemProps {
  mission: Mission;
  onComplete: (id: string) => void;
}

const MissionItem = ({ mission, onComplete }: MissionItemProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
        mission.completed
          ? "bg-secondary/50 border-neon-green/20"
          : "bg-card border-glow hover:border-primary/50"
      }`}
    >
      <span className="text-2xl">{mission.icon}</span>
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-lg font-body ${mission.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {mission.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-neon-purple font-display">
            +{mission.xp} XP
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {mission.type === "daily" ? "Diária" : "Semanal"}
          </span>
        </div>
      </div>
      {!mission.completed ? (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onComplete(mission.id)}
          className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display text-sm font-bold glow-purple hover:brightness-110 transition-all"
        >
          Completar
        </motion.button>
      ) : (
        <span className="text-neon-green text-xl">✓</span>
      )}
    </motion.div>
  );
};

export default MissionItem;
