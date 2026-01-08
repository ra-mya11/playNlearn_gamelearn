-- Enable realtime for user_levels table (for leaderboard)
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_levels;

-- Enable realtime for playcoins_wallets table
ALTER PUBLICATION supabase_realtime ADD TABLE public.playcoins_wallets;

-- Enable realtime for learning_streaks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.learning_streaks;

-- Enable realtime for user_achievements table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;

-- Enable realtime for user_game_progress table
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_game_progress;