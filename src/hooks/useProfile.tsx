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
      // Get mission XP
      const { data: mission } = await supabase
        .from("missions")
        .select("xp")
        .eq("id", missionId)
        .single();

      // Mark complete
      const { error } = await supabase
        .from("missions")
        .update({ completed: true })
        .eq("id", missionId);
      if (error) throw error;

      // Add XP to profile
      if (mission) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("xp, xp_to_next, level")
          .eq("user_id", user!.id)
          .single();

        if (profile) {
          let newXp = profile.xp + mission.xp;
          let newLevel = profile.level;
          let newXpToNext = profile.xp_to_next;

          while (newXp >= newXpToNext) {
            newXp -= newXpToNext;
            newLevel++;
            newXpToNext = Math.floor(newXpToNext * 1.2);
          }

          await supabase
            .from("profiles")
            .update({ xp: newXp, level: newLevel, xp_to_next: newXpToNext })
            .eq("user_id", user!.id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
};

export const useAddMission = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mission: { name: string; xp: number; type: string; icon: string }) => {
      const { error } = await supabase
        .from("missions")
        .insert({ ...mission, user_id: user!.id });
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
