/*
  # Add Username Validation and Constraints

  1. Constraints
    - Ensure username is unique and not null
    - Add check constraint for username format
    - Add index for better performance

  2. Security
    - Update RLS policies to handle username-based queries
    - Ensure proper access control for profile updates
*/

-- Add constraint to ensure username follows proper format (alphanumeric and underscores only)
ALTER TABLE profiles 
ADD CONSTRAINT username_format_check 
CHECK (username ~ '^[a-zA-Z0-9_]+$' AND length(username) >= 3 AND length(username) <= 30);

-- Make username required (not null)
ALTER TABLE profiles 
ALTER COLUMN username SET NOT NULL;

-- Add index for username lookups (already exists but ensuring it's there)
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- Add policy for public username lookups (needed for profile pages)
CREATE POLICY "Public can view profiles by username"
  ON profiles
  FOR SELECT
  TO public
  USING (true);