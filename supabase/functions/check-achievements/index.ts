import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckAchievementsRequest {
  user_id: string;
  trigger_type?: string;
}

interface Achievement {
  id: string;
  name: string;
  requirement_type: string;
  requirement_value: number;
  requirement_metadata: Record<string, unknown>;
  xp_reward: number;
  playcoins_reward: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, trigger_type }: CheckAchievementsRequest = await req.json();

    console.log(`Checking achievements for user ${user_id}`);

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get all active achievements
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_active', true);

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch achievements' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's already unlocked achievements
    const { data: userAchievements, error: userAchievementsError } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', user_id);

    if (userAchievementsError) {
      console.error('Error fetching user achievements:', userAchievementsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user achievements' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);
    const newlyUnlocked: Achievement[] = [];

    // Get user stats for checking requirements
    const [levelData, streakData, walletData, gameProgressData, taskData] = await Promise.all([
      supabase.from('user_levels').select('*').eq('user_id', user_id).maybeSingle(),
      supabase.from('learning_streaks').select('*').eq('user_id', user_id).maybeSingle(),
      supabase.from('playcoins_wallets').select('*').eq('user_id', user_id).maybeSingle(),
      supabase.from('user_game_progress').select('*').eq('user_id', user_id).eq('is_completed', true),
      supabase.from('task_submissions').select('*').eq('user_id', user_id).eq('status', 'approved')
    ]);

    const userStats = {
      level: levelData.data?.current_level || 1,
      total_xp: levelData.data?.total_xp || 0,
      current_streak: streakData.data?.current_streak || 0,
      longest_streak: streakData.data?.longest_streak || 0,
      total_earned: walletData.data?.total_earned || 0,
      games_completed: gameProgressData.data?.length || 0,
      tasks_completed: taskData.data?.length || 0
    };

    // Check each achievement
    for (const achievement of achievements || []) {
      if (unlockedIds.has(achievement.id)) continue;

      let progress = 0;
      let isUnlocked = false;

      switch (achievement.requirement_type) {
        case 'level_reached':
          progress = userStats.level;
          isUnlocked = progress >= achievement.requirement_value;
          break;
        case 'xp_earned':
          progress = userStats.total_xp;
          isUnlocked = progress >= achievement.requirement_value;
          break;
        case 'streak_days':
          progress = userStats.current_streak;
          isUnlocked = progress >= achievement.requirement_value;
          break;
        case 'longest_streak':
          progress = userStats.longest_streak;
          isUnlocked = progress >= achievement.requirement_value;
          break;
        case 'playcoins_earned':
          progress = userStats.total_earned;
          isUnlocked = progress >= achievement.requirement_value;
          break;
        case 'games_completed':
          progress = userStats.games_completed;
          isUnlocked = progress >= achievement.requirement_value;
          break;
        case 'tasks_completed':
          progress = userStats.tasks_completed;
          isUnlocked = progress >= achievement.requirement_value;
          break;
        default:
          continue;
      }

      // Update progress
      const existingProgress = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user_id)
        .eq('achievement_id', achievement.id)
        .maybeSingle();

      if (isUnlocked && !existingProgress.data) {
        // Unlock achievement
        const { error: unlockError } = await supabase
          .from('user_achievements')
          .insert({
            user_id,
            achievement_id: achievement.id,
            progress: achievement.requirement_value,
            unlocked_at: new Date().toISOString()
          });

        if (!unlockError) {
          newlyUnlocked.push(achievement);
          console.log(`Achievement unlocked: ${achievement.name}`);
        }
      }
    }

    // Award PlayCoins and XP for newly unlocked achievements
    for (const achievement of newlyUnlocked) {
      if (achievement.playcoins_reward > 0) {
        await supabase.functions.invoke('award-playcoins', {
          body: {
            user_id,
            amount: achievement.playcoins_reward,
            source_type: 'achievement',
            source_id: achievement.id,
            description: `Achievement: ${achievement.name}`
          }
        });
      }

      if (achievement.xp_reward > 0) {
        await supabase.functions.invoke('update-xp-level', {
          body: {
            user_id,
            xp_amount: achievement.xp_reward,
            source: `achievement:${achievement.name}`
          }
        });
      }
    }

    console.log(`Checked ${achievements?.length || 0} achievements, unlocked ${newlyUnlocked.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        newly_unlocked: newlyUnlocked.map(a => ({
          id: a.id,
          name: a.name,
          xp_reward: a.xp_reward,
          playcoins_reward: a.playcoins_reward
        })),
        total_unlocked: unlockedIds.size + newlyUnlocked.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-achievements:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
