import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AwardRequest {
  user_id: string;
  amount: number;
  source_type: 'game' | 'task' | 'achievement' | 'bonus' | 'streak';
  source_id?: string;
  description: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, amount, source_type, source_id, description }: AwardRequest = await req.json();

    console.log(`Awarding ${amount} PlayCoins to user ${user_id} for ${source_type}`);

    if (!user_id || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request: user_id and positive amount required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get current wallet
    const { data: wallet, error: walletError } = await supabase
      .from('playcoins_wallets')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (walletError) {
      console.error('Error fetching wallet:', walletError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch wallet' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create wallet if doesn't exist
    let currentBalance = 0;
    let totalEarned = 0;

    if (!wallet) {
      const { data: newWallet, error: createError } = await supabase
        .from('playcoins_wallets')
        .insert({ user_id, balance: amount, total_earned: amount })
        .select()
        .single();

      if (createError) {
        console.error('Error creating wallet:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create wallet' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      currentBalance = newWallet.balance;
      totalEarned = newWallet.total_earned;
    } else {
      // Update existing wallet
      const newBalance = wallet.balance + amount;
      const newTotalEarned = wallet.total_earned + amount;

      const { data: updatedWallet, error: updateError } = await supabase
        .from('playcoins_wallets')
        .update({ 
          balance: newBalance, 
          total_earned: newTotalEarned,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user_id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating wallet:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to update wallet' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      currentBalance = updatedWallet.balance;
      totalEarned = updatedWallet.total_earned;
    }

    // Record transaction
    const { error: txError } = await supabase
      .from('playcoins_transactions')
      .insert({
        user_id,
        amount,
        transaction_type: 'earn',
        source_type,
        source_id: source_id || null,
        description,
        balance_after: currentBalance
      });

    if (txError) {
      console.error('Error recording transaction:', txError);
    }

    console.log(`Successfully awarded ${amount} PlayCoins. New balance: ${currentBalance}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        balance: currentBalance,
        total_earned: totalEarned,
        amount_awarded: amount
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in award-playcoins:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
