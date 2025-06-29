import { Chess } from 'chess.js';

// Piece values for evaluation
const PIECE_VALUES = {
  p: 100,   // pawn
  n: 320,   // knight
  b: 330,   // bishop
  r: 500,   // rook
  q: 900,   // queen
  k: 20000  // king
};

// Piece-Square Tables (PSTs) for positional evaluation
// Values are from white's perspective, will be flipped for black
const PIECE_SQUARE_TABLES = {
  p: [ // Pawns
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [5,  5, 10, 25, 25, 10,  5,  5],
    [0,  0,  0, 20, 20,  0,  0,  0],
    [5, -5,-10,  0,  0,-10, -5,  5],
    [5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
  ],
  n: [ // Knights
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
  ],
  b: [ // Bishops
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
  ],
  r: [ // Rooks
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
  ],
  q: [ // Queen
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [-5,  0,  5,  5,  5,  5,  0, -5],
    [0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
  ],
  k: [ // King (middlegame)
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
  ]
};

// King endgame table (when few pieces remain)
const KING_ENDGAME_TABLE = [
  [-50,-40,-30,-20,-20,-30,-40,-50],
  [-30,-20,-10,  0,  0,-10,-20,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 30, 40, 40, 30,-10,-30],
  [-30,-10, 20, 30, 30, 20,-10,-30],
  [-30,-30,  0,  0,  0,  0,-30,-30],
  [-50,-30,-30,-30,-30,-30,-30,-50]
];

export class ChessAI {
  private transpositionTable: Map<string, { score: number; depth: number; flag: string }> = new Map();
  private maxDepth: number;
  private difficulty: 'easy' | 'medium' | 'hard';

  constructor(difficulty: 'easy' | 'medium' | 'hard') {
    this.difficulty = difficulty;
    this.maxDepth = this.getDepthForDifficulty(difficulty);
  }

  private getDepthForDifficulty(difficulty: 'easy' | 'medium' | 'hard'): number {
    switch (difficulty) {
      case 'easy': return 3;
      case 'medium': return 4;
      case 'hard': return 6;
      default: return 4;
    }
  }

  public getBestMove(game: Chess): string | null {
    const moves = game.moves();
    
    if (moves.length === 0) {
      return null;
    }

    // Add some randomness for easy difficulty
    if (this.difficulty === 'easy' && Math.random() < 0.15) {
      const randomMove = moves[Math.floor(Math.random() * moves.length)];
      return randomMove;
    }

    // Clear transposition table periodically to prevent memory issues
    if (this.transpositionTable.size > 10000) {
      this.transpositionTable.clear();
    }

    const startTime = Date.now();
    
    try {
      const [bestScore, bestMove] = this.minimax(game, this.maxDepth, -Infinity, Infinity, false);
      
      if (!bestMove) {
        return moves[0];
      }
      
      return bestMove;
    } catch (error) {
      return moves[0];
    }
  }

  private minimax(
    game: Chess, 
    depth: number, 
    alpha: number, 
    beta: number, 
    isMaximizing: boolean
  ): [number, string | null] {
    const fen = game.fen();
    const transpositionKey = `${fen}_${depth}_${isMaximizing}`;
    
    // Check transposition table
    const cached = this.transpositionTable.get(transpositionKey);
    if (cached && cached.depth >= depth) {
      return [cached.score, null];
    }

    if (depth === 0 || game.isGameOver()) {
      const score = this.evaluatePosition(game);
      this.transpositionTable.set(transpositionKey, { score, depth, flag: 'exact' });
      return [score, null];
    }

    const moves = game.moves();
    
    if (moves.length === 0) {
      const score = this.evaluatePosition(game);
      return [score, null];
    }
    
    let bestMove: string | null = null;
    let bestScore = isMaximizing ? -Infinity : Infinity;

    // Move ordering: prioritize captures and checks
    const orderedMoves = this.orderMoves(game, moves);

    for (let i = 0; i < orderedMoves.length; i++) {
      const move = orderedMoves[i];
      
      try {
        const newGame = new Chess(game.fen());
        const moveResult = newGame.move(move);
        
        if (!moveResult) {
          continue;
        }
        
        const [score] = this.minimax(newGame, depth - 1, alpha, beta, !isMaximizing);
        
        if (isMaximizing) {
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
          alpha = Math.max(alpha, score);
        } else {
          if (score < bestScore) {
            bestScore = score;
            bestMove = move;
          }
          beta = Math.min(beta, score);
        }
        
        // Alpha-beta pruning
        if (beta <= alpha) {
          break;
        }
      } catch (error) {
        continue;
      }
    }

    // Store in transposition table
    this.transpositionTable.set(transpositionKey, { score: bestScore, depth, flag: 'exact' });
    
    return [bestScore, bestMove];
  }

  private orderMoves(game: Chess, moves: string[]): string[] {
    const moveScores: { move: string; score: number }[] = [];
    
    for (const move of moves) {
      let score = 0;
      
      try {
        const newGame = new Chess(game.fen());
        const moveObj = newGame.move(move);
        
        if (!moveObj) {
          continue;
        }
        
        // Prioritize captures
        if (moveObj.captured) {
          const capturedValue = PIECE_VALUES[moveObj.captured as keyof typeof PIECE_VALUES] || 0;
          const attackerValue = PIECE_VALUES[moveObj.piece as keyof typeof PIECE_VALUES] || 0;
          score += capturedValue - attackerValue / 10; // MVV-LVA
        }
        
        // Prioritize checks
        if (newGame.isCheck()) {
          score += 50;
        }
        
        // Prioritize checkmates
        if (newGame.isCheckmate()) {
          score += 10000;
        }
        
        // Prioritize promotions
        if (moveObj.promotion) {
          score += 800;
        }
        
        moveScores.push({ move, score });
      } catch (error) {
        moveScores.push({ move, score: 0 });
      }
    }
    
    // Sort moves by score (highest first)
    moveScores.sort((a, b) => b.score - a.score);
    const orderedMoves = moveScores.map(item => item.move);
    
    return orderedMoves;
  }

  private evaluatePosition(game: Chess): number {
    if (game.isCheckmate()) {
      const score = game.turn() === 'w' ? -9999 : 9999;
      return score;
    }
    
    if (game.isDraw()) {
      return 0;
    }

    let score = 0;
    const board = game.board();
    const isEndgame = this.isEndgame(game);
    
    // Material and positional evaluation
    let materialScore = 0;
    let positionalScore = 0;
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece) {
          const pieceValue = this.evaluatePiece(piece, rank, file, isEndgame);
          const contribution = piece.color === 'w' ? pieceValue : -pieceValue;
          score += contribution;
          
          if (piece.color === 'w') {
            materialScore += PIECE_VALUES[piece.type as keyof typeof PIECE_VALUES] || 0;
          } else {
            materialScore -= PIECE_VALUES[piece.type as keyof typeof PIECE_VALUES] || 0;
          }
        }
      }
    }
    
    // Additional positional factors
    const kingSafetyW = this.evaluateKingSafety(game, 'w');
    const kingSafetyB = this.evaluateKingSafety(game, 'b');
    const pawnStructureW = this.evaluatePawnStructure(game, 'w');
    const pawnStructureB = this.evaluatePawnStructure(game, 'b');
    const mobilityW = this.evaluatePieceMobility(game, 'w');
    const mobilityB = this.evaluatePieceMobility(game, 'b');
    
    score += kingSafetyW - kingSafetyB;
    score += pawnStructureW - pawnStructureB;
    score += mobilityW - mobilityB;
    
    // Small bonus for having the move
    score += game.turn() === 'w' ? 10 : -10;
    
    // Add some evaluation noise for easy difficulty to make it less predictable
    if (this.difficulty === 'easy') {
      score += (Math.random() - 0.5) * 50;
    }
    
    return score;
  }

  private evaluatePiece(piece: any, rank: number, file: number, isEndgame: boolean): number {
    const pieceType = piece.type;
    const isWhite = piece.color === 'w';
    
    // Base piece value
    let value = PIECE_VALUES[pieceType as keyof typeof PIECE_VALUES] || 0;
    
    // Positional value from piece-square tables
    const tableRank = isWhite ? 7 - rank : rank;
    const tableFile = file;
    
    if (pieceType === 'k' && isEndgame) {
      // Use endgame king table
      value += KING_ENDGAME_TABLE[tableRank][tableFile];
    } else if (PIECE_SQUARE_TABLES[pieceType as keyof typeof PIECE_SQUARE_TABLES]) {
      value += PIECE_SQUARE_TABLES[pieceType as keyof typeof PIECE_SQUARE_TABLES][tableRank][tableFile];
    }
    
    return value;
  }

  private isEndgame(game: Chess): boolean {
    const board = game.board();
    let pieceCount = 0;
    let queenCount = 0;
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type !== 'k') {
          pieceCount++;
          if (piece.type === 'q') queenCount++;
        }
      }
    }
    
    // Endgame if few pieces remain or no queens
    return pieceCount <= 12 || queenCount === 0;
  }

  private evaluateKingSafety(game: Chess, color: 'w' | 'b'): number {
    // Find king position
    const board = game.board();
    let kingPos: { rank: number; file: number } | null = null;
    
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === 'k' && piece.color === color) {
          kingPos = { rank, file };
          break;
        }
      }
    }
    
    if (!kingPos) return 0;
    
    let safety = 0;
    
    // Penalty for king in center during middlegame
    if (!this.isEndgame(game)) {
      const centerDistance = Math.abs(kingPos.file - 3.5) + Math.abs(kingPos.rank - 3.5);
      safety -= centerDistance * 10;
    }
    
    // Bonus for pawn shield (only in middlegame)
    if (!this.isEndgame(game)) {
      const pawnShieldRank = color === 'w' ? kingPos.rank - 1 : kingPos.rank + 1;
      if (pawnShieldRank >= 0 && pawnShieldRank < 8) {
        for (let file = Math.max(0, kingPos.file - 1); file <= Math.min(7, kingPos.file + 1); file++) {
          const piece = board[pawnShieldRank][file];
          if (piece && piece.type === 'p' && piece.color === color) {
            safety += 20;
          }
        }
      }
    }
    
    return safety;
  }

  private evaluatePawnStructure(game: Chess, color: 'w' | 'b'): number {
    const board = game.board();
    let score = 0;
    const pawnFiles: number[] = [];
    
    // Find all pawns
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.type === 'p' && piece.color === color) {
          pawnFiles.push(file);
          
          // Bonus for advanced pawns
          const advancement = color === 'w' ? 7 - rank : rank;
          score += advancement * 5;
        }
      }
    }
    
    // Penalty for doubled pawns
    const fileCounts = new Array(8).fill(0);
    pawnFiles.forEach(file => fileCounts[file]++);
    fileCounts.forEach(count => {
      if (count > 1) {
        score -= (count - 1) * 20;
      }
    });
    
    // Penalty for isolated pawns
    for (let file = 0; file < 8; file++) {
      if (fileCounts[file] > 0) {
        const hasNeighbor = (file > 0 && fileCounts[file - 1] > 0) || 
                           (file < 7 && fileCounts[file + 1] > 0);
        if (!hasNeighbor) {
          score -= 15;
        }
      }
    }
    
    return score;
  }

  private evaluatePieceMobility(game: Chess, color: 'w' | 'b'): number {
    const board = game.board();
    let mobility = 0;
    let pieceCount = 0;
    
    // Count legal moves for all pieces of the specified color
    for (let rank = 0; rank < 8; rank++) {
      for (let file = 0; file < 8; file++) {
        const piece = board[rank][file];
        if (piece && piece.color === color) {
          pieceCount++;
          // Convert rank/file to square notation
          const square = String.fromCharCode(97 + file) + (8 - rank).toString();
          
          try {
            // Get moves for this specific piece
            const pieceMoves = game.moves({ square, verbose: false });
            mobility += pieceMoves.length;
          } catch (error) {
            continue;
          }
        }
      }
    }
    
    // Weight mobility appropriately
    return mobility * 2;
  }
}

// Factory function to create AI instance
export function createChessAI(difficulty: 'easy' | 'medium' | 'hard'): ChessAI {
  return new ChessAI(difficulty);
}