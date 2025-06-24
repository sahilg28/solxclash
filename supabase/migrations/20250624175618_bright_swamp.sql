/*
  # Fix Duplicate Profiles Issue

  1. Database Changes
    - Add unique constraint to profiles.user_id to prevent duplicate profiles
    - This ensures each authenticated user has only one profile

  2. Data Integrity
    - Prevents future duplicate profile creation
    - Enforces one-to-one relationship between auth.users and profiles

  Note: After applying this migration, you'll need to manually clean up existing duplicate profiles
  by keeping the oldest/most complete profile for each user_id and deleting the others.
*/

-- First, let's see if there are any duplicate user_ids (for information purposes)
-- This will help identify which profiles need cleanup
DO $$
DECLARE
    duplicate_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id, COUNT(*) as profile_count
        FROM profiles
        GROUP BY user_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    IF duplicate_count > 0 THEN
        RAISE NOTICE 'Found % user_ids with duplicate profiles. Manual cleanup required after migration.', duplicate_count;
    ELSE
        RAISE NOTICE 'No duplicate profiles found. Safe to add unique constraint.';
    END IF;
END $$;

-- Add unique constraint to user_id column to prevent future duplicates
-- This will fail if there are existing duplicates, which is intentional
-- You'll need to clean up duplicates first before this constraint can be added
DO $$
BEGIN
    -- Check if the unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_unique' 
        AND table_name = 'profiles'
    ) THEN
        -- Add the unique constraint
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint to profiles.user_id';
    ELSE
        RAISE NOTICE 'Unique constraint on profiles.user_id already exists';
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Cannot add unique constraint: duplicate user_ids exist in profiles table. Please clean up duplicates first by running: 
        
        -- Find duplicates:
        SELECT user_id, COUNT(*) as count, array_agg(id) as profile_ids 
        FROM profiles 
        GROUP BY user_id 
        HAVING COUNT(*) > 1;
        
        -- For each duplicate user_id, keep the oldest profile and delete others:
        -- DELETE FROM profiles WHERE id IN (''profile_id_2'', ''profile_id_3'', ...);';
END $$;

-- Add index on user_id for better performance (if not already exists)
CREATE INDEX IF NOT EXISTS idx_profiles_user_id_unique ON profiles(user_id);

-- Update the comment on user_id column to document the unique constraint
COMMENT ON COLUMN profiles.user_id IS 'Foreign key to auth.users.id. Each user can have only one profile (enforced by unique constraint).';