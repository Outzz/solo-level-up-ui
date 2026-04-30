import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, TrendingDown, Sparkles } from "lucide-react";
import { LEAGUE_CONFIG } from "@/hooks/useLeague";

interface LeagueChangeAnimationProps {
  open: boolean;
  type: "promotion" | "demotion";
  fromLeague: string;
  toLeague: string;
  bonusXp?: number;
  titleEarned?: string | null;
  onClose: () => void;
}

const LeagueChangeAnimation = ({ open, type, fromLeague, toLeague, bonusXp, titleEarned, onClose }: LeagueChangeAnimationProps) => {
  const fromConfig = LEAGUE_CONFIG[fromLeague] ?? LEAGUE_CONFIG.bronze;
  const toConfig = LEAGUE_CONFIG[toLeague] ?? LEAGUE_CONFIG.bronze;
  const isPromotion = type === "promotion";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-md p-4 cursor-pointer"
        >
          {/* Particles backdrop */}
          {isPromotion && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{
                    x: "50vw",
                    y: "50vh",
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: `${Math.random() * 100}vw`,
                    y: `${Math.random() * 100}vh`,
                    opacity: [0, 1, 0],
                    scale: [0, 1.2, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 1.5,
                    ease: "easeOut",
                  }}
                  className="absolute w-2 h-2 rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
                />
              ))}
            </div>
          )}

          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-md w-full bg-card border-2 rounded-2xl p-8 text-center shadow-2xl
              ${isPromotion ? "border-primary shadow-[0_0_60px_hsl(var(--primary)/0.4)]" : "border-destructive shadow-[0_0_60px_hsl(var(--destructive)/0.3)]"}
            `}
          >
            {/* Top badge */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-display font-bold tracking-widest uppercase mb-6
                ${isPromotion ? "bg-primary/20 text-primary" : "bg-destructive/20 text-destructive"}
              `}
            >
              {isPromotion ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isPromotion ? "Promoção de Liga" : "Rebaixamento"}
            </motion.div>

            {/* From → To icons */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 0.7, rotate: 0, opacity: 0.4 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="text-5xl grayscale"
              >
                {fromConfig.icon}
              </motion.div>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 }}
                className={isPromotion ? "text-primary" : "text-destructive"}
              >
                {isPromotion ? <TrendingUp size={32} /> : <TrendingDown size={32} />}
              </motion.div>

              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1.2, rotate: 0 }}
                transition={{ delay: 0.7, type: "spring", bounce: 0.6 }}
                className={`text-7xl drop-shadow-[0_0_25px_hsl(var(--primary))] ${isPromotion ? "" : "grayscale"}`}
              >
                {toConfig.icon}
              </motion.div>
            </div>

            {/* Headline */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-2xl font-display font-bold text-foreground mb-2"
            >
              {isPromotion ? "VOCÊ SUBIU PARA" : "VOCÊ CAIU PARA"}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.95, type: "spring" }}
              className={`text-4xl font-display font-bold mb-6 ${toConfig.color}`}
              style={{ textShadow: "0 0 20px currentColor" }}
            >
              LIGA {toConfig.label.toUpperCase()}
            </motion.p>

            {/* Rewards (only for promotion) */}
            {isPromotion && bonusXp ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="space-y-3 border-t border-border pt-5"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="text-neon-gold" size={20} />
                  <span className="font-display font-bold text-neon-gold text-lg">
                    +{bonusXp} XP Bônus
                  </span>
                </div>
                {titleEarned && (
                  <div className="text-sm text-muted-foreground font-body">
                    Novo título desbloqueado:{" "}
                    <span className="text-primary font-display font-bold">{titleEarned}</span>
                  </div>
                )}
              </motion.div>
            ) : !isPromotion ? (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.1 }}
                className="text-sm text-muted-foreground font-body border-t border-border pt-5"
              >
                Não desista, Hunter. Recupere seu posto na próxima semana!
              </motion.p>
            ) : null}

            {/* Close */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              onClick={onClose}
              className={`mt-6 w-full py-3 rounded-lg font-display font-bold tracking-wider transition-all
                ${isPromotion
                  ? "bg-primary text-primary-foreground hover:opacity-90 shadow-[0_0_20px_hsl(var(--primary)/0.5)]"
                  : "bg-secondary text-foreground hover:bg-secondary/80"}
              `}
            >
              CONTINUAR
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LeagueChangeAnimation;
