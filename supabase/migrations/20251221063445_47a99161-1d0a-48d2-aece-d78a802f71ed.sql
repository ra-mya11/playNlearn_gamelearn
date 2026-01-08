-- Create weekly challenges table
CREATE TABLE public.weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL DEFAULT 'game_completion',
  requirement_value INTEGER NOT NULL DEFAULT 5,
  playcoins_reward INTEGER NOT NULL DEFAULT 200,
  xp_reward INTEGER NOT NULL DEFAULT 400,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user weekly challenges tracking
CREATE TABLE public.user_weekly_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id, week_start_date)
);

-- Enable RLS
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_weekly_challenges ENABLE ROW LEVEL SECURITY;

-- RLS policies for weekly_challenges
CREATE POLICY "Anyone can view active weekly challenges" 
ON public.weekly_challenges 
FOR SELECT 
USING (is_active = true);

-- RLS policies for user_weekly_challenges
CREATE POLICY "Users can view their own weekly challenges" 
ON public.user_weekly_challenges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own weekly challenges" 
ON public.user_weekly_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly challenges" 
ON public.user_weekly_challenges 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Seed weekly challenges
INSERT INTO public.weekly_challenges (title, description, challenge_type, requirement_value, playcoins_reward, xp_reward) VALUES
('Weekly Champion', 'Complete 10 game levels this week', 'game_completion', 10, 300, 500),
('Subject Explorer', 'Play games from 5 different subjects', 'subject_variety', 5, 250, 400),
('Perfect Week', 'Get 100% on 5 different games', 'perfect_score', 5, 400, 600),
('Streak Master', 'Maintain a 7-day learning streak', 'streak_days', 7, 350, 550),
('Knowledge Collector', 'Earn 500 XP this week', 'xp_earned', 500, 200, 300);