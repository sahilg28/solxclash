/*
  # Clean up duplicate profiles and add unique constraint

  1. Identifies and removes duplicate profiles automatically
  2. Keeps the oldest profile for each user_id (based on created_at)
  3. Adds unique constraint to prevent future duplicates
  4. Adds performance index
*/

-- Step 1: Clean up duplicate profiles automatically
-- Keep the oldest profile for each user_id and delete the rest
DO $$
DECLARE
    duplicate_count INTEGER;
    cleanup_count INTEGER;
BEGIN
    -- Count duplicates before cleanup
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id, COUNT(*) as profile_count
        FROM profiles
        GROUP BY user_id
        HAVING COUNT(*) > 1
    ) duplicates;
    
    RAISE NOTICE 'Found % user_ids with duplicate profiles before cleanup', duplicate_count;
    
    -- Delete duplicate profiles, keeping only the oldest one for each user_id
    WITH ranked_profiles AS (
        SELECT id, user_id, created_at,
               ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as rn
        FROM profiles
    ),
    profiles_to_delete AS (
        SELECT id FROM ranked_profiles WHERE rn > 1
    )
    DELETE FROM profiles 
    WHERE id IN (SELECT id FROM profiles_to_delete);
    
    -- Get count of deleted profiles
    GET DIAGNOSTICS cleanup_count = ROW_COUNT;
    
    RAISE NOTICE 'Cleaned up % duplicate profiles', cleanup_count;
    
    -- Verify no duplicates remain
    SELECT COUNT(*) INTO duplicate_count
    FROM (
        SELECT user_id, COUNT(*) as profile_count
        FROM profiles
        GROUP BY user_id
        HAVING COUNT(*) > 1
    ) remaining_duplicates;
    
    IF duplicate_count = 0 THEN
        RAISE NOTICE 'All duplicate profiles successfully cleaned up';
    ELSE
        RAISE NOTICE 'Warning: % duplicate user_ids still remain', duplicate_count;
    END IF;
END $$;

-- Step 2: Add unique constraint to user_id column to prevent future duplicates
DO $$
BEGIN
    -- Check if the unique constraint already exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_user_id_unique' 
        AND table_name = 'profiles'
        AND table_schema = 'public'
    ) THEN
        -- Add the unique constraint
        ALTER TABLE profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);
        RAISE NOTICE 'Added unique constraint to profiles.user_id';
    ELSE
        RAISE NOTICE 'Unique constraint on profiles.user_id already exists';
    END IF;
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Failed to add unique constraint: some duplicate user_ids may still exist. Please check the profiles table manually.';
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Unexpected error adding unique constraint: %', SQLERRM;
END $$;

-- Step 3: Add index on user_id for better performance (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_profiles_user_id_unique' 
        AND tablename = 'profiles'
        AND schemaname = 'public'
    ) THEN
        CREATE INDEX idx_profiles_user_id_unique ON profiles(user_id);
        RAISE NOTICE 'Created index on profiles.user_id';
    ELSE
        RAISE NOTICE 'Index on profiles.user_id already exists';
    END IF;
END $$;

-- Step 4: Update the comment on user_id column to document the unique constraint
COMMENT ON COLUMN profiles.user_id IS 'Foreign key to auth.users.id. Each user can have only one profile (enforced by unique constraint).';

-- Step 5: Verify the final state
DO $$
DECLARE
    total_profiles INTEGER;
    unique_users INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_profiles FROM profiles;
    SELECT COUNT(DISTINCT user_id) INTO unique_users FROM profiles;
    
    RAISE NOTICE 'Migration complete: % total profiles, % unique users', total_profiles, unique_users;
    
    IF total_profiles = unique_users THEN
        RAISE NOTICE 'Success: Each user now has exactly one profile';
    ELSE
        RAISE WARNING 'Warning: Profile count (%) does not match unique user count (%)', total_profiles, unique_users;
    END IF;
END $$;