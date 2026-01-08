import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SpendRequest {
  user_id: string;
  reward_id: string;
  delivery_address?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { user_id, reward_id, delivery_address }: SpendRequest = await req.json();

    console.log(`User ${user_id} attempting to redeem reward ${reward_id}`);

    if (!user_id || !reward_id) {
      return new Response(
        JSON.stringify({ error: 'user_id and reward_id required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get reward details
    const { data: reward, error: rewardError } = await supabase
      .from('rewards')
      .select('*')
      .eq('id', reward_id)
      .eq('is_active', true)
      .maybeSingle();

    if (rewardError || !reward) {
      console.error('Reward not found:', rewardError);
      return new Response(
        JSON.stringify({ error: 'Reward not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check stock
    if (reward.stock_quantity !== null && reward.stock_quantity <= 0) {
      return new Response(
        JSON.stringify({ error: 'Reward out of stock' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user wallet
    const { data: wallet, error: walletError } = await supabase
      .from('playcoins_wallets')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (walletError || !wallet) {
      console.error('Wallet not found:', walletError);
      return new Response(
        JSON.stringify({ error: 'Wallet not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check balance
    if (wallet.balance < reward.playcoins_cost) {
      return new Response(
        JSON.stringify({ 
          error: 'Insufficient balance',
          required: reward.playcoins_cost,
          current: wallet.balance
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Deduct from wallet
    const newBalance = wallet.balance - reward.playcoins_cost;
    const newTotalSpent = wallet.total_spent + reward.playcoins_cost;

    const { error: updateError } = await supabase
      .from('playcoins_wallets')
      .update({ 
        balance: newBalance, 
        total_spent: newTotalSpent,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Error updating wallet:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update wallet' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Record transaction
    const { error: txError } = await supabase
      .from('playcoins_transactions')
      .insert({
        user_id,
        amount: -reward.playcoins_cost,
        transaction_type: 'spend',
        source_type: 'reward',
        source_id: reward_id,
        description: `Redeemed: ${reward.name}`,
        balance_after: newBalance
      });

    if (txError) {
      console.error('Error recording transaction:', txError);
    }

    // Create redemption record
    const { data: redemption, error: redemptionError } = await supabase
      .from('reward_redemptions')
      .insert({
        user_id,
        reward_id,
        playcoins_spent: reward.playcoins_cost,
        delivery_address,
        status: 'pending'
      })
      .select()
      .single();

    if (redemptionError) {
      console.error('Error creating redemption:', redemptionError);
    }

    // Update stock if applicable
    if (reward.stock_quantity !== null) {
      await supabase
        .from('rewards')
        .update({ stock_quantity: reward.stock_quantity - 1 })
        .eq('id', reward_id);
    }

    console.log(`Successfully redeemed reward. New balance: ${newBalance}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        balance: newBalance,
        redemption_id: redemption?.id,
        reward: reward.name
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in spend-playcoins:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
