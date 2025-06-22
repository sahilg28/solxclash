/*
  # Fix game rounds RLS policies

  1. Security Updates
    - Drop existing conflicting policies if they exist
    - Create new policies for game round management
    - Ensure proper access control for authenticated users and service role

  2. Changes
    - Allow service role to insert game rounds (for automated game creation)
    - Allow authenticated users to insert game rounds (if needed for admin functions)
    - Use IF NOT EXISTS pattern to avoid conflicts
*/

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Service role can insert game rounds" ON game_rounds;
DROP POLICY IF EXISTS "Authenticated users can insert game rounds" ON game_rounds;

-- Allow service role to insert game rounds (for automated game creation)
CREATE POLICY "Service role can insert game rounds"
  ON game_rounds
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to insert game rounds (if needed for admin functions)
CREATE POLICY "Authenticated users can insert game rounds"
  ON game_rounds
  FOR INSERT
  TO authenticated
  WITH CHECK (true);