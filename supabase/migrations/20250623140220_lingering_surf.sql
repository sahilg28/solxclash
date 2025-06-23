/*
  # Allow null selected_coin in game_rounds

  1. Changes
    - Remove NOT NULL constraint from selected_coin column
    - Remove default value from selected_coin column  
    - Update existing waiting rounds with BTC and no predictions to NULL
    - Update check constraint to allow NULL values
    - Update column comment to reflect new behavior

  2. Security
    - Maintains existing RLS policies
    - Preserves data integrity with updated constraints
*/

-- Step 1: Remove the NOT NULL constraint from selected_coin column
ALTER TABLE game_rounds ALTER COLUMN selected_coin DROP NOT NULL;

-- Step 2: Remove the default value from selected_coin column
ALTER TABLE game_rounds ALTER COLUMN selected_coin DROP DEFAULT;

-- Step 3: Update existing waiting rounds that have BTC as selected_coin and no predictions to NULL
UPDATE game_rounds 
SET selected_coin = NULL 
WHERE status = 'waiting' 
  AND selected_coin = 'BTC' 
  AND id NOT IN (
    SELECT DISTINCT round_id 
    FROM predictions 
    WHERE round_id = game_rounds.id
  );

-- Step 4: Drop the existing check constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'game_rounds_selected_coin_check' 
    AND table_name = 'game_rounds'
  ) THEN
    ALTER TABLE game_rounds DROP CONSTRAINT game_rounds_selected_coin_check;
  END IF;
END $$;

-- Step 5: Add updated check constraint that allows NULL values
ALTER TABLE game_rounds ADD CONSTRAINT game_rounds_selected_coin_check 
  CHECK (selected_coin IS NULL OR selected_coin = ANY (ARRAY['BTC'::text, 'ETH'::text, 'SOL'::text, 'BNB'::text, 'XRP'::text]));

-- Step 6: Update column comment to reflect the new behavior
COMMENT ON COLUMN game_rounds.selected_coin IS 'Selected cryptocurrency for this round. NULL until first prediction is made, then locked to the chosen coin.';