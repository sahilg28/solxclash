-- Add country column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'country'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN country text;
  END IF;
END $$;

-- Add last_played_date column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_played_date'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN last_played_date date;
  END IF;
END $$;

-- Add daily_play_streak column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'daily_play_streak'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN daily_play_streak integer NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Add last_seven_day_reward_date column to profiles table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_seven_day_reward_date'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN last_seven_day_reward_date date;
  END IF;
END $$;

-- Add check constraint for daily_play_streak
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_daily_play_streak_check' 
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_daily_play_streak_check 
    CHECK (daily_play_streak >= 0);
  END IF;
END $$;

-- Add comments to document the new columns
COMMENT ON COLUMN profiles.country IS 'User country (optional)';
COMMENT ON COLUMN profiles.last_played_date IS 'Last date user made a prediction';
COMMENT ON COLUMN profiles.daily_play_streak IS 'Current consecutive days played (resets if user misses a day)';
COMMENT ON COLUMN profiles.last_seven_day_reward_date IS 'Last date user received 7-day streak reward (300 XP)';

-- Create index on last_played_date for efficient streak calculations
CREATE INDEX IF NOT EXISTS idx_profiles_last_played_date ON profiles(last_played_date);