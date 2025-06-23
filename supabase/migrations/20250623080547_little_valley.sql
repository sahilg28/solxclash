/*
  # Service Role Full Access Policy for game_rounds

  1. New Policy
    - `Service Role Full Access` on `game_rounds` table
    - Grants full access (SELECT, INSERT, UPDATE, DELETE) to service_role
    - Uses `FOR ALL` to cover all operations
    - Uses `USING (true)` and `WITH CHECK (true)` for unrestricted access

  2. Security
    - Explicit policy for service_role operations
    - Ensures game management functions have proper access
    - Documents intended access patterns
*/

-- Create comprehensive RLS policy for service_role on game_rounds table
CREATE POLICY "Service Role Full Access"
  ON game_rounds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);