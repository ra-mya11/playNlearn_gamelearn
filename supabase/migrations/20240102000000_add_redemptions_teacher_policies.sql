-- =====================================================
-- TEACHER / ADMIN RLS POLICIES FOR REDEMPTIONS
-- =====================================================

-- Teachers and Admins can view all redemptions
CREATE POLICY "Teachers/Admin can view redemptions"
ON redemptions
FOR SELECT
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin')
);

-- Teachers and Admins can update (verify/reject)
CREATE POLICY "Teachers/Admin can update redemptions"
ON redemptions
FOR UPDATE
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('teacher', 'admin')
);
