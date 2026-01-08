import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useNotificationBadges() {
  const { user } = useAuth();

  // Get unclaimed achievements count
  const { data: unclaimedAchievements = 0 } = useQuery({
    queryKey: ["unclaimed-achievements-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const { count, error } = await supabase
        .from("user_achievements")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("is_claimed", false);
      
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user?.id,
  });

  // Get unclaimed daily challenges count
  const { data: unclaimedDailyChallenges = 0 } = useQuery({
    queryKey: ["unclaimed-daily-challenges-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      const today = new Date().toISOString().split('T')[0];
      const { count, error } = await supabase
        .from("user_daily_challenges")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("challenge_date", today)
        .eq("is_completed", true)
        .eq("is_claimed", false);
      
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user?.id,
  });

  // Get unclaimed weekly challenges count
  const { data: unclaimedWeeklyChallenges = 0 } = useQuery({
    queryKey: ["unclaimed-weekly-challenges-count", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;
      // Get current week start (Monday)
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const weekStart = new Date(today.setDate(diff));
      const weekStartStr = weekStart.toISOString().split('T')[0];
      
      const { count, error } = await supabase
        .from("user_weekly_challenges")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("week_start_date", weekStartStr)
        .eq("is_completed", true)
        .eq("is_claimed", false);
      
      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!user?.id,
  });

  const totalProgressBadges = unclaimedAchievements;
  const totalRewardsBadges = unclaimedDailyChallenges + unclaimedWeeklyChallenges;

  return {
    unclaimedAchievements,
    unclaimedDailyChallenges,
    unclaimedWeeklyChallenges,
    totalProgressBadges,
    totalRewardsBadges,
  };
}
