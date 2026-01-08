import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StreakRequest {
  user_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id }: StreakRequest = await req.json();

    console.log(`Updating streak for user ${user_id}`);

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'user_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Get current streak data
    const { data: streakData, error: streakError } = await supabase
      .from('learning_streaks')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (streakError) {
      console.error('Error fetching streak:', streakError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch streak data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let currentStreak = 0;
    let longestStreak = 0;
    let streakMaintained = false;
    let streakIncreased = false;

    if (streakData) {
      const lastActivity = streakData.last_activity_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastActivity === today) {
        // Already logged today
        currentStreak = streakData.current_streak;
        longestStreak = streakData.longest_streak;
        streakMaintained = true;
      } else if (lastActivity === yesterdayStr) {
        // Consecutive day - increase streak
        currentStreak = streakData.current_streak + 1;
        longestStreak = Math.max(streakData.longest_streak, currentStreak);
        streakIncreased = true;
      } else {
        // Streak broken - reset to 1
        currentStreak = 1;
        longestStreak = streakData.longest_streak;
      }

      const { error: updateError } = await supabase
        .from('learning_streaks')
        .update({
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id);

      if (updateError) {
        console.error('Error updating streak:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update streak' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      // Create new streak record
      currentStreak = 1;
      longestStreak = 1;
      streakIncreased = true;

      const { error: insertError } = await supabase
        .from('learning_streaks')
        .insert({
          user_id,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today
        });

      if (insertError) {
        console.error('Error creating streak:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create streak record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Streak updated: ${currentStreak} days (longest: ${longestStreak})`);

    return new Response(
      JSON.stringify({
        success: true,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        streak_increased: streakIncreased,
        streak_maintained: streakMaintained
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-streak:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
