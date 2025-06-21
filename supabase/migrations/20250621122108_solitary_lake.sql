/*
  # Create newsletter and waitlist subscriber tables

  1. New Tables
    - `newsletter_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `created_at` (timestamptz)
    - `waitlist_subscribers`
      - `id` (uuid, primary key)
      - `email` (text, unique, not null)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for public insert access
    - Add indexes for email lookups

  3. Updates to profiles table
    - Remove wallet_address column
    - Add new gaming-related columns
*/

-- Create newsletter_subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create waitlist_subscribers table
CREATE TABLE IF NOT EXISTS waitlist_subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (anyone can subscribe)
CREATE POLICY "Anyone can subscribe to newsletter"
  ON newsletter_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can join waitlist"
  ON waitlist_subscribers
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_subscribers_email ON waitlist_subscribers(email);

-- Update profiles table - remove wallet_address and add gaming columns
DO $$
BEGIN
  -- Remove wallet_address column if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wallet_address'
  ) THEN
    ALTER TABLE profiles DROP COLUMN wallet_address;
  END IF;

  -- Add avatar_url column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE profiles ADD COLUMN avatar_url text;
  END IF;

  -- Add xp column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'xp'
  ) THEN
    ALTER TABLE profiles ADD COLUMN xp integer DEFAULT 0;
  END IF;

  -- Add games_played column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'games_played'
  ) THEN
    ALTER TABLE profiles ADD COLUMN games_played integer DEFAULT 0;
  END IF;

  -- Add wins column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'wins'
  ) THEN
    ALTER TABLE profiles ADD COLUMN wins integer DEFAULT 0;
  END IF;

  -- Add streak column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'streak'
  ) THEN
    ALTER TABLE profiles ADD COLUMN streak integer DEFAULT 0;
  END IF;
END $$;