-- Create daily challenges table
CREATE TABLE public.daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL DEFAULT 'game_completion',
  requirement_value INTEGER NOT NULL DEFAULT 1,
  playcoins_reward INTEGER NOT NULL DEFAULT 50,
  xp_reward INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user daily challenges tracking
CREATE TABLE public.user_daily_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  is_claimed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  claimed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id, challenge_date)
);

-- Enable RLS
ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_daily_challenges ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily_challenges (read-only for all authenticated users)
CREATE POLICY "Anyone can view active daily challenges" 
ON public.daily_challenges 
FOR SELECT 
USING (is_active = true);

-- RLS policies for user_daily_challenges
CREATE POLICY "Users can view their own daily challenges" 
ON public.user_daily_challenges 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own daily challenges" 
ON public.user_daily_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily challenges" 
ON public.user_daily_challenges 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Seed some daily challenges
INSERT INTO public.daily_challenges (title, description, challenge_type, requirement_value, playcoins_reward, xp_reward) VALUES
('Game Master', 'Complete 2 game levels', 'game_completion', 2, 75, 150),
('Quick Learner', 'Score 100% on any quiz', 'perfect_score', 1, 100, 200),
('Streak Keeper', 'Maintain your learning streak', 'daily_login', 1, 30, 50),
('Knowledge Seeker', 'Try games from 3 different subjects', 'subject_variety', 3, 80, 160);