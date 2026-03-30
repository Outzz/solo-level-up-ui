import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { hunter_name?: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("user_id", user!.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useMissions = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["missions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("missions")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useCompleteMission = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (missionId: string) => {
      const { data: mission } = await supabase
        .from("missions")
        .select("xp")
        .eq("id", missionId)
        .single();

      const { error } = await supabase
        .from("missions")
        .update({ completed: true })
        .eq("id", missionId);
      if (error) throw error;

      let leveledUp = false;
      let newLevel = 1;

      if (mission) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("xp, xp_to_next, level, streak")
          .eq("user_id", user!.id)
          .single();

        if (profile) {
          let newXp = profile.xp + mission.xp;
          newLevel = profile.level;
          let newXpToNext = profile.xp_to_next;

          while (newXp >= newXpToNext) {
            newXp -= newXpToNext;
            newLevel++;
            newXpToNext = Math.floor(newXpToNext * 1.2);
          }

          leveledUp = newLevel > profile.level;

          await supabase
            .from("profiles")
            .update({ xp: newXp, level: newLevel, xp_to_next: newXpToNext })
            .eq("user_id", user!.id);

          // Add XP to weekly league
          await supabase.rpc("add_league_xp", { p_user_id: user!.id, p_xp: mission.xp });

          // Check and unlock achievements
          const unlockedAchievements = await checkAndUnlockAchievements(user!.id, profile.streak, newLevel);

          return { leveledUp, newLevel, unlockedAchievements };
        }
      }

      return { leveledUp, newLevel, unlockedAchievements: [] as { name: string; icon: string; description: string }[] };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
};

async function checkAndUnlockAchievements(userId: string, streak: number, level: number) {
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", userId)
    .eq("unlocked", false);

  if (!achievements || achievements.length === 0) return [];

  // Count completed missions
  const { count: completedCount } = await supabase
    .from("missions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("completed", true);

  const unlocked: { name: string; icon: string; description: string }[] = [];

  for (const ach of achievements) {
    let shouldUnlock = false;

    if (ach.name === "Primeira Missão" && (completedCount ?? 0) >= 1) shouldUnlock = true;
    if (ach.name === "7 Dias Seguidos" && streak >= 7) shouldUnlock = true;
    if (ach.name === "30 Dias Seguidos" && streak >= 30) shouldUnlock = true;
    // Level-based achievements
    if (ach.name === "Nível 5" && level >= 5) shouldUnlock = true;
    if (ach.name === "Nível 10" && level >= 10) shouldUnlock = true;

    if (shouldUnlock) {
      await supabase
        .from("achievements")
        .update({ unlocked: true, unlocked_at: new Date().toISOString() })
        .eq("id", ach.id);
      unlocked.push({ name: ach.name, icon: ach.icon, description: ach.description });
    }
  }

  return unlocked;
}

const XP_BY_TYPE: Record<string, number> = {
  daily: 50,
  weekly: 150,
  monthly: 500,
};

export const getXpByType = (type: string) => XP_BY_TYPE[type] ?? 50;

export const useAddMission = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mission: { name: string; type: string; icon: string }) => {
      const xp = getXpByType(mission.type);
      const { error } = await supabase
        .from("missions")
        .insert({ ...mission, xp, user_id: user!.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
};

export const useEditMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, xp }: { id: string; name: string; xp: number }) => {
      const { error } = await supabase
        .from("missions")
        .update({ name, xp })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
};

export const useDeleteMission = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("missions")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    },
  });
};

export const useAchievements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["achievements", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useTitles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["titles", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("titles")
        .select("*")
        .eq("user_id", user!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};
