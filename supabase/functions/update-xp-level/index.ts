import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface XPRequest {
  user_id: string;
  xp_amount: number;
  source: string;
}

// Calculate XP needed for a given level (exponential curve)
function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, xp_amount, source }: XPRequest = await req.json();

    console.log(`Adding ${xp_amount} XP to user ${user_id} from ${source}`);

    if (!user_id || !xp_amount || xp_amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'user_id and positive xp_amount required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current level data
    const { data: levelData, error: levelError } = await supabase
      .from('user_levels')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (levelError) {
      console.error('Error fetching level:', levelError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch level data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let currentLevel = 1;
    let currentXP = 0;
    let totalXP = 0;
    let xpToNextLevel = 100;

    if (levelData) {
      currentLevel = levelData.current_level;
      currentXP = levelData.current_xp;
      totalXP = levelData.total_xp;
      xpToNextLevel = levelData.xp_to_next_level;
    }

    // Add XP
    let newCurrentXP = currentXP + xp_amount;
    const newTotalXP = totalXP + xp_amount;
    let newLevel = currentLevel;
    let levelsGained = 0;

    // Check for level ups
    while (newCurrentXP >= xpToNextLevel) {
      newCurrentXP -= xpToNextLevel;
      newLevel++;
      levelsGained++;
      xpToNextLevel = xpForLevel(newLevel);
      console.log(`Level up! Now level ${newLevel}`);
    }

    // Update or create level record
    if (levelData) {
      const { error: updateError } = await supabase
        .from('user_levels')
        .update({
          current_xp: newCurrentXP,
          total_xp: newTotalXP,
          current_level: newLevel,
          xp_to_next_level: xpToNextLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id);

      if (updateError) {
        console.error('Error updating level:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update level' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      const { error: insertError } = await supabase
        .from('user_levels')
        .insert({
          user_id,
          current_xp: newCurrentXP,
          total_xp: newTotalXP,
          current_level: newLevel,
          xp_to_next_level: xpToNextLevel
        });

      if (insertError) {
        console.error('Error creating level:', insertError);
        return new Response(
          JSON.stringify({ error: 'Failed to create level record' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`XP updated: Level ${newLevel}, XP ${newCurrentXP}/${xpToNextLevel}`);

    return new Response(
      JSON.stringify({
        success: true,
        current_level: newLevel,
        current_xp: newCurrentXP,
        total_xp: newTotalXP,
        xp_to_next_level: xpToNextLevel,
        xp_gained: xp_amount,
        levels_gained: levelsGained,
        level_up: levelsGained > 0
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in update-xp-level:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
