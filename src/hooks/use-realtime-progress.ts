import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ProgressUpdate {
  type: 'level_up' | 'coins_earned' | 'achievement_unlocked' | 'streak_updated' | 'game_completed';
  data: Record<string, unknown>;
  timestamp: string;
}

export function useRealtimeProgress() {
  const { user } = useAuth();
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [latestUpdate, setLatestUpdate] = useState<ProgressUpdate | null>(null);

  const clearUpdates = useCallback(() => {
    setUpdates([]);
    setLatestUpdate(null);
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    // Subscribe to wallet updates
    const walletChannel = supabase
      .channel(`wallet-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'playcoins_wallets',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Wallet update:", payload);
          const update: ProgressUpdate = {
            type: 'coins_earned',
            data: payload.new as Record<string, unknown>,
            timestamp: new Date().toISOString()
          };
          setLatestUpdate(update);
          setUpdates(prev => [update, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    // Subscribe to level updates
    const levelChannel = supabase
      .channel(`level-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_levels',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Level update:", payload);
          const oldLevel = (payload.old as Record<string, unknown>)?.current_level;
          const newLevel = (payload.new as Record<string, unknown>)?.current_level;
          
          const update: ProgressUpdate = {
            type: oldLevel !== newLevel ? 'level_up' : 'coins_earned',
            data: payload.new as Record<string, unknown>,
            timestamp: new Date().toISOString()
          };
          setLatestUpdate(update);
          setUpdates(prev => [update, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    // Subscribe to streak updates
    const streakChannel = supabase
      .channel(`streak-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'learning_streaks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Streak update:", payload);
          const update: ProgressUpdate = {
            type: 'streak_updated',
            data: payload.new as Record<string, unknown>,
            timestamp: new Date().toISOString()
          };
          setLatestUpdate(update);
          setUpdates(prev => [update, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    // Subscribe to achievement unlocks
    const achievementChannel = supabase
      .channel(`achievements-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Achievement unlocked:", payload);
          const update: ProgressUpdate = {
            type: 'achievement_unlocked',
            data: payload.new as Record<string, unknown>,
            timestamp: new Date().toISOString()
          };
          setLatestUpdate(update);
          setUpdates(prev => [update, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    // Subscribe to game progress
    const gameChannel = supabase
      .channel(`games-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_game_progress',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log("Game progress update:", payload);
          const update: ProgressUpdate = {
            type: 'game_completed',
            data: payload.new as Record<string, unknown>,
            timestamp: new Date().toISOString()
          };
          setLatestUpdate(update);
          setUpdates(prev => [update, ...prev].slice(0, 50));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(walletChannel);
      supabase.removeChannel(levelChannel);
      supabase.removeChannel(streakChannel);
      supabase.removeChannel(achievementChannel);
      supabase.removeChannel(gameChannel);
    };
  }, [user?.id]);

  return {
    updates,
    latestUpdate,
    clearUpdates,
  };
}
