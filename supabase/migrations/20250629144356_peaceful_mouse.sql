/*
  # Create chess game tables

  1. New Tables
    - `chess_games`
      - `id` (uuid, primary key)
      - `player_id` (uuid, references auth.users)
      - `difficulty` (text) - 'easy', 'medium', 'hard'
      - `player_color` (text) - 'white', 'black'
      - `status` (text) - 'active', 'completed', 'resigned'
      - `result` (text) - 'win', 'lose', 'draw', null
      - `xp_cost` (integer)
      - `xp_earned` (integer)
      - `current_fen` (text) - current board position
      - `move_count` (integer)
      - `time_remaining` (integer) - seconds
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `completed_at` (timestamptz)

    - `chess_moves`
      - `id` (uuid, primary key)
      - `game_id` (uuid, references chess_games)
      - `move_number` (integer)
      - `player` (text) - 'white', 'black'
      - `move_notation` (text) - algebraic notation
      - `from_square` (text)
      - `to_square` (text)
      - `piece` (text)
      - `captured_piece` (text)
      - `is_check` (boolean)
      - `is_checkmate` (boolean)
      - `fen_after_move` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users and service role
    - Add indexes for performance

  3. Functions
    - Add trigger to update updated_at timestamp
*/

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

-- Create chess_moves table
CREATE TABLE IF NOT EXISTS chess_moves (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid REFERENCES chess_games(id) ON DELETE CASCADE NOT NULL,
  move_number integer NOT NULL,
  player text NOT NULL CHECK (player IN ('white', 'black')),
  move_notation text NOT NULL,
  from_square text NOT NULL,
  to_square text NOT NULL,
  piece text NOT NULL,
  captured_piece text,
  is_check boolean DEFAULT false,
  is_checkmate boolean DEFAULT false,
  fen_after_move text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chess_games ENABLE ROW LEVEL SECURITY;
ALTER TABLE chess_moves ENABLE ROW LEVEL SECURITY;

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

-- Create policies for chess_moves
CREATE POLICY "Players can view moves from own games"
  ON chess_moves
  FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT id FROM chess_games WHERE player_id = auth.uid()
    )
  );

CREATE POLICY "Players can create moves in own games"
  ON chess_moves
  FOR INSERT
  TO authenticated
  WITH CHECK (
    game_id IN (
      SELECT id FROM chess_games WHERE player_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage chess moves"
  ON chess_moves
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chess_games_player_id ON chess_games(player_id);
CREATE INDEX IF NOT EXISTS idx_chess_games_status ON chess_games(status);
CREATE INDEX IF NOT EXISTS idx_chess_games_created_at ON chess_games(created_at);
CREATE INDEX IF NOT EXISTS idx_chess_moves_game_id ON chess_moves(game_id);
CREATE INDEX IF NOT EXISTS idx_chess_moves_move_number ON chess_moves(move_number);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_chess_games_updated_at
  BEFORE UPDATE ON chess_games
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE chess_games IS 'Chess games played against AI bot';
COMMENT ON TABLE chess_moves IS 'Individual moves in chess games';
COMMENT ON COLUMN chess_games.current_fen IS 'Current board position in FEN notation';
COMMENT ON COLUMN chess_games.time_remaining IS 'Time remaining in seconds for the entire game';
COMMENT ON COLUMN chess_moves.move_notation IS 'Move in standard algebraic notation (e.g., Nf3, Qxd5)';
COMMENT ON COLUMN chess_moves.fen_after_move IS 'Board position after this move in FEN notation';