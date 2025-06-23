/*
  # Fix predictions table RLS policies

  1. Security Changes
    - Drop overly permissive SELECT policy that allows users to view all predictions
    - Create secure policy that only allows users to view their own predictions
    - Ensure service role can still manage all predictions for game logic

  2. Policies
    - `Users can view own predictions` - authenticated users can only see their own predictions
    - `Service role can view all predictions` - service role can view all predictions for game management
*/

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Users can view all predictions" ON predictions;

-- Create a more secure policy that only allows users to view their own predictions
CREATE POLICY "Users can view own predictions"
  ON predictions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure the service role can still manage all predictions for game logic
CREATE POLICY "Service role can view all predictions"
  ON predictions
  FOR SELECT
  TO service_role
  USING (true);