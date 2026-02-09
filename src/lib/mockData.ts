// Mock data — ready to replace with fetch calls to your Node.js API

export interface Mission {
  id: string;
  name: string;
  xp: number;
  type: "daily" | "weekly";
  completed: boolean;
  icon: string;
}

export interface PlayerProfile {
  name: string;
  level: number;
  xp: number;
  xpToNext: number;
  streak: number;
  titles: string[];
  achievements: { name: string; icon: string; unlocked: boolean }[];
  stats: { label: string; value: number }[];
}

export interface WeeklyProgress {
  day: string;
  completed: number;
  total: number;
}

export const mockPlayer: PlayerProfile = {
  name: "Shadow Monarch",
  level: 27,
  xp: 3450,
  xpToNext: 5000,
  streak: 14,
  titles: ["Caçador Rank-S", "Destruidor de Hábitos", "Guerreiro Disciplinado", "Lorde das Sombras"],
  achievements: [
    { name: "Primeira Missão", icon: "⚔️", unlocked: true },
    { name: "7 Dias Seguidos", icon: "🔥", unlocked: true },
    { name: "30 Dias Seguidos", icon: "💎", unlocked: true },
    { name: "100 Missões", icon: "🏆", unlocked: true },
    { name: "Nível 50", icon: "👑", unlocked: false },
    { name: "Streak 30", icon: "⚡", unlocked: false },
  ],
  stats: [
    { label: "Missões Completas", value: 342 },
    { label: "XP Total", value: 45200 },
    { label: "Maior Streak", value: 21 },
    { label: "Dias Ativos", value: 89 },
  ],
};

export const mockMissions: Mission[] = [
  { id: "1", name: "Acordar às 6h", xp: 50, type: "daily", completed: true, icon: "🌅" },
  { id: "2", name: "Treinar 1 hora", xp: 100, type: "daily", completed: true, icon: "💪" },
  { id: "3", name: "Ler 30 páginas", xp: 75, type: "daily", completed: false, icon: "📖" },
  { id: "4", name: "Meditar 15 min", xp: 50, type: "daily", completed: false, icon: "🧘" },
  { id: "5", name: "Estudar 2 horas", xp: 120, type: "daily", completed: false, icon: "📚" },
  { id: "6", name: "Correr 5km", xp: 200, type: "weekly", completed: false, icon: "🏃" },
  { id: "7", name: "Projeto pessoal", xp: 300, type: "weekly", completed: false, icon: "🚀" },
  { id: "8", name: "Sem açúcar 7 dias", xp: 250, type: "weekly", completed: true, icon: "🍎" },
];

export const mockWeeklyProgress: WeeklyProgress[] = [
  { day: "Seg", completed: 5, total: 5 },
  { day: "Ter", completed: 4, total: 5 },
  { day: "Qua", completed: 5, total: 5 },
  { day: "Qui", completed: 3, total: 5 },
  { day: "Sex", completed: 5, total: 5 },
  { day: "Sáb", completed: 2, total: 5 },
  { day: "Dom", completed: 0, total: 5 },
];

export const mockMonthlyProgress = [
  { week: "Sem 1", percentage: 85 },
  { week: "Sem 2", percentage: 92 },
  { week: "Sem 3", percentage: 78 },
  { week: "Sem 4", percentage: 88 },
];

// API-ready fetch helpers (replace BASE_URL with your Node.js backend)
const BASE_URL = "/api";

export const api = {
  getMissions: () => fetch(`${BASE_URL}/missoes`).then(r => r.json()),
  completeMission: (id: string) => fetch(`${BASE_URL}/missoes/${id}/completar`, { method: "POST" }).then(r => r.json()),
  getProfile: () => fetch(`${BASE_URL}/perfil`).then(r => r.json()),
  getProgress: () => fetch(`${BASE_URL}/progresso`).then(r => r.json()),
};
