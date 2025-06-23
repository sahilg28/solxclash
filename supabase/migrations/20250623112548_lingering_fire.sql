/*
  # Add XP betting to predictions table

  1. Changes
    - Add `xp_bet` column to predictions table
    - Set default value to 10 XP
    - Add check constraint for valid bet amounts (10-100 in increments of 10)
    - Add column comment for documentation

  2. Security
    - Maintains existing RLS policies
    - No changes to authentication or permissions
*/

-- Add xp_bet column to predictions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'predictions' AND column_name = 'xp_bet'
  ) THEN
    ALTER TABLE predictions 
    ADD COLUMN xp_bet integer NOT NULL DEFAULT 10;
  END IF;
END $$;

-- Add check constraint to ensure valid bet amounts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'predictions_xp_bet_check' 
    AND table_name = 'predictions'
  ) THEN
    ALTER TABLE predictions 
    ADD CONSTRAINT predictions_xp_bet_check 
    CHECK (xp_bet >= 10 AND xp_bet <= 100 AND xp_bet % 10 = 0);
  END IF;
END $$;

-- Add comment to document the column
COMMENT ON COLUMN predictions.xp_bet IS 'Amount of XP bet on this prediction (10-100 in increments of 10)';