/*
  # Fix Empty Round Creation and Add Cancelled Status

  1. Database Schema Updates
    - Add 'cancelled' status to game_rounds check constraint
    - This allows marking rounds without predictions as cancelled

  2. Security
    - No changes to existing RLS policies
    - Maintains existing access controls
*/

-- Add 'cancelled' status to the game_rounds status check constraint
DO $$
BEGIN
  -- Drop the existing check constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'game_rounds_status_check' 
    AND table_name = 'game_rounds'
  ) THEN
    ALTER TABLE game_rounds DROP CONSTRAINT game_rounds_status_check;
  END IF;
  
  -- Add the updated check constraint with 'cancelled' status
  ALTER TABLE game_rounds ADD CONSTRAINT game_rounds_status_check 
    CHECK (status = ANY (ARRAY['waiting'::text, 'predicting'::text, 'resolving'::text, 'completed'::text, 'cancelled'::text]));
END $$;

-- Add comment to document the status values
COMMENT ON COLUMN game_rounds.status IS 'Game round status: waiting (lobby phase), predicting (active prediction window), resolving (calculating results), completed (round finished), cancelled (round had no participants)';