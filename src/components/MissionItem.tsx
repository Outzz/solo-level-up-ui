import { useState } from "react";
import { motion } from "framer-motion";
import { Pencil, Trash2, Check, X } from "lucide-react";

interface MissionData {
  id: string;
  name: string;
  xp: number;
  type: string;
  completed: boolean;
  icon: string;
}

interface MissionItemProps {
  mission: MissionData;
  onComplete: (id: string) => void;
  onEdit?: (id: string, name: string, xp: number) => void;
  onDelete?: (id: string) => void;
}

const typeLabel = (type: string) => {
  if (type === "daily") return "Diária";
  if (type === "weekly") return "Semanal";
  if (type === "monthly") return "Mensal";
  return type;
};

const MissionItem = ({ mission, onComplete, onEdit, onDelete }: MissionItemProps) => {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(mission.name);
  const [editXp, setEditXp] = useState(mission.xp);

  const handleSave = () => {
    if (editName.trim() && onEdit) {
      onEdit(mission.id, editName, editXp);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <motion.div layout className="flex items-center gap-3 p-4 rounded-lg border bg-card border-primary/40">
        <span className="text-2xl">{mission.icon}</span>
        <div className="flex-1 space-y-2">
          <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-input border border-border rounded px-3 py-1.5 text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
          <input type="number" value={editXp} onChange={e => setEditXp(Number(e.target.value))} className="w-20 bg-input border border-border rounded px-3 py-1.5 text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary text-sm" />
        </div>
        <button onClick={handleSave} className="p-2 text-neon-green hover:bg-secondary rounded-lg"><Check size={18} /></button>
        <button onClick={() => setEditing(false)} className="p-2 text-muted-foreground hover:bg-secondary rounded-lg"><X size={18} /></button>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
        mission.completed ? "bg-secondary/50 border-neon-green/20" : "bg-card border-glow hover:border-primary/50"
      }`}
    >
      <span className="text-2xl">{mission.icon}</span>
      <div className="flex-1 min-w-0">
        <h3 className={`font-semibold text-lg font-body ${mission.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
          {mission.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-neon-purple font-display">+{mission.xp} XP</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{typeLabel(mission.type)}</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!mission.completed && onEdit && (
          <button onClick={() => setEditing(true)} className="p-2 text-muted-foreground hover:text-neon-blue hover:bg-secondary rounded-lg transition-colors"><Pencil size={16} /></button>
        )}
        {onDelete && (
          <button onClick={() => onDelete(mission.id)} className="p-2 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-lg transition-colors"><Trash2 size={16} /></button>
        )}
        {!mission.completed ? (
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onComplete(mission.id)}
            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display text-sm font-bold glow-purple hover:brightness-110 transition-all ml-1">
            Completar
          </motion.button>
        ) : (
          <span className="text-neon-green text-xl ml-1">✓</span>
        )}
      </div>
    </motion.div>
  );
};

export default MissionItem;
