import { motion } from "framer-motion";

interface XPBarProps {
  current: number;
  max: number;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-2",
  md: "h-4",
  lg: "h-6",
};

const XPBar = ({ current, max, showLabel = true, size = "md" }: XPBarProps) => {
  const percentage = Math.min((current / max) * 100, 100);

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between mb-1 text-sm font-body">
          <span className="text-muted-foreground">XP</span>
          <span className="text-neon-blue font-semibold">
            {current.toLocaleString()} / {max.toLocaleString()}
          </span>
        </div>
      )}
      <div className={`w-full rounded-full bg-secondary overflow-hidden ${sizeClasses[size]} relative`}>
        <motion.div
          className="h-full rounded-full xp-gradient relative"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/20 rounded-full" />
        </motion.div>
      </div>
    </div>
  );
};

export default XPBar;
