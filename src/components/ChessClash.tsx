import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Zap, CheckCircle, AlertCircle, RotateCcw, X as CloseIcon, Clock, User as UserIcon, Cpu, Brain, Target, Trophy, ArrowLeft, Home, Flag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './AuthProvider';
import { useNavigate } from 'react-router-dom';

const BOARD_COLORS = {
  light: '#f7fafc', // modern off-white
  dark: '#23272f', // modern dark/blue-gray
};

const getRandomBotMove = (game) => {
  const moves = game.moves();
  return moves[Math.floor(Math.random() * moves.length)];
};

// Minimax with alpha-beta pruning for bot
const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function evaluateBoard(game) {
  if (game.isCheckmate()) {
    if (game.turn() === 'b') return 9999; // player wins
    if (game.turn() === 'w') return -9999; // bot wins
  }
  if (game.isDraw()) return 0;
  let evalScore = 0;
  const board = game.board();
  for (let row of board) {
    for (let piece of row) {
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type] || 0;
      evalScore += piece.color === 'w' ? value : -value;
    }
  }
  return evalScore;
}

function minimax(game, depth, alpha, beta, isMaximizing) {
  if (depth === 0 || game.isGameOver()) {
    return [evaluateBoard(game), null];
  }
  const moves = game.moves();
  let bestMove = null;
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (let move of moves) {
      const newGame = new Chess(game.fen());
      newGame.move(move);
      const [evalScore] = minimax(newGame, depth - 1, alpha, beta, false);
      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestMove = move;
      }
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return [maxEval, bestMove];
  } else {
    let minEval = Infinity;
    for (let move of moves) {
      const newGame = new Chess(game.fen());
      newGame.move(move);
      const [evalScore] = minimax(newGame, depth - 1, alpha, beta, true);
      if (evalScore < minEval) {
        minEval = evalScore;
        bestMove = move;
      }
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return [minEval, bestMove];
  }
}

const getBotMove = (game, difficulty) => {
  if (difficulty === 'easy') {
    // 50% random, 50% best move
    if (Math.random() < 0.5) return getRandomBotMove(game);
    const [, bestMove] = minimax(game, 2, -Infinity, Infinity, false);
    return bestMove;
  }
  const depth = difficulty === 'medium' ? 3 : 5;
  const [, bestMove] = minimax(game, depth, -Infinity, Infinity, false);
  return bestMove;
};

