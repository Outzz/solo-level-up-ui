import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";

export const LEAGUE_CONFIG: Record<string, { label: string; color: string; icon: string; minIcon: string; bonusXp: number }> = {
  bronze: { label: "Bronze", color: "text-amber-600", icon: "🥉", minIcon: "🏅", bonusXp: 0 },
  prata: { label: "Prata", color: "text-gray-400", icon: "🥈", minIcon: "🏅", bonusXp: 100 },
  ouro: { label: "Ouro", color: "text-yellow-400", icon: "🥇", minIcon: "🏅", bonusXp: 200 },
  safira: { label: "Safira", color: "text-blue-400", icon: "💎", minIcon: "💎", bonusXp: 400 },
  rubi: { label: "Rubi", color: "text-red-400", icon: "❤️‍🔥", minIcon: "❤️‍🔥", bonusXp: 600 },
  esmeralda: { label: "Esmeralda", color: "text-emerald-400", icon: "🟢", minIcon: "🟢", bonusXp: 1000 },
  ametista: { label: "Ametista", color: "text-purple-400", icon: "🔮", minIcon: "🔮", bonusXp: 1500 },
  diamante: { label: "Diamante", color: "text-cyan-300", icon: "💠", minIcon: "💠", bonusXp: 2500 },
  mestre: { label: "Mestre", color: "text-orange-400", icon: "👑", minIcon: "👑", bonusXp: 4000 },
  lenda: { label: "Lenda", color: "text-yellow-300", icon: "⚜️", minIcon: "⚜️", bonusXp: 7500 },
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
    refetchInterval: 30000,
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

export const useLeagueRewards = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["league-rewards", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("league_rewards")
        .select("*")
        .eq("user_id", user!.id)
        .eq("seen", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useMarkRewardSeen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rewardId: string) => {
      const { error } = await supabase
        .from("league_rewards")
        .update({ seen: true })
        .eq("id", rewardId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["league-rewards"] });
    },
  });
};

function getWeekStart() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split("T")[0];
}
