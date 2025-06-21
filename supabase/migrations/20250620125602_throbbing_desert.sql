/*
  # Update Authentication Policies for Wallet Users

  1. Changes
    - Update RLS policies to work with wallet-authenticated users
    - Ensure proper access control for wallet-based authentication
    - Add support for users created via Edge Function

  2. Security
    - Maintain RLS protection
    - Allow wallet users to access their own data
    - Prevent unauthorized access
*/

-- Drop existing policies that might conflict
DROP POLICY IF EXISTS "Anonymous users can create profiles" ON profiles;
DROP POLICY IF EXISTS "Anonymous users can update own profiles" ON profiles;
DROP POLICY IF EXISTS "Anonymous users can view own profiles" ON profiles;

-- Update existing policies to be more permissive for authenticated users
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create new policies that work with wallet authentication
CREATE POLICY "Authenticated users can create own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow public read access to profiles for leaderboards, etc.
CREATE POLICY "Public can view profiles"
  ON profiles
  FOR SELECT
  TO public
  USING (true);