import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface LearningStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string;
  created_at: string;
  updated_at: string;
}

export function useStreak() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const streakQuery = useQuery({
    queryKey: ["learning-streak", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("learning_streaks")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as LearningStreak | null;
    },
    enabled: !!user?.id,
  });

  const updateStreakMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.functions.invoke("update-streak", {
        body: { user_id: user.id }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["learning-streak"] });
      if (data.streak_increased) {
        toast.success(`🔥 ${data.current_streak} day streak!`);
      }
    },
    onError: (error) => {
      console.error("Failed to update streak:", error);
    }
  });

  const currentStreak = streakQuery.data?.current_streak ?? 0;
  const longestStreak = streakQuery.data?.longest_streak ?? 0;
  const lastActivityDate = streakQuery.data?.last_activity_date;

  // Check if streak is active today
  const today = new Date().toISOString().split('T')[0];
  const isActiveToday = lastActivityDate === today;

  return {
    streakData: streakQuery.data,
    currentStreak,
    longestStreak,
    lastActivityDate,
    isActiveToday,
    isLoading: streakQuery.isLoading,
    updateStreak: updateStreakMutation.mutate,
    isUpdating: updateStreakMutation.isPending,
  };
}
