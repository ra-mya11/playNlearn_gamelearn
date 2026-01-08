import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GameProgress {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  max_score: number;
  completion_percentage: number;
  is_completed: boolean;
  completed_at: string | null;
  time_spent_seconds: number;
  attempts: number;
  game_state: Record<string, unknown>;
  last_played_at: string;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  subject_id: string;
  name: string;
  slug: string;
  description: string | null;
  instructions: string | null;
  difficulty_level: number;
  playcoins_reward: number;
  xp_reward: number;
  estimated_duration_minutes: number;
  order_index: number;
  is_active: boolean;
}

export function useGameProgress(gameId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all games
  const gamesQuery = useQuery({
    queryKey: ["games"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("games")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      
      if (error) throw error;
      return data as Game[];
    },
  });

  // Get user's game progress
  const progressQuery = useQuery({
    queryKey: ["game-progress", user?.id, gameId],
    queryFn: async () => {
      if (!user?.id) return gameId ? null : [];
      
      let query = supabase
        .from("user_game_progress")
        .select("*")
        .eq("user_id", user.id);
      
      if (gameId) {
        const { data, error } = await query.eq("game_id", gameId).maybeSingle();
        if (error) throw error;
        return data as GameProgress | null;
      } else {
        const { data, error } = await query;
        if (error) throw error;
        return data as GameProgress[];
      }
    },
    enabled: !!user?.id,
  });

  const completeGameMutation = useMutation({
    mutationFn: async ({
      game_id,
      score,
      max_score,
      time_spent_seconds,
      game_state
    }: {
      game_id: string;
      score: number;
      max_score: number;
      time_spent_seconds: number;
      game_state?: Record<string, unknown>;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.functions.invoke("complete-game", {
        body: {
          user_id: user.id,
          game_id,
          score,
          max_score,
          time_spent_seconds,
          game_state
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["game-progress"] });
      queryClient.invalidateQueries({ queryKey: ["playcoins-wallet"] });
      queryClient.invalidateQueries({ queryKey: ["user-level"] });
      queryClient.invalidateQueries({ queryKey: ["learning-streak"] });
      
      if (data.is_first_completion) {
        toast.success(`Game Complete! +${data.playcoins_awarded} PlayCoins, +${data.xp_awarded} XP`);
      } else if (data.is_new_high_score) {
        toast.success("New High Score!");
      } else {
        toast.success("Good effort! Keep practicing!");
      }
    },
    onError: (error) => {
      toast.error("Failed to save progress");
      console.error(error);
    }
  });

  // Calculate overall stats
  const progressList = Array.isArray(progressQuery.data) ? progressQuery.data : [];
  const completedGames = progressList.filter(p => p.is_completed).length;
  const totalGames = gamesQuery.data?.length ?? 0;
  const totalTimeSpent = progressList.reduce((sum, p) => sum + p.time_spent_seconds, 0);

  return {
    games: gamesQuery.data ?? [],
    progress: progressQuery.data,
    completedGames,
    totalGames,
    totalTimeSpent,
    isLoading: gamesQuery.isLoading || progressQuery.isLoading,
    completeGame: completeGameMutation.mutate,
    isCompleting: completeGameMutation.isPending,
  };
}
