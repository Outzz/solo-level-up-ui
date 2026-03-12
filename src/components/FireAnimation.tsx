import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

interface FireAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

const FireAnimation = ({ show, onComplete }: FireAnimationProps) => {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  const flames = Array.from({ length: 20 }, (_, i) => i);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 pointer-events-none flex flex-col items-center justify-center"
        >
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background"
          />

          {/* Fire particles */}
          <div className="relative z-10">
            {flames.map((i) => {
              const x = (Math.random() - 0.5) * 200;
              const delay = Math.random() * 0.5;
              const size = 20 + Math.random() * 30;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 100, x, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: [100, -50, -200, -300],
                    scale: [0, 1.2, 0.8, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random(),
                    delay,
                    repeat: 1,
                    ease: "easeOut",
                  }}
                  className="absolute"
                  style={{ fontSize: size }}
                >
                  🔥
                </motion.div>
              );
            })}
          </div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="relative z-10 text-center"
          >
            <div className="text-6xl mb-4">🔥</div>
            <h2 className="text-4xl font-display font-bold text-neon-gold text-glow-purple">
              MISSÕES COMPLETAS!
            </h2>
            <p className="text-xl font-body text-muted-foreground mt-2">
              Você está em chamas, Hunter!
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FireAnimation;
