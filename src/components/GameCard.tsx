import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GameCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "purple" | "blue" | "green";
  onClick?: () => void;
}

const glowClasses = {
  purple: "glow-purple",
  blue: "glow-blue",
  green: "glow-green",
};

const GameCard = ({ children, className = "", glowColor = "purple", onClick }: GameCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`bg-card border-glow rounded-lg p-5 transition-all ${glowClasses[glowColor]} ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
};

export default GameCard;
