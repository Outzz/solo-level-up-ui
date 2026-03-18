import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import MissionItem from "@/components/MissionItem";
import EmojiPicker from "@/components/EmojiPicker";
import { useMissions, useCompleteMission, useAddMission, useEditMission, useDeleteMission, getXpByType } from "@/hooks/useProfile";

const Missions = () => {
  const { data: missions = [] } = useMissions();
  const completeMission = useCompleteMission();
  const addMission = useAddMission();
  const editMission = useEditMission();
  const deleteMission = useDeleteMission();

  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "monthly">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newXp, setNewXp] = useState(50);
  const [newType, setNewType] = useState<"daily" | "weekly" | "monthly">("daily");
  const [newIcon, setNewIcon] = useState("⚡");

  const filtered = filter === "all" ? missions : missions.filter(m => m.type === filter);
  const completed = filtered.filter(m => m.completed).length;

  const handleComplete = (id: string) => completeMission.mutate(id);
  const handleEdit = (id: string, name: string, xp: number) => editMission.mutate({ id, name, xp });
  const handleDelete = (id: string) => deleteMission.mutate(id);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addMission.mutate({ name: newName, xp: newXp, type: newType, icon: newIcon });
    setNewName("");
    setNewIcon("⚡");
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-glow-purple text-primary">MISSÕES</h1>
          <p className="text-muted-foreground font-body">{completed}/{filtered.length} completas</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-display text-sm font-bold glow-purple"
        >
          <Plus size={18} /> Nova
        </motion.button>
      </div>

      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="bg-card border-glow rounded-lg p-5 space-y-4">
              <div className="flex items-start gap-3">
                <EmojiPicker selected={newIcon} onSelect={setNewIcon} />
                <input type="text" placeholder="Nome da missão..." value={newName} onChange={e => setNewName(e.target.value)} className="flex-1 bg-input border border-border rounded-lg px-4 py-3 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
              </div>
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs text-muted-foreground font-display block mb-1">XP</label>
                  <input type="number" value={newXp} onChange={e => setNewXp(Number(e.target.value))} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs text-muted-foreground font-display block mb-1">Tipo</label>
                  <select value={newType} onChange={e => setNewType(e.target.value as "daily" | "weekly" | "monthly")} className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary">
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                    <option value="monthly">Mensal</option>
                  </select>
                </div>
              </div>
              <motion.button whileTap={{ scale: 0.95 }} onClick={handleAdd} className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold glow-purple">
                Adicionar Missão
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2">
        {(["all", "daily", "weekly", "monthly"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg font-display text-sm font-semibold transition-all ${filter === f ? "bg-primary text-primary-foreground glow-purple" : "bg-secondary text-secondary-foreground hover:bg-muted"}`}>
            {f === "all" ? "Todas" : f === "daily" ? "Diárias" : f === "weekly" ? "Semanais" : "Mensais"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(mission => (
            <MissionItem key={mission.id} mission={mission} onComplete={handleComplete} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <p className="text-muted-foreground font-body text-center py-8">Nenhuma missão encontrada.</p>
        )}
      </div>
    </div>
  );
};

export default Missions;
