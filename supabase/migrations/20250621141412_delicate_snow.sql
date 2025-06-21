/*
  # Game System Database Schema

  1. New Tables
    - `games`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `symbol` (text, crypto symbol like BTC, ETH, etc.)
      - `prediction` (text, 'up' or 'down')
      - `start_price` (decimal, price when game started)
      - `end_price` (decimal, price when game ended)
      - `start_time` (timestamp, when prediction was made)
      - `end_time` (timestamp, when game ended)
      - `duration` (integer, game duration in seconds)
      - `result` (text, 'win', 'loss', or 'pending')
      - `xp_earned` (integer, XP earned from this game)
      - `usdt_earned` (decimal, USDT earned from this game)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `game_rounds`
      - `id` (uuid, primary key)
      - `round_number` (integer, incremental round number)
      - `symbol` (text, crypto symbol)
      - `start_time` (timestamp, when round started)
      - `end_time` (timestamp, when round ended)
      - `start_price` (decimal, price at round start)
      - `end_price` (decimal, price at round end)
      - `price_change` (decimal, percentage change)
      - `total_predictions` (integer, total predictions made)
      - `up_predictions` (integer, number of UP predictions)
      - `down_predictions` (integer, number of DOWN predictions)
      - `winners_count` (integer, number of winners)
      - `status` (text, 'active', 'completed', 'cancelled')
      - `created_at` (timestamp)

    - `price_history`
      - `id` (uuid, primary key)
      - `symbol` (text, crypto symbol)
      - `price` (decimal, price value)
      - `timestamp` (timestamp, when price was recorded)
      - `source` (text, price source like 'pyth', 'binance')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own games
    - Add policies for reading game rounds and price history

  3. Indexes
    - Add indexes for performance on frequently queried columns
    - Add composite indexes for game queries

  4. Functions
    - Add function to update profile stats when game completes
    - Add function to calculate XP and rewards
*/

-- Create games table
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
  symbol text NOT NULL,
  prediction text NOT NULL CHECK (prediction IN ('up', 'down')),
  start_price decimal(20, 8),
  end_price decimal(20, 8),
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  duration integer DEFAULT 300, -- 5 minutes in seconds
  result text CHECK (result IN ('win', 'loss', 'pending')) DEFAULT 'pending',
  xp_earned integer DEFAULT 0,
  usdt_earned decimal(10, 2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create game_rounds table for tracking global rounds
CREATE TABLE IF NOT EXISTS game_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number serial,
  symbol text NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz,
  start_price decimal(20, 8),
  end_price decimal(20, 8),
  price_change decimal(10, 4), -- percentage change
  total_predictions integer DEFAULT 0,
  up_predictions integer DEFAULT 0,
  down_predictions integer DEFAULT 0,
  winners_count integer DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create price_history table for storing real-time prices
CREATE TABLE IF NOT EXISTS price_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  symbol text NOT NULL,
  price decimal(20, 8) NOT NULL,
  timestamp timestamptz NOT NULL,
  source text DEFAULT 'pyth',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;

-- Games policies
CREATE POLICY "Users can create own games"
  ON games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own games"
  ON games
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own games"
  ON games
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Game rounds policies (public read access for leaderboards)
CREATE POLICY "Anyone can view game rounds"
  ON game_rounds
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage game rounds"
  ON game_rounds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Price history policies (public read access)
CREATE POLICY "Anyone can view price history"
  ON price_history
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Service role can manage price history"
  ON price_history
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_games_user_id ON games(user_id);
CREATE INDEX IF NOT EXISTS idx_games_symbol ON games(symbol);
CREATE INDEX IF NOT EXISTS idx_games_start_time ON games(start_time);
CREATE INDEX IF NOT EXISTS idx_games_result ON games(result);
CREATE INDEX IF NOT EXISTS idx_games_user_symbol ON games(user_id, symbol);

CREATE INDEX IF NOT EXISTS idx_game_rounds_symbol ON game_rounds(symbol);
CREATE INDEX IF NOT EXISTS idx_game_rounds_start_time ON game_rounds(start_time);
CREATE INDEX IF NOT EXISTS idx_game_rounds_status ON game_rounds(status);

CREATE INDEX IF NOT EXISTS idx_price_history_symbol ON price_history(symbol);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol_timestamp ON price_history(symbol, timestamp);

-- Function to update profile stats when game completes
CREATE OR REPLACE FUNCTION update_profile_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if game result changed to win or loss
  IF NEW.result != OLD.result AND NEW.result IN ('win', 'loss') THEN
    UPDATE profiles 
    SET 
      games_played = games_played + 1,
      wins = CASE WHEN NEW.result = 'win' THEN wins + 1 ELSE wins END,
      xp = xp + NEW.xp_earned,
      streak = CASE 
        WHEN NEW.result = 'win' THEN streak + 1 
        ELSE 0 
      END,
      updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating profile stats
DROP TRIGGER IF EXISTS update_profile_stats_trigger ON games;
CREATE TRIGGER update_profile_stats_trigger
  AFTER UPDATE ON games
  FOR EACH ROW
  EXECUTE FUNCTION update_profile_stats();

-- Function to calculate XP and rewards based on game result
CREATE OR REPLACE FUNCTION calculate_game_rewards(
  game_id uuid,
  is_winner boolean,
  current_streak integer DEFAULT 0
)
RETURNS TABLE(xp_reward integer, usdt_reward decimal) AS $$
DECLARE
  base_xp integer := 50;
  base_usdt decimal := 10.0;
  streak_multiplier decimal := 1.0;
  final_xp integer;
  final_usdt decimal;
BEGIN
  IF is_winner THEN
    -- Calculate streak multiplier (max 3x)
    streak_multiplier := LEAST(1.0 + (current_streak * 0.1), 3.0);
    
    -- Calculate rewards
    final_xp := ROUND(base_xp * streak_multiplier);
    final_usdt := ROUND(base_usdt * streak_multiplier, 2);
  ELSE
    -- Small consolation XP for participation
    final_xp := 10;
    final_usdt := 0;
  END IF;
  
  RETURN QUERY SELECT final_xp, final_usdt;
END;
$$ LANGUAGE plpgsql;

-- Function to get current active round for a symbol
CREATE OR REPLACE FUNCTION get_current_round(symbol_param text)
RETURNS TABLE(
  round_id uuid,
  round_number integer,
  start_time timestamptz,
  end_time timestamptz,
  start_price decimal,
  time_remaining integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    gr.id,
    gr.round_number,
    gr.start_time,
    gr.end_time,
    gr.start_price,
    GREATEST(0, EXTRACT(EPOCH FROM (gr.end_time - now()))::integer) as time_remaining
  FROM game_rounds gr
  WHERE gr.symbol = symbol_param 
    AND gr.status = 'active'
    AND gr.end_time > now()
  ORDER BY gr.start_time DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest price for a symbol
CREATE OR REPLACE FUNCTION get_latest_price(symbol_param text)
RETURNS TABLE(price decimal, timestamp timestamptz) AS $$
BEGIN
  RETURN QUERY
  SELECT ph.price, ph.timestamp
  FROM price_history ph
  WHERE ph.symbol = symbol_param
  ORDER BY ph.timestamp DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;