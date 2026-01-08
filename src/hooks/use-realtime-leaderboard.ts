import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface LeaderboardEntry {
  user_id: string;
  current_level: number;
  total_xp: number;
  profile?: {
    full_name: string;
    avatar_url: string | null;
    village: string | null;
  };
}

export function useRealtimeLeaderboard(limit = 20) {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRank, setUserRank] = useState<number | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data: levels, error: levelsError } = await supabase
        .from("user_levels")
        .select("user_id, current_level, total_xp")
        .order("total_xp", { ascending: false })
        .limit(limit);

      if (levelsError) throw levelsError;

      const userIds = levels?.map(l => l.user_id) ?? [];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, village")
        .in("id", userIds);

      const profileMap = new Map(profiles?.map(p => [p.id, p]));
      
      const entries: LeaderboardEntry[] = levels?.map(level => ({
        ...level,
        profile: profileMap.get(level.user_id) ? {
          full_name: profileMap.get(level.user_id)!.full_name,
          avatar_url: profileMap.get(level.user_id)!.avatar_url,
          village: profileMap.get(level.user_id)!.village,
        } : undefined
      })) ?? [];

      setLeaderboard(entries);
      
      // Find current user's rank
      const rank = entries.findIndex(e => e.user_id === user?.id);
      setUserRank(rank >= 0 ? rank + 1 : null);

    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  }, [limit, user?.id]);

  useEffect(() => {
    fetchLeaderboard();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('leaderboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_levels'
        },
        () => {
          console.log("Leaderboard update detected");
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    userRank,
    isLoading,
    refresh: fetchLeaderboard,
  };
}
