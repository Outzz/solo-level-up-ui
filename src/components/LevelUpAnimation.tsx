import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";

interface LevelUpAnimationProps {
  show: boolean;
  newLevel: number;
  onComplete: () => void;
}

const LevelUpAnimation = ({ show, newLevel, onComplete }: LevelUpAnimationProps) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onAnimationComplete={(def: any) => {
            if (def?.opacity === 0) onComplete();
          }}
        >
          {/* Background flash */}
          <motion.div
            className="absolute inset-0 bg-primary/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 1.5 }}
          />

          {/* Particle rings */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-40 h-40 rounded-full border-2 border-primary/60"
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 3 + i, opacity: 0 }}
              transition={{ duration: 1.2, delay: i * 0.2, ease: "easeOut" }}
            />
          ))}

          {/* Main content */}
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.3, 1], opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <motion.div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-purple"
              animate={{ 
                boxShadow: [
                  "0 0 20px hsl(var(--primary) / 0.5)",
                  "0 0 60px hsl(var(--primary) / 0.8)",
                  "0 0 20px hsl(var(--primary) / 0.5)",
                ],
              }}
              transition={{ duration: 1, repeat: 2 }}
            >
              <Zap size={48} className="text-primary-foreground" />
            </motion.div>

            <motion.p
              className="font-display text-sm tracking-widest text-primary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              LEVEL UP!
            </motion.p>

            <motion.p
              className="font-display text-5xl font-bold text-foreground"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: [0.5, 1.2, 1] }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              {newLevel}
            </motion.p>
          </motion.div>

          {/* Auto dismiss */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ delay: 2.5, duration: 0.5 }}
            onAnimationComplete={() => onComplete()}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpAnimation;
