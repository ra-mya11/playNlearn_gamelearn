-- Fix Critical Security Issues

-- 1. Fix user_levels leaderboard policy - make it require authentication
DROP POLICY IF EXISTS "Anyone can view levels for leaderboard" ON public.user_levels;

-- Create a new policy that allows authenticated users to view leaderboard data
CREATE POLICY "Authenticated users can view levels for leaderboard" 
ON public.user_levels 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- 2. Add explicit denial for anonymous access to profiles
-- The existing policies already check auth.uid() = id, but add a parent viewing policy
CREATE POLICY "Parents can view their children profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.parent_child_links
    WHERE parent_id = auth.uid() AND child_id = profiles.id AND is_verified = true
  )
);

-- 3. Add teacher visibility policies for monitoring students

-- Teachers can view student achievements in their classes
CREATE POLICY "Teachers can view student achievements" 
ON public.user_achievements 
FOR SELECT 
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.class_enrollments ce
    JOIN public.classes c ON c.id = ce.class_id
    WHERE ce.student_id = user_achievements.user_id AND c.teacher_id = auth.uid()
  )
);

-- Teachers can view student streaks in their classes
CREATE POLICY "Teachers can view student streaks" 
ON public.learning_streaks 
FOR SELECT 
USING (
  has_role(auth.uid(), 'teacher'::app_role)
  AND EXISTS (
    SELECT 1 FROM public.class_enrollments ce
    JOIN public.classes c ON c.id = ce.class_id
    WHERE ce.student_id = learning_streaks.user_id AND c.teacher_id = auth.uid()
  )
);

-- Parents can view their children's wallet balances
CREATE POLICY "Parents can view children wallets" 
ON public.playcoins_wallets 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.parent_child_links
    WHERE parent_id = auth.uid() AND child_id = playcoins_wallets.user_id AND is_verified = true
  )
);

-- Parents can view their children's transactions
CREATE POLICY "Parents can view children transactions" 
ON public.playcoins_transactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.parent_child_links
    WHERE parent_id = auth.uid() AND child_id = playcoins_transactions.user_id AND is_verified = true
  )
);

-- Teachers can manage class enrollments (update and delete)
CREATE POLICY "Teachers can update enrollments" 
ON public.class_enrollments 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_enrollments.class_id AND c.teacher_id = auth.uid()
  )
);

CREATE POLICY "Teachers can delete enrollments" 
ON public.class_enrollments 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.classes c
    WHERE c.id = class_enrollments.class_id AND c.teacher_id = auth.uid()
  )
);

-- Teachers can soft-delete (deactivate) their classes
CREATE POLICY "Teachers can delete their own classes" 
ON public.classes 
FOR DELETE 
USING (auth.uid() = teacher_id);