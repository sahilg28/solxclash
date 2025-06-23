/*
  # Fix Game Rounds Status Enum

  1. Changes
    - Add 'cancelled' status to game_rounds status check constraint
    - Update the constraint to allow the new status value
    - Add documentation for the new status

  2. Security
    - No RLS changes needed
*/

-- First, check if the constraint exists and what values it currently allows
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