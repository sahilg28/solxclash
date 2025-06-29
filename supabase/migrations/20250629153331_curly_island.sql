-- Create chess_games table
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
  time_remaining integer DEFAULT 600, -- 10 minutes in seconds
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE chess_games ENABLE ROW LEVEL SECURITY;

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chess_games_player_id ON chess_games(player_id);
CREATE INDEX IF NOT EXISTS idx_chess_games_status ON chess_games(status);
CREATE INDEX IF NOT EXISTS idx_chess_games_created_at ON chess_games(created_at);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_chess_games_updated_at
  BEFORE UPDATE ON chess_games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE chess_games IS 'Chess games played against AI bot';
COMMENT ON COLUMN chess_games.current_fen IS 'Current board position in FEN notation';
COMMENT ON COLUMN chess_games.time_remaining IS 'Time remaining in seconds for the entire game';