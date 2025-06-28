/*
  # Fix Empty Round Creation and Add Cancelled Status

  1. Database Schema Updates
    - Add 'cancelled' status to game_rounds enum
    - This allows marking rounds without predictions as cancelled

  2. Security
    - No changes to existing RLS policies
    - Maintains existing access controls
*/

-- Add 'cancelled' status to the game_rounds status enum
DO $$
BEGIN
  -- Check if 'cancelled' status already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum 
    WHERE enumlabel = 'cancelled' 
    AND enumtypid = (
      SELECT oid FROM pg_type WHERE typname = 'game_rounds_status'
    )
  ) THEN
    -- Add 'cancelled' to the existing enum
    ALTER TYPE game_rounds_status ADD VALUE 'cancelled';
  END IF;
END $$;

-- Add comment to document the new status
COMMENT ON TYPE game_rounds_status IS 'Game round status: waiting, predicting, resolving, completed, cancelled';