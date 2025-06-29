/*
  # Create chess_games table for ChessClash

  1. New Tables
    - `chess_games`
      - `id` (uuid, primary key)
      - `player_id` (uuid, references auth.users)
      - `difficulty` (text) - easy, medium, hard
      - `player_color` (text) - white, black
      - `status` (text) - active, completed, resigned
      - `result` (text) - win, lose, draw
      - `xp_cost` (integer) - XP cost to play
      - `xp_earned` (integer) - XP earned from game
      - `current_fen` (text) - current board position
      - `move_count` (integer) - number of moves made
      - `time_remaining` (integer) - time left in seconds
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `completed_at` (timestamptz)

  2. Security
    - Enable RLS on chess_games table
    - Add policies for players to manage their own games
    - Add service role policies for game management

  3. Performance
    - Add indexes for common queries
    - Add trigger for updated_at timestamp
*/

-- Create chess_games table if it doesn't exist
CREATE TABLE IF NOT EXISTS chess_games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  player_color text NOT NULL CHECK (player_color IN ('white', 'black')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'resigned')),
  result text CHECK (result IN ('win', 'lose', 'draw')),
  xp_cost integer NOT NULL DEFAULT 30,
  xp_earned integer DEFAULT 0,
  current_fen text NOT NULL DEFAULT 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  move_count integer DEFAULT 0,
  time_remaining integer DEFAULT 600,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS if not already enabled
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'chess_games' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE chess_games ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Players can view own chess games" ON chess_games;
DROP POLICY IF EXISTS "Players can create own chess games" ON chess_games;
DROP POLICY IF EXISTS "Players can update own chess games" ON chess_games;
DROP POLICY IF EXISTS "Service role can manage chess games" ON chess_games;

-- Create policies for chess_games
CREATE POLICY "Players can view own chess games"
  ON chess_games
  FOR SELECT
  TO authenticated
  USING (auth.uid() = player_id);

CREATE POLICY "Players can create own chess games"
  ON chess_games
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Players can update own chess games"
  ON chess_games
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = player_id)
  WITH CHECK (auth.uid() = player_id);

CREATE POLICY "Service role can manage chess games"
  ON chess_games
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS idx_chess_games_player_id ON chess_games(player_id);
CREATE INDEX IF NOT EXISTS idx_chess_games_status ON chess_games(status);
CREATE INDEX IF NOT EXISTS idx_chess_games_created_at ON chess_games(created_at);

-- Create trigger to automatically update updated_at if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_chess_games_updated_at'
  ) THEN
    CREATE TRIGGER update_chess_games_updated_at
      BEFORE UPDATE ON chess_games
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Add comments for documentation
COMMENT ON TABLE chess_games IS 'Chess games played against AI bot';
COMMENT ON COLUMN chess_games.current_fen IS 'Current board position in FEN notation';
COMMENT ON COLUMN chess_games.time_remaining IS 'Time remaining in seconds for the entire game';