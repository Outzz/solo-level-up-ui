import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export const LEAGUE_CONFIG: Record<string, { label: string; color: string; icon: string; minIcon: string }> = {
  bronze: { label: "Bronze", color: "text-amber-600", icon: "🥉", minIcon: "🏅" },
  prata: { label: "Prata", color: "text-gray-400", icon: "🥈", minIcon: "🏅" },
  ouro: { label: "Ouro", color: "text-yellow-400", icon: "🥇", minIcon: "🏅" },
  safira: { label: "Safira", color: "text-blue-400", icon: "💎", minIcon: "💎" },
  rubi: { label: "Rubi", color: "text-red-400", icon: "❤️‍🔥", minIcon: "❤️‍🔥" },
  esmeralda: { label: "Esmeralda", color: "text-emerald-400", icon: "🟢", minIcon: "🟢" },
  ametista: { label: "Ametista", color: "text-purple-400", icon: "🔮", minIcon: "🔮" },
  diamante: { label: "Diamante", color: "text-cyan-300", icon: "💠", minIcon: "💠" },
  mestre: { label: "Mestre", color: "text-orange-400", icon: "👑", minIcon: "👑" },
  lenda: { label: "Lenda", color: "text-yellow-300", icon: "⚜️", minIcon: "⚜️" },
};

export const LEAGUE_ORDER = ["bronze", "prata", "ouro", "safira", "rubi", "esmeralda", "ametista", "diamante", "mestre", "lenda"];

export const useEnsureLeague = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase.rpc("ensure_league_entry", { p_user_id: user.id }).then(({ error }) => {
      if (error) console.error("Error ensuring league entry:", error);
    });
  }, [user]);
};

export const useLeaderboard = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_weekly_leaderboard");
      if (error) throw error;
      return data as { user_id: string; hunter_name: string; avatar_url: string | null; level: number; xp_earned: number; league_name: string }[];
    },
    enabled: !!user,
    refetchInterval: 30000, // refresh every 30s
  });
};

export const useUserLeague = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-league", user?.id],
    queryFn: async () => {
      const weekStart = getWeekStart();
      const { data, error } = await supabase
        .from("leagues")
        .select("*")
        .eq("user_id", user!.id)
        .eq("week_start", weekStart)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}