const ChessClash = ({ profile, gameConfig, onBackToSetup }) => {
  const { refreshSessionAndProfile } = useAuthContext();
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [intervalId, setIntervalId] = useState(null);
  const [isGameActive, setIsGameActive] = useState(true);
  const [result, setResult] = useState(null);
  const [xpState, setXpState] = useState(profile.xp);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  
  // Single game timer (10 minutes total)
  const [gameTime, setGameTime] = useState(600); // 10 minutes total
  
  const [lastMove, setLastMove] = useState(null);
  const [gameStats, setGameStats] = useState({ captures: 0, checks: 0 });
  const navigate = useNavigate();
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const pendingTransition = useRef(null);

  // Initialize game based on player color
  useEffect(() => {
    if (gameConfig.playerColor === 'black') {
      // If player is black, bot makes the first move
      setTimeout(() => {
        makeBotMove();
      }, 500);
    }
  }, []);

  // Deduct XP on game start
  useEffect(() => {
    const deductXP = async () => {
      setIsProcessing(true);
      setXpState(prev => prev - gameConfig.xpCost);
      
      const { error } = await supabase
        .from('profiles')
        .update({ xp: profile.xp - gameConfig.xpCost })
        .eq('id', profile.id);
      
      if (error) {
        setError('Failed to deduct XP. Please try again.');
        setXpState(prev => prev + gameConfig.xpCost);
      }
      setIsProcessing(false);
    };
    
    deductXP();
  }, []);

  // Single game timer effect
  useEffect(() => {
    if (!isGameActive || result) return;
    
    const id = setInterval(() => {
      setGameTime((t) => {
        if (t <= 1) {
          setResult({ type: 'timeout', message: 'Time is up! Game ended in timeout.' });
          setIsGameActive(false);
          clearInterval(id);
          handleGameEnd('timeout');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    
    setIntervalId(id);
    return () => clearInterval(id);
  }, [isGameActive, result]);

  // Game end detection
  useEffect(() => {
    if (!isGameActive) return;
    if (game.isGameOver()) {
      let type = 'draw';
      let message = 'Draw! Your XP is refunded.';
      
      if (game.isCheckmate()) {
        const playerColor = gameConfig.playerColor === 'white' ? 'w' : 'b';
        if (game.turn() !== playerColor) {
          type = 'win';
          message = 'Checkmate! You win!';
        } else {
          type = 'lose';
          message = 'Checkmate! You lose.';
        }
      } else if (game.isDraw()) {
        type = 'draw';
        message = 'Draw! Your XP is refunded.';
      }
      
      setResult({ type, message });
      setIsGameActive(false);
      clearInterval(intervalId);
      handleGameEnd(type);
    }
  }, [fen, isGameActive]);

  // Handle game end: update XP, wins, games_played in DB
  const handleGameEnd = async (type) => {
    setIsProcessing(true);
    setError(null);
    
    let xpChange = 0;
    let winInc = 0;
    let gamesPlayedInc = 1;
    
    if (type === 'win') {
      xpChange = gameConfig.difficulty === 'easy' ? 40 : gameConfig.difficulty === 'medium' ? 60 : 100;
      winInc = 1;
    } else if (type === 'draw') {
      xpChange = gameConfig.xpCost; // refund
    } else if (type === 'lose' || type === 'timeout') {
      xpChange = 0;
    }
    
    const newXP = xpState + xpChange;
    
    const { error } = await supabase
      .from('profiles')
      .update({
        xp: newXP,
        wins: profile.wins + winInc,
        games_played: profile.games_played + gamesPlayedInc,
      })
      .eq('id', profile.id);
    
    if (error) {
      setError('Failed to update your profile. Please try again.');
    } else {
      setXpState(newXP);
      await refreshSessionAndProfile();
    }
    setIsProcessing(false);
  };

  // Bot move logic - instant moves, no thinking delay
  const makeBotMove = () => {
    if (game.isGameOver()) return;
    
    // Instant bot move with minimal delay
    setTimeout(() => {
      let move = getBotMove(game, gameConfig.difficulty);
      if (move) {
        const moveObj = game.move(move);
        if (moveObj) {
          setFen(game.fen());
          setMoveHistory((h) => [...h, moveObj.san]);
          setLastMove({ from: moveObj.from, to: moveObj.to });
          
          if (moveObj.captured) {
            setGameStats(prev => ({ ...prev, captures: prev.captures + 1 }));
          }
          if (game.isCheck()) {
            setGameStats(prev => ({ ...prev, checks: prev.checks + 1 }));
          }
        }
      }
    }, 100); // Minimal delay for smooth UX
  };

  // Handle user move - fixed to check correct player turn
  const handleSquareClick = (square) => {
    if (!isGameActive) return;
    
    const playerColor = gameConfig.playerColor === 'white' ? 'w' : 'b';
    if (game.turn() !== playerColor) return; // Only allow moves on player's turn
    
    if (selectedSquare && legalMoves.includes(square)) {
      const moveObj = game.move({ from: selectedSquare, to: square, promotion: 'q' });
      if (moveObj) {
        setFen(game.fen());
        setMoveHistory((h) => [...h, moveObj.san]);
        setLastMove({ from: moveObj.from, to: moveObj.to });
        setSelectedSquare(null);
        setLegalMoves([]);
        
        if (moveObj.captured) {
          setGameStats(prev => ({ ...prev, captures: prev.captures + 1 }));
        }
        if (game.isCheck()) {
          setGameStats(prev => ({ ...prev, checks: prev.checks + 1 }));
        }
        
        // Trigger bot move after player move
        setTimeout(makeBotMove, 100);
      }
      return;
    }
    
    const moves = game.moves({ square, verbose: true });
    if (moves.length > 0 && game.turn() === playerColor) {
      setSelectedSquare(square);
      setLegalMoves(moves.map((m) => m.to));
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Resign
  const handleResign = () => {
    setShowResignConfirm(true);
  };
  
  const confirmResign = () => {
    setShowResignConfirm(false);
    setResult({ type: 'lose', message: 'You resigned. You lose.' });
    setIsGameActive(false);
    clearInterval(intervalId);
    handleGameEnd('lose');
  };
  
  const cancelResign = () => {
    setShowResignConfirm(false);
  };

  // Enhanced board square styles
  const customSquareStyles = useMemo(() => {
    const styles = {};
    
    if (selectedSquare) {
      styles[selectedSquare] = {
        boxShadow: '0 0 0 4px #facc15cc',
      };
      legalMoves.forEach((sq) => {
        styles[sq] = {
          backgroundColor: '#facc1580',
          borderRadius: '50%',
          border: '2px solid #facc15',
        };
      });
    }
    
    if (lastMove) {
      styles[lastMove.from] = {
        ...styles[lastMove.from],
        backgroundColor: '#3b82f680',
        border: '2px solid #3b82f6',
      };
      styles[lastMove.to] = {
        ...styles[lastMove.to],
        backgroundColor: '#3b82f680',
        border: '2px solid #3b82f6',
      };
    }
    
    return styles;
  }, [selectedSquare, legalMoves, lastMove]);

  const formatTime = (t) => `${Math.floor(t/60)}:${(t%60).toString().padStart(2,'0')}`;

  // Block navigation if game is active
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isGameActive && !result) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGameActive, result]);

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Sidebar - Game Info */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Game Timer */}
            <div className="bg-gradient-to-br from-gray-800/80 to-black/60 rounded-xl p-4 border-2 border-yellow-400">
              <div className="text-center">
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white mb-1">
                  {formatTime(gameTime)}
                </div>
                <div className="text-sm text-gray-400">Game Time Remaining</div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(gameTime / 600) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Player Cards */}
            <div className="space-y-4">
              {/* Bot Card */}
              <div className={`bg-gradient-to-br from-gray-800/80 to-black/60 rounded-xl p-4 border-2 transition-all duration-300 ${
                game.turn() === (gameConfig.playerColor === 'white' ? 'b' : 'w') ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-600'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img src="/assets/solxclash_logo.svg" alt="Bot" className="w-12 h-12 rounded-full" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 font-semibold">ChessBot</span>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 capitalize">
                        {gameConfig.difficulty}
                      </span>
                    </div>
                    {game.turn() === (gameConfig.playerColor === 'white' ? 'b' : 'w') && (
                      <div className="flex items-center space-x-1 text-yellow-400 text-xs">
                        <Brain className="w-3 h-3" />
                        <span>Bot's turn</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Card */}
              <div className={`bg-gradient-to-br from-yellow-400/10 to-black/30 rounded-xl p-4 border-2 transition-all duration-300 ${
                game.turn() === (gameConfig.playerColor === 'white' ? 'w' : 'b') ? 'border-green-400 bg-green-400/10' : 'border-gray-600'
              }`}>
                <div className="flex items-center space-x-3">
                  <img src={profile.avatar_url || '/assets/solxclash_logo.svg'} alt="User" className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <span className="text-white font-semibold block">{profile.username}</span>
                    {game.turn() === (gameConfig.playerColor === 'white' ? 'w' : 'b') && (
                      <span className="text-green-400 text-xs">Your turn</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Stats */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-xl p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Game Stats
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{moveHistory.length}</div>
                  <div className="text-gray-400">Moves</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-400">{gameStats.captures}</div>
                  <div className="text-gray-400">Captures</div>
                </div>
              </div>
            </div>

            {/* Move History */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-xl p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">Move History</h3>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {moveHistory.length === 0 ? (
                  <span className="text-gray-400 text-sm">No moves yet.</span>
                ) : (
                  moveHistory.map((move, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1">
                      <span className="text-xs text-gray-400">{Math.floor(i/2) + 1}.</span>
                      <span className="text-white font-mono text-sm">{move}</span>
                      <span className="text-xs text-gray-500">
                        {(gameConfig.playerColor === 'white' && i % 2 === 0) || (gameConfig.playerColor === 'black' && i % 2 === 1) ? 'You' : 'Bot'}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Game Controls */}
            <div className="space-y-3">
              <button
                onClick={handleResign}
                className="w-full bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-400 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Flag className="w-5 h-5" />
                <span>Resign</span>
              </button>
              
              <button
                onClick={onBackToSetup}
                className="w-full bg-gray-800 text-yellow-400 px-4 py-3 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>New Game</span>
              </button>
            </div>
          </div>

          {/* Center - Chessboard */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-full max-w-lg bg-gradient-to-br from-yellow-400/10 to-black/30 rounded-2xl shadow-2xl p-4 mb-4">
              <Chessboard
                position={fen}
                onSquareClick={handleSquareClick}
                customSquareStyles={customSquareStyles}
                boardWidth={Math.min(window.innerWidth < 768 ? window.innerWidth - 64 : 480, 480)}
                customDarkSquareStyle={{ backgroundColor: BOARD_COLORS.dark, boxShadow: 'inset 0 2px 8px #00000044' }}
                customLightSquareStyle={{ backgroundColor: BOARD_COLORS.light, boxShadow: 'inset 0 2px 8px #00000022' }}
                arePiecesDraggable={false}
                animationDuration={300}
                boardOrientation={gameConfig.playerColor}
                id="chessclash-board"
              />
            </div>
          </div>

          {/* Right Sidebar - Match Info */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Match Info */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-xl p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center">
                <Cpu className="w-5 h-5 mr-2" />
                Match Info
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Your Color:</span>
                  <span className="text-white font-semibold capitalize">{gameConfig.playerColor}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Difficulty:</span>
                  <span className="text-white font-semibold capitalize">{gameConfig.difficulty}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">XP Invested:</span>
                  <span className="text-yellow-400 font-bold">{gameConfig.xpCost} XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Potential Win:</span>
                  <span className="text-green-400 font-bold">
                    {gameConfig.difficulty === 'easy' ? 40 : gameConfig.difficulty === 'medium' ? 60 : 100} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Game Status */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-xl p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">Game Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${isGameActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-gray-300">{isGameActive ? 'Game Active' : 'Game Ended'}</span>
                </div>
                {game.isCheck() && (
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-400">Check!</span>
                  </div>
                )}
                <div className="text-gray-400">
                  Turn: {game.turn() === 'w' ? 'White' : 'Black'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Modal - No auto-hide timeout */}
      {result && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-400/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl relative">
            <div className="flex items-center justify-center mb-4">
              {result.type === 'win' && <CheckCircle className="w-12 h-12 text-green-400" />}
              {result.type === 'lose' && <AlertCircle className="w-12 h-12 text-red-400" />}
              {result.type === 'draw' && <RotateCcw className="w-12 h-12 text-blue-400" />}
              {result.type === 'timeout' && <Clock className="w-12 h-12 text-yellow-400" />}
            </div>
            
            <h3 className="text-2xl font-bold mb-4 text-white">{result.message}</h3>
            
            <div className="bg-gray-800/50 rounded-lg p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Moves Played:</span>
                <span className="text-white">{moveHistory.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Captures:</span>
                <span className="text-white">{gameStats.captures}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Difficulty:</span>
                <span className="text-white capitalize">{gameConfig.difficulty}</span>
              </div>
            </div>
            
            <div className="text-lg font-semibold text-yellow-400 mb-6">
              {result.type === 'win' && <>+{gameConfig.difficulty === 'easy' ? 40 : gameConfig.difficulty === 'medium' ? 60 : 100} XP</>}
              {result.type === 'draw' && <>XP Refunded</>}
              {result.type === 'lose' && <>0 XP</>}
              {result.type === 'timeout' && <>0 XP</>}
            </div>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={onBackToSetup} 
                className="w-full bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200"
              >
                Play Again
              </button>
              <button 
                onClick={() => navigate('/')} 
                className="w-full bg-gray-800 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <Home className="w-5 h-5" />
                <span>Back to Home</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resign Confirmation Modal */}
      {showResignConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-red-500/30 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Resign Game?</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to resign? You will lose your invested XP.</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={confirmResign} 
                className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-400 transition-colors"
              >
                Yes, Resign
              </button>
              <button 
                onClick={cancelResign} 
                className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
              >
                Continue Playing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessClash;