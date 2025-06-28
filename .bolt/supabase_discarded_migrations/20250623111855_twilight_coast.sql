/*
  # Add XP Bet Column to Predictions Table

  1. Changes
    - Add `xp_bet` column to `predictions` table
    - Set default value to 10
    - Make it NOT NULL
    - Add check constraint to ensure valid bet amounts (10-100 in increments of 10)

  2. Security
    - No changes to RLS policies needed
*/

-- Add xp_bet column to predictions table
ALTER TABLE predictions 
ADD COLUMN IF NOT EXISTS xp_bet integer NOT NULL DEFAULT 10;

-- Add check constraint to ensure valid bet amounts
ALTER TABLE predictions 
ADD CONSTRAINT IF NOT EXISTS predictions_xp_bet_check 
CHECK (xp_bet >= 10 AND xp_bet <= 100 AND xp_bet % 10 = 0);

-- Add comment to document the column
COMMENT ON COLUMN predictions.xp_bet IS 'Amount of XP bet on this prediction (10-100 in increments of 10)';