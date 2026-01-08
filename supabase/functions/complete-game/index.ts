import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CompleteGameRequest {
  user_id: string;
  game_id: string;
  score: number;
  max_score: number;
  time_spent_seconds: number;
  game_state?: Record<string, unknown>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, game_id, score, max_score, time_spent_seconds, game_state }: CompleteGameRequest = await req.json();

    console.log(`Completing game ${game_id} for user ${user_id}`);

    if (!user_id || !game_id) {
      return new Response(
        JSON.stringify({ error: 'user_id and game_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get game details
    const { data: game, error: gameError } = await supabase
      .from('games')
      .select('*')
      .eq('id', game_id)
      .maybeSingle();

    if (gameError || !game) {
      console.error('Game not found:', gameError);
      return new Response(
        JSON.stringify({ error: 'Game not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate completion percentage
    const completionPercentage = max_score > 0 ? Math.round((score / max_score) * 100) : 100;
    const isCompleted = completionPercentage >= 70; // 70% threshold for completion

    // Get existing progress
    const { data: existingProgress } = await supabase
      .from('user_game_progress')
      .select('*')
      .eq('user_id', user_id)
      .eq('game_id', game_id)
      .maybeSingle();

    const isFirstCompletion = !existingProgress?.is_completed && isCompleted;
    const isNewHighScore = !existingProgress || score > existingProgress.score;

    // Update or create progress
    const progressData = {
      user_id,
      game_id,
      score: isNewHighScore ? score : (existingProgress?.score || score),
      max_score,
      completion_percentage: Math.max(completionPercentage, existingProgress?.completion_percentage || 0),
      is_completed: existingProgress?.is_completed || isCompleted,
      completed_at: isFirstCompletion ? new Date().toISOString() : existingProgress?.completed_at,
      time_spent_seconds: (existingProgress?.time_spent_seconds || 0) + time_spent_seconds,
      attempts: (existingProgress?.attempts || 0) + 1,
      game_state: game_state || existingProgress?.game_state || {},
      last_played_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingProgress) {
      await supabase
        .from('user_game_progress')
        .update(progressData)
        .eq('id', existingProgress.id);
    } else {
      await supabase
        .from('user_game_progress')
        .insert(progressData);
    }

    // Award rewards on first completion
    let playcoinsAwarded = 0;
    let xpAwarded = 0;

    if (isFirstCompletion) {
      playcoinsAwarded = game.playcoins_reward;
      xpAwarded = game.xp_reward;

      // Award PlayCoins
      if (playcoinsAwarded > 0) {
        await supabase.functions.invoke('award-playcoins', {
          body: {
            user_id,
            amount: playcoinsAwarded,
            source_type: 'game',
            source_id: game_id,
            description: `Completed: ${game.name}`
          }
        });
      }

      // Award XP
      if (xpAwarded > 0) {
        await supabase.functions.invoke('update-xp-level', {
          body: {
            user_id,
            xp_amount: xpAwarded,
            source: `game:${game.name}`
          }
        });
      }

      // Update streak
      await supabase.functions.invoke('update-streak', {
        body: { user_id }
      });

      // Check achievements
      await supabase.functions.invoke('check-achievements', {
        body: { user_id, trigger_type: 'game_completed' }
      });
    }

    console.log(`Game completed: score ${score}/${max_score}, first completion: ${isFirstCompletion}`);

    return new Response(
      JSON.stringify({
        success: true,
        is_completed: isCompleted,
        is_first_completion: isFirstCompletion,
        is_new_high_score: isNewHighScore,
        completion_percentage: completionPercentage,
        playcoins_awarded: playcoinsAwarded,
        xp_awarded: xpAwarded
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in complete-game:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
