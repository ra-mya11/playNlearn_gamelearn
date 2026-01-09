-- =====================================================
-- FUNCTION: Auto-update updated_at column
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- REDEMPTIONS TABLE MIGRATION
-- Stores offline QR-based reward redemptions
-- =====================================================
CREATE TABLE IF NOT EXISTS redemptions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,

  redemption_code TEXT NOT NULL UNIQUE,
  one_time_token TEXT NOT NULL UNIQUE,
  coins_redeemed INTEGER NOT NULL,

  qr_data JSONB NOT NULL,

  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'verified', 'collected', 'expired', 'rejected')),

  verified_by TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  rejected_reason TEXT,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_redemptions_student_id ON redemptions(student_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_redemption_code ON redemptions(redemption_code);
CREATE INDEX IF NOT EXISTS idx_redemptions_status ON redemptions(status);
CREATE INDEX IF NOT EXISTS idx_redemptions_expires_at ON redemptions(expires_at);
CREATE INDEX IF NOT EXISTS idx_redemptions_created_at ON redemptions(created_at);

-- =====================================================
-- TRIGGER: Auto-update updated_at on UPDATE
-- =====================================================
CREATE TRIGGER update_redemptions_updated_at
BEFORE UPDATE ON redemptions
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STUDENT RLS POLICIES
-- =====================================================
-- Students can view their own redemptions
CREATE POLICY "Students can view their own redemptions"
ON redemptions
FOR SELECT
USING (auth.uid()::text = student_id);

-- Students can insert their own redemptions
CREATE POLICY "Students can insert their own redemptions"
ON redemptions
FOR INSERT
WITH CHECK (auth.uid()::text = student_id);

-- =====================================================
-- GRANTS
-- =====================================================
GRANT SELECT, INSERT, UPDATE ON redemptions TO authenticated;
