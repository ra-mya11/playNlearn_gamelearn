import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface WeeklyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  requirement_value: number;
  playcoins_reward: number;
  xp_reward: number;
  is_active: boolean;
}

export interface UserWeeklyChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  week_start_date: string;
  progress: number;
  is_completed: boolean;
  is_claimed: boolean;
  completed_at: string | null;
  claimed_at: string | null;
  challenge?: WeeklyChallenge;
}

// Get the Monday of the current week
function getWeekStartDate(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  const monday = new Date(now.setDate(diff));
  return monday.toISOString().split('T')[0];
}

// Get days until next Monday
export function getDaysUntilReset(): number {
  const now = new Date();
  const day = now.getDay();
  if (day === 0) return 1; // Sunday -> 1 day to Monday
  return 8 - day; // Other days -> days until next Monday
}

export function useWeeklyChallenges() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const weekStartDate = getWeekStartDate();

  // Get all active weekly challenges
  const challengesQuery = useQuery({
    queryKey: ["weekly-challenges"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_challenges")
        .select("*")
        .eq("is_active", true);
      
      if (error) throw error;
      return data as WeeklyChallenge[];
    },
  });

  // Get user's weekly challenge progress
  const userChallengesQuery = useQuery({
    queryKey: ["user-weekly-challenges", user?.id, weekStartDate],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("user_weekly_challenges")
        .select(`
          *,
          challenge:weekly_challenges(*)
        `)
        .eq("user_id", user.id)
        .eq("week_start_date", weekStartDate);
      
      if (error) throw error;
      return data as UserWeeklyChallenge[];
    },
    enabled: !!user?.id,
  });

  // Initialize this week's challenges for user
  const initializeChallenges = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const challenges = challengesQuery.data || [];
      
      // Check which challenges are already initialized
      const existing = userChallengesQuery.data || [];
      const existingIds = new Set(existing.map(uc => uc.challenge_id));
      
      // Create entries for new challenges
      const newEntries = challenges
        .filter(c => !existingIds.has(c.id))
        .map(c => ({
          user_id: user.id,
          challenge_id: c.id,
          week_start_date: weekStartDate,
          progress: 0,
          is_completed: false,
          is_claimed: false,
        }));
      
      if (newEntries.length > 0) {
        const { error } = await supabase
          .from("user_weekly_challenges")
          .insert(newEntries);
        
        if (error) throw error;
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-weekly-challenges"] });
    },
  });

  // Update challenge progress
  const updateProgress = useMutation({
    mutationFn: async ({ challenge_type, increment = 1 }: { challenge_type: string; increment?: number }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Find the challenge(s) matching this type
      const matchingChallenges = (challengesQuery.data || []).filter(
        c => c.challenge_type === challenge_type
      );
      
      for (const challenge of matchingChallenges) {
        // Get current progress
        const { data: existing } = await supabase
          .from("user_weekly_challenges")
          .select("*")
          .eq("user_id", user.id)
          .eq("challenge_id", challenge.id)
          .eq("week_start_date", weekStartDate)
          .maybeSingle();
        
        if (existing && !existing.is_completed) {
          const newProgress = existing.progress + increment;
          const isNowComplete = newProgress >= challenge.requirement_value;
          
          await supabase
            .from("user_weekly_challenges")
            .update({
              progress: newProgress,
              is_completed: isNowComplete,
              completed_at: isNowComplete ? new Date().toISOString() : null,
            })
            .eq("id", existing.id);
        }
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-weekly-challenges"] });
    },
  });

  // Claim challenge rewards
  const claimReward = useMutation({
    mutationFn: async (userChallengeId: string) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { error } = await supabase
        .from("user_weekly_challenges")
        .update({
          is_claimed: true,
          claimed_at: new Date().toISOString(),
        })
        .eq("id", userChallengeId)
        .eq("user_id", user.id);
      
      if (error) throw error;
      return userChallengeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-weekly-challenges"] });
      toast.success("Weekly challenge rewards claimed!");
    },
    onError: () => {
      toast.error("Failed to claim rewards");
    },
  });

  // Combine challenges with user progress
  const challengesWithProgress = (challengesQuery.data || []).map(challenge => {
    const userProgress = (userChallengesQuery.data || []).find(
      uc => uc.challenge_id === challenge.id
    );
    
    return {
      ...challenge,
      progress: userProgress?.progress || 0,
      is_completed: userProgress?.is_completed || false,
      is_claimed: userProgress?.is_claimed || false,
      user_challenge_id: userProgress?.id,
    };
  });

  const completedCount = challengesWithProgress.filter(c => c.is_completed).length;
  const claimableCount = challengesWithProgress.filter(c => c.is_completed && !c.is_claimed).length;

  return {
    challenges: challengesWithProgress,
    isLoading: challengesQuery.isLoading || userChallengesQuery.isLoading,
    completedCount,
    claimableCount,
    totalCount: challengesQuery.data?.length || 0,
    daysUntilReset: getDaysUntilReset(),
    weekStartDate,
    initializeChallenges: initializeChallenges.mutate,
    updateProgress: updateProgress.mutate,
    claimReward: claimReward.mutate,
    isClaiming: claimReward.isPending,
  };
}
