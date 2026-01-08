import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  requirement_type: string;
  requirement_value: number;
  xp_reward: number;
  playcoins_reward: number;
  is_active: boolean;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  progress: number;
  is_claimed: boolean;
  unlocked_at: string;
  claimed_at: string | null;
  achievement?: Achievement;
}

export function useAchievements() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all available achievements
  const achievementsQuery = useQuery({
    queryKey: ["achievements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("achievements")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });
      
      if (error) throw error;
      return data as Achievement[];
    },
  });

  // Get user's unlocked achievements
  const userAchievementsQuery = useQuery({
    queryKey: ["user-achievements", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("user_achievements")
        .select(`
          *,
          achievement:achievements(*)
        `)
        .eq("user_id", user.id)
        .order("unlocked_at", { ascending: false });
      
      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!user?.id,
  });

  const checkAchievementsMutation = useMutation({
    mutationFn: async (trigger_type?: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.functions.invoke("check-achievements", {
        body: { user_id: user.id, trigger_type }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
      if (data.newly_unlocked?.length > 0) {
        data.newly_unlocked.forEach((achievement: { name: string }) => {
          toast.success(`Achievement Unlocked: ${achievement.name}!`);
        });
      }
    },
  });

  const claimAchievementMutation = useMutation({
    mutationFn: async (achievement_id: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("user_achievements")
        .update({ 
          is_claimed: true, 
          claimed_at: new Date().toISOString() 
        })
        .eq("user_id", user.id)
        .eq("achievement_id", achievement_id);
      
      if (error) throw error;
      return achievement_id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-achievements"] });
      toast.success("Rewards claimed!");
    },
    onError: (error) => {
      toast.error("Failed to claim achievement");
      console.error(error);
    }
  });

  const unlockedIds = new Set(userAchievementsQuery.data?.map(ua => ua.achievement_id) || []);
  const unlockedCount = unlockedIds.size;
  const totalCount = achievementsQuery.data?.length ?? 0;

  return {
    achievements: achievementsQuery.data ?? [],
    userAchievements: userAchievementsQuery.data ?? [],
    unlockedIds,
    unlockedCount,
    totalCount,
    isLoading: achievementsQuery.isLoading || userAchievementsQuery.isLoading,
    checkAchievements: checkAchievementsMutation.mutate,
    claimAchievement: claimAchievementMutation.mutate,
    isChecking: checkAchievementsMutation.isPending,
    isClaiming: claimAchievementMutation.isPending,
  };
}
