/*
  # Add Twitter profile field to profiles table

  1. Changes
    - Add `twitter_username` column to profiles table
    - Allow users to add their Twitter/X profile ID
    - Make it optional (nullable)

  2. Security
    - No changes to RLS policies needed
    - Existing policies cover the new column
*/

-- Add twitter_username column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'twitter_username'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN twitter_username text;
  END IF;
END $$;

-- Add comment to document the column
COMMENT ON COLUMN profiles.twitter_username IS 'User Twitter/X username (without @ symbol)';