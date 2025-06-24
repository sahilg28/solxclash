/*
  # Add 'cancelled' status to game rounds

  1. Updates
    - Add 'cancelled' to the allowed values in the status check constraint
    - Update the constraint to include the new status option

  2. Security
    - Maintains existing RLS policies
    - No changes to existing data or permissions
*/

-- Drop the existing check constraint
ALTER TABLE game_rounds DROP CONSTRAINT IF EXISTS game_rounds_status_check;

-- Add the new check constraint that includes 'cancelled'
ALTER TABLE game_rounds ADD CONSTRAINT game_rounds_status_check 
  CHECK (status = ANY (ARRAY['waiting'::text, 'predicting'::text, 'resolving'::text, 'completed'::text, 'cancelled'::text]));

-- Update the comment on the status column to document all possible values
COMMENT ON COLUMN game_rounds.status IS 'Game round status: waiting (lobby phase), predicting (active prediction window), resolving (calculating results), completed (round finished), cancelled (round had no participants)';