/*
  # Drop chess_moves table

  1. Changes
    - Drop the chess_moves table completely
    - Remove any foreign key constraints and indexes
    - Clean up any related policies

  2. Security
    - No RLS changes needed as table is being removed
*/

-- Drop the chess_moves table if it exists
DROP TABLE IF EXISTS chess_moves CASCADE;

-- Note: CASCADE will automatically drop any dependent objects like:
-- - Foreign key constraints
-- - Indexes
-- - Policies
-- - Triggers
-- - Views that depend on this table