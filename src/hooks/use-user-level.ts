import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface UserLevel {
  id: string;
  user_id: string;
  current_level: number;
  current_xp: number;
  total_xp: number;
  xp_to_next_level: number;
  created_at: string;
  updated_at: string;
}

export function useUserLevel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const levelQuery = useQuery({
    queryKey: ["user-level", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from("user_levels")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as UserLevel | null;
    },
    enabled: !!user?.id,
  });

  const addXPMutation = useMutation({
    mutationFn: async ({ 
      xp_amount, 
      source 
    }: { 
      xp_amount: number; 
      source: string;
    }) => {
      if (!user?.id) throw new Error("Not authenticated");
      
      const { data, error } = await supabase.functions.invoke("update-xp-level", {
        body: { 
          user_id: user.id, 
          xp_amount, 
          source 
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user-level"] });
      if (data.level_up) {
        toast.success(`Level Up! You're now Level ${data.current_level}!`);
      } else {
        toast.success(`+${data.xp_gained} XP!`);
      }
    },
    onError: (error) => {
      toast.error("Failed to update XP");
      console.error(error);
    }
  });

  const level = levelQuery.data?.current_level ?? 1;
  const currentXP = levelQuery.data?.current_xp ?? 0;
  const xpToNextLevel = levelQuery.data?.xp_to_next_level ?? 100;
  const progressPercent = xpToNextLevel > 0 ? Math.round((currentXP / xpToNextLevel) * 100) : 0;

  return {
    levelData: levelQuery.data,
    level,
    currentXP,
    totalXP: levelQuery.data?.total_xp ?? 0,
    xpToNextLevel,
    progressPercent,
    isLoading: levelQuery.isLoading,
    addXP: addXPMutation.mutate,
    isAddingXP: addXPMutation.isPending,
  };
}
