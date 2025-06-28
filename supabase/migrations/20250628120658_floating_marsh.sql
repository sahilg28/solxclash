/*
  # Replace XRP with POL in game system

  1. Database Schema Updates
    - Update check constraint on game_rounds.selected_coin to replace 'XRP' with 'POL'
    - This allows POL as a valid cryptocurrency option in the game

  2. Security
    - Maintains existing RLS policies
    - Preserves data integrity with updated constraints
*/

-- Drop the existing check constraint for selected_coin
ALTER TABLE game_rounds DROP CONSTRAINT IF EXISTS game_rounds_selected_coin_check;

-- Add updated check constraint that includes POL instead of XRP
ALTER TABLE game_rounds ADD CONSTRAINT game_rounds_selected_coin_check 
  CHECK (selected_coin IS NULL OR selected_coin = ANY (ARRAY['BTC'::text, 'ETH'::text, 'SOL'::text, 'BNB'::text, 'POL'::text]));

-- Update column comment to reflect the new cryptocurrency options
COMMENT ON COLUMN game_rounds.selected_coin IS 'Selected cryptocurrency for this round. NULL until first prediction is made, then locked to the chosen coin. Options: BTC, ETH, SOL, BNB, POL';