import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EMOJI_LIST = [
  "⚔️", "🌅", "💪", "📖", "🧘", "📚", "🏃", "🚀", "🎯", "💎",
  "🔥", "⚡", "🏆", "👑", "🗡️", "🐉", "🎮", "🎵", "🍎", "💧",
  "🧠", "✍️", "🛡️", "🌙", "☀️", "🏋️", "🚶", "🧹", "🍳", "💤",
  "📝", "🎨", "💻", "🎸", "🏊", "🚴", "🧗", "🤸", "🥗", "💊",
];

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

const EmojiPicker = ({ selected, onSelect }: EmojiPickerProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-12 h-12 rounded-lg bg-input border border-border flex items-center justify-center text-2xl hover:border-primary/50 transition-colors"
      >
        {selected}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute z-50 top-14 left-0 bg-card border border-border rounded-lg p-3 grid grid-cols-8 gap-1 shadow-xl w-[280px]"
          >
            {EMOJI_LIST.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => { onSelect(emoji); setOpen(false); }}
                className={`w-8 h-8 rounded flex items-center justify-center text-lg hover:bg-secondary transition-colors ${selected === emoji ? "bg-primary/20 ring-1 ring-primary" : ""}`}
              >
                {emoji}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmojiPicker;
