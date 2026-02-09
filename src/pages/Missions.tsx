import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter } from "lucide-react";
import MissionItem from "@/components/MissionItem";
import { mockMissions } from "@/lib/mockData";

const Missions = () => {
  const [missions, setMissions] = useState(mockMissions);
  const [filter, setFilter] = useState<"all" | "daily" | "weekly">("all");
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");
  const [newXp, setNewXp] = useState(50);
  const [newType, setNewType] = useState<"daily" | "weekly">("daily");

  const filtered = filter === "all" ? missions : missions.filter(m => m.type === filter);
  const completed = filtered.filter(m => m.completed).length;

  const handleComplete = (id: string) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, completed: true } : m));
  };

  const handleEdit = (id: string, name: string, xp: number) => {
    setMissions(prev => prev.map(m => m.id === id ? { ...m, name, xp } : m));
  };

  const handleDelete = (id: string) => {
    setMissions(prev => prev.filter(m => m.id !== id));
  };

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newMission = {
      id: Date.now().toString(),
      name: newName,
      xp: newXp,
      type: newType,
      completed: false,
      icon: "⚡",
    };
    setMissions(prev => [...prev, newMission]);
    setNewName("");
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

      {/* Add mission form */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card border-glow rounded-lg p-5 space-y-4">
              <input
                type="text"
                placeholder="Nome da missão..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full bg-input border border-border rounded-lg px-4 py-3 text-foreground font-body placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <div className="flex gap-3 flex-wrap">
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs text-muted-foreground font-display block mb-1">XP</label>
                  <input
                    type="number"
                    value={newXp}
                    onChange={e => setNewXp(Number(e.target.value))}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="flex-1 min-w-[120px]">
                  <label className="text-xs text-muted-foreground font-display block mb-1">Tipo</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as "daily" | "weekly")}
                    className="w-full bg-input border border-border rounded-lg px-4 py-2 text-foreground font-body focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="daily">Diária</option>
                    <option value="weekly">Semanal</option>
                  </select>
                </div>
              </div>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAdd}
                className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-display font-bold glow-purple"
              >
                Adicionar Missão
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "daily", "weekly"] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-display text-sm font-semibold transition-all ${
              filter === f
                ? "bg-primary text-primary-foreground glow-purple"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {f === "all" ? "Todas" : f === "daily" ? "Diárias" : "Semanais"}
          </button>
        ))}
      </div>

      {/* Missions list */}
      <div className="space-y-3">
        <AnimatePresence>
          {filtered.map(mission => (
            <MissionItem key={mission.id} mission={mission} onComplete={handleComplete} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Missions;
