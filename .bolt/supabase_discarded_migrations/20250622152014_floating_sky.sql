/*
  # Fix Predictions RLS Policy

  1. Security Changes
    - Update the SELECT policy on predictions table to only allow users to view their own predictions
    - This fixes the 406 Not Acceptable error by ensuring RLS policy matches the client query pattern

  2. Changes Made
    - Modify existing SELECT policy to use `(uid() = user_id)` instead of `true`
    - This ensures authenticated users can only access their own prediction records
*/

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all predictions" ON predictions;

-- Create a more secure policy that only allows users to view their own predictions
CREATE POLICY "Users can view own predictions"
  ON predictions
  FOR SELECT
  TO authenticated
  USING (uid() = user_id);

-- Ensure the service role can still manage all predictions for game logic
CREATE POLICY "Service role can view all predictions"
  ON predictions
  FOR SELECT
  TO service_role
  USING (true);