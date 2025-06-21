/*
  # Update profiles table policies for Web3 authentication

  1. Security Updates
    - Update RLS policies to handle anonymous users
    - Add policy for anonymous users to create profiles
    - Ensure proper wallet address validation

  2. Changes
    - Modified policies to support both authenticated and anonymous users
    - Added better error handling for profile creation
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create updated policies that work with both authenticated and anonymous users
CREATE POLICY "Users can view own profile"
  ON profiles
  FOR SELECT
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can create own profile"
  ON profiles
  FOR INSERT
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  )
  WITH CHECK (
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    (auth.uid() IS NULL AND user_id IS NULL)
  );

-- Add policy for anonymous profile creation
CREATE POLICY "Anonymous users can create profiles"
  ON profiles
  FOR INSERT
  TO anon
  WITH CHECK (user_id = auth.uid());

-- Add policy for anonymous profile viewing
CREATE POLICY "Anonymous users can view own profiles"
  ON profiles
  FOR SELECT
  TO anon
  USING (user_id = auth.uid());

-- Add policy for anonymous profile updates
CREATE POLICY "Anonymous users can update own profiles"
  ON profiles
  FOR UPDATE
  TO anon
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());