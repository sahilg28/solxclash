/*
  # Create game tables for CryptoClash

  1. New Tables
    - `game_rounds`
      - `id` (uuid, primary key)
      - `round_number` (integer, unique)
      - `status` (text) - 'waiting', 'predicting', 'resolving', 'completed'
      - `selected_coin` (text) - BTC, ETH, SOL, BNB, XRP
      - `start_time` (timestamptz)
      - `prediction_end_time` (timestamptz)
      - `end_time` (timestamptz)
      - `start_price` (decimal)
      - `end_price` (decimal)
      - `price_direction` (text) - 'up', 'down', 'unchanged'
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `predictions`
      - `id` (uuid, primary key)
      - `round_id` (uuid, references game_rounds)
      - `user_id` (uuid, references auth.users)
      - `prediction` (text) - 'up', 'down'
      - `predicted_at` (timestamptz)
      - `is_correct` (boolean)
      - `xp_earned` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
    - Add indexes for performance

  3. Functions
    - Add trigger to update updated_at timestamp
*/

-- Create game_rounds table
CREATE TABLE IF NOT EXISTS game_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_number integer UNIQUE NOT NULL,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'predicting', 'resolving', 'completed')),
  selected_coin text NOT NULL CHECK (selected_coin IN ('BTC', 'ETH', 'SOL', 'BNB', 'XRP')),
  start_time timestamptz,
  prediction_end_time timestamptz,
  end_time timestamptz,
  start_price decimal(20, 8),
  end_price decimal(20, 8),
  price_direction text CHECK (price_direction IN ('up', 'down', 'unchanged')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid REFERENCES game_rounds(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  prediction text NOT NULL CHECK (prediction IN ('up', 'down')),
  predicted_at timestamptz DEFAULT now(),
  is_correct boolean,
  xp_earned integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(round_id, user_id)
);

-- Enable RLS
ALTER TABLE game_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for game_rounds
CREATE POLICY "Anyone can view game rounds"
  ON game_rounds
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Service role can manage game rounds"
  ON game_rounds
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create policies for predictions
CREATE POLICY "Users can view all predictions"
  ON predictions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own predictions"
  ON predictions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions"
  ON predictions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Service role can manage predictions"
  ON predictions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_game_rounds_status ON game_rounds(status);
CREATE INDEX IF NOT EXISTS idx_game_rounds_round_number ON game_rounds(round_number);
CREATE INDEX IF NOT EXISTS idx_predictions_round_id ON predictions(round_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_round_user ON predictions(round_id, user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_game_rounds_updated_at
  BEFORE UPDATE ON game_rounds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();