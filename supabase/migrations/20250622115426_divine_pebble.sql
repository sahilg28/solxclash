/*
  # Fix Game Rounds RLS Policies

  1. Security Updates
    - Add INSERT policy for service role to create game rounds
    - Ensure proper permissions for game round management

  This migration fixes the RLS policy violation when creating game rounds.
*/

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