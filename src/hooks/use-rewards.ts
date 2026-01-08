import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Reward {
  id: string;
  name: string;
  description: string;
  category: string;
  playcoins_cost: number;
  stock_quantity: number | null;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  playcoins_spent: number;
  status: string;
  delivery_address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  reward?: Reward;
}

export function useRewards() {
  const { user } = useAuth();

  // Get all available rewards
  const rewardsQuery = useQuery({
    queryKey: ["rewards"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .order("playcoins_cost", { ascending: true });
      
      if (error) throw error;
      return data as Reward[];
    },
  });

  // Get user's redemptions
  const redemptionsQuery = useQuery({
    queryKey: ["reward-redemptions", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select(`
          *,
          reward:rewards(*)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as RewardRedemption[];
    },
    enabled: !!user?.id,
  });

  // Group rewards by category
  const rewardsByCategory = rewardsQuery.data?.reduce((acc, reward) => {
    if (!acc[reward.category]) {
      acc[reward.category] = [];
    }
    acc[reward.category].push(reward);
    return acc;
  }, {} as Record<string, Reward[]>) ?? {};

  return {
    rewards: rewardsQuery.data ?? [],
    rewardsByCategory,
    redemptions: redemptionsQuery.data ?? [],
    isLoading: rewardsQuery.isLoading || redemptionsQuery.isLoading,
    categories: Object.keys(rewardsByCategory),
  };
}
