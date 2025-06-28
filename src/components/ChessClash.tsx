import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Zap, CheckCircle, AlertCircle, RotateCcw, Settings, X as CloseIcon, Clock, User as UserIcon, Cpu, Brain, Target, Trophy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './AuthProvider';
import { useNavigate } from 'react-router-dom';

const BOARD_COLORS = {
  light: '#f7fafc', // modern off-white
  dark: '#23272f', // modern dark/blue-gray
};
const GAME_TIME = 600; // 10 minutes in seconds
const XP_COSTS = { easy: 20, medium: 30, hard: 50 };
const XP_WIN = { easy: 40, medium: 60, hard: 100 };

const DIFFICULTY_LEVELS = [
  { label: 'Easy', value: 'easy', description: 'Casual play, some random moves' },
  { label: 'Medium', value: 'medium', description: 'Balanced strategy and tactics' },
  { label: 'Hard', value: 'hard', description: 'Advanced AI, deep calculation' },
];

const getRandomBotMove = (game) => {
  const moves = game.moves();
  return moves[Math.floor(Math.random() * moves.length)];
};

// Minimax with alpha-beta pruning for bot
const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

function evaluateBoard(game) {
  const fen = game.fen();
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

const ChessClash = ({ profile }) => {
  const { refreshSessionAndProfile } = useAuthContext();
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [timer, setTimer] = useState(GAME_TIME);
  const [intervalId, setIntervalId] = useState(null);
  const [isGameActive, setIsGameActive] = useState(false);
  const [result, setResult] = useState(null); // { type: 'win'|'lose'|'draw'|'timeout', message: string }
  const [selectedMode, setSelectedMode] = useState('easy');
  const [showStart, setShowStart] = useState(true);
  const [xpState, setXpState] = useState(profile.xp);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [legalMoves, setLegalMoves] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [userTime, setUserTime] = useState(GAME_TIME);
  const [botTime, setBotTime] = useState(GAME_TIME);
  const [activeTimer, setActiveTimer] = useState('user');
  const [lastMove, setLastMove] = useState(null); // Track last move for highlighting
  const [botThinking, setBotThinking] = useState(false); // Bot thinking indicator
  const [gameStats, setGameStats] = useState({ captures: 0, checks: 0 }); // Game statistics
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showLeaveGameModal, setShowLeaveGameModal] = useState(false);
  const pendingTransition = useRef(null);

  // Timer effect (per player)
  useEffect(() => {
    if (!isGameActive) return;
    if (result) return;
    const id = setInterval(() => {
      if (activeTimer === 'user') {
        setUserTime((t) => {
          if (t <= 1) {
            setResult({ type: 'timeout', message: 'Time is up! You lose.' });
            setIsGameActive(false);
            clearInterval(id);
            handleGameEnd('timeout');
            return 0;
          }
          return t - 1;
        });
      } else {
        setBotTime((t) => {
          if (t <= 1) {
            setResult({ type: 'win', message: 'Bot ran out of time! You win!' });
            setIsGameActive(false);
            clearInterval(id);
            handleGameEnd('win');
            return 0;
          }
          return t - 1;
        });
      }
    }, 1000);
    setIntervalId(id);
    return () => clearInterval(id);
  }, [isGameActive, activeTimer, result]);

  // Game end detection
  useEffect(() => {
    if (!isGameActive) return;
    if (game.isGameOver()) {
      let type = 'draw';
      let message = 'Draw! Your XP is refunded.';
      if (game.isCheckmate()) {
        if (game.turn() === 'b') {
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

  // Start game (no DB update)
  const handleStart = async () => {
    const xpCost = XP_COSTS[selectedMode];
    if (xpState < xpCost) return;
    setShowStart(false);
    setIsGameActive(true);
    setTimer(GAME_TIME);
    setUserTime(GAME_TIME);
    setBotTime(GAME_TIME);
    setActiveTimer('user');
    setGame(new Chess());
    setFen(new Chess().fen());
    setResult(null);
    setError(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setLastMove(null);
    setBotThinking(false);
    setGameStats({ captures: 0, checks: 0 });
    setXpState((xp) => xp - xpCost);
    // Update DB in background
    setIsProcessing(true);
    const { error } = await supabase
      .from('profiles')
      .update({ xp: xpState - xpCost })
      .eq('id', profile.id);
    if (error) {
      setError('Failed to deduct XP. Please try again.');
      // Revert state
      setShowStart(true);
      setIsGameActive(false);
      setXpState((xp) => xp + xpCost);
    }
    setIsProcessing(false);
  };

  // Handle game end: update XP, wins, games_played in DB
  const handleGameEnd = async (type) => {
    setIsProcessing(true);
    setError(null);
    let xpChange = 0;
    let winInc = 0;
    let gamesPlayedInc = 1;
    const xpCost = XP_COSTS[selectedMode];
    if (type === 'win') {
      xpChange = XP_WIN[selectedMode];
      winInc = 1;
    } else if (type === 'draw') {
      xpChange = xpCost; // refund
    } else if (type === 'lose' || type === 'timeout') {
      xpChange = 0;
    }
    const newXP = xpState + xpChange;
    if (newXP < 0) {
      setError('Not enough XP to record result.');
      setIsProcessing(false);
      return;
    }
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

  // Bot move logic (now with difficulty and thinking indicator)
  const makeBotMove = () => {
    if (game.isGameOver()) return;
    setBotThinking(true);
    setActiveTimer('bot');
    
    // Simulate thinking time based on difficulty
    const thinkingTime = selectedMode === 'easy' ? 500 : selectedMode === 'medium' ? 1000 : 1500;
    
    setTimeout(() => {
      let move = getBotMove(game, selectedMode);
      if (move) {
        const moveObj = game.move(move);
        if (moveObj) {
          setFen(game.fen());
          setMoveHistory((h) => [...h, moveObj.san]);
          setLastMove({ from: moveObj.from, to: moveObj.to });
          
          // Update game stats
          if (moveObj.captured) {
            setGameStats(prev => ({ ...prev, captures: prev.captures + 1 }));
          }
          if (game.isCheck()) {
            setGameStats(prev => ({ ...prev, checks: prev.checks + 1 }));
          }
        }
        setActiveTimer('user');
      }
      setBotThinking(false);
    }, thinkingTime);
  };

  // Handle user move (click-to-select, show dots)
  const handleSquareClick = (square) => {
    if (!isGameActive || activeTimer !== 'user' || botThinking) return;
    
    if (selectedSquare && legalMoves.includes(square)) {
      const moveObj = game.move({ from: selectedSquare, to: square, promotion: 'q' });
      if (moveObj) {
        setFen(game.fen());
        setMoveHistory((h) => [...h, moveObj.san]);
        setLastMove({ from: moveObj.from, to: moveObj.to });
        setSelectedSquare(null);
        setLegalMoves([]);
        
        // Update game stats
        if (moveObj.captured) {
          setGameStats(prev => ({ ...prev, captures: prev.captures + 1 }));
        }
        if (game.isCheck()) {
          setGameStats(prev => ({ ...prev, checks: prev.checks + 1 }));
        }
        
        setActiveTimer('bot');
        setTimeout(makeBotMove, 300);
      }
      return;
    }
    // Select piece and show legal moves
    const moves = game.moves({ square, verbose: true });
    if (moves.length > 0 && game.turn() === 'w') {
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

  // Reset game
  const handlePlayAgain = () => {
    setShowStart(true);
    setResult(null);
    setGame(new Chess());
    setFen(new Chess().fen());
    setTimer(GAME_TIME);
    setError(null);
    setSelectedSquare(null);
    setLegalMoves([]);
    setMoveHistory([]);
    setUserTime(GAME_TIME);
    setBotTime(GAME_TIME);
    setActiveTimer('user');
    setLastMove(null);
    setBotThinking(false);
    setGameStats({ captures: 0, checks: 0 });
  };

  // Enhanced board square styles (dots, highlights, last move)
  const customSquareStyles = useMemo(() => {
    const styles = {};
    
    // Highlight selected square
    if (selectedSquare) {
      styles[selectedSquare] = {
        boxShadow: '0 0 0 4px #facc15cc',
      };
      // Show legal move dots
      legalMoves.forEach((sq) => {
        styles[sq] = {
          backgroundColor: '#facc1580',
          borderRadius: '50%',
          border: '2px solid #facc15',
        };
      });
    }
    
    // Highlight last move
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

  // Timer display helper
  const formatTime = (t) => `${Math.floor(t/60)}:${(t%60).toString().padStart(2,'0')}`;

  // Block browser close/tab close if game is active
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isGameActive && !result && !showStart) {
        e.preventDefault();
        e.returnValue = '';
        setShowLeaveGameModal(true);
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isGameActive, result, showStart]);

  // Block in-app navigation if game is active
  useEffect(() => {
    if (!navigate.block) return;
    const unblock = navigate.block((tx) => {
      if (isGameActive && !result && !showStart) {
        setShowLeaveGameModal(true);
        pendingTransition.current = tx;
        return false;
      }
      return true;
    });
    return () => unblock && unblock();
  }, [isGameActive, result, showStart, navigate]);

  const confirmLeaveGame = () => {
    setShowLeaveGameModal(false);
    if (pendingTransition.current) {
      pendingTransition.current.retry();
      pendingTransition.current = null;
    } else {
      window.location.href = '/';
    }
  };
  const cancelLeaveGame = () => setShowLeaveGameModal(false);

  // Get difficulty info
  const getDifficultyInfo = (difficulty) => {
    return DIFFICULTY_LEVELS.find(d => d.value === difficulty);
  };

  // UI
  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-2 min-h-screen bg-gradient-to-br from-gray-900 to-black">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-start justify-center mx-auto relative gap-8">
        
        {/* Game Board Section */}
        <div className="w-full lg:w-2/3 flex flex-col items-center">
          {/* Top Row: Bot info (left), Settings (right) - above board */}
          {!showStart && !result && (
            <div className="w-full flex flex-row justify-between items-center mb-4 px-1">
              {/* Bot Info Card (top-left above board) */}
              <div className={`flex items-center gap-3 bg-gradient-to-br from-gray-700/80 to-black/60 rounded-xl shadow-lg px-4 py-3 transition-all duration-300 ${
                activeTimer === 'bot' ? 'border-2 border-yellow-400 bg-yellow-400/10' : 'border border-gray-600'
              }`}>
                <div className="relative">
                  <img src="/assets/solxclash_logo.svg" alt="Bot" className="w-10 h-10 rounded-full" />
                  {botThinking && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <div className="flex items-center space-x-2">
                    <span className="text-yellow-400 font-semibold text-sm">ChessBot</span>
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                      {getDifficultyInfo(selectedMode)?.label}
                    </span>
                  </div>
                  <span className={`font-mono text-xs ${botTime < 10 ? 'text-red-400' : botTime < 60 ? 'text-yellow-400' : 'text-white'}`}>
                    {formatTime(botTime)}
                  </span>
                  {botThinking && (
                    <div className="flex items-center space-x-1 text-yellow-400 text-xs">
                      <Brain className="w-3 h-3 animate-pulse" />
                      <span>Thinking...</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Settings Button (top-right above board) */}
              <button
                className="bg-gray-800/80 rounded-full p-3 hover:bg-yellow-400/20 focus:outline-none border border-yellow-400/10 shadow-lg transition-all duration-200"
                onClick={() => setShowSettings((v) => !v)}
                aria-label="Settings"
              >
                <Settings className="w-6 h-6 text-yellow-400" />
              </button>
            </div>
          )}

          {/* Settings Menu (dropdown, animated, never overlaps board) */}
          {showSettings && !showStart && !result && (
            <div className="absolute right-0 top-16 z-30 bg-gray-900 border border-yellow-400/20 rounded-xl shadow-lg p-4 flex flex-col gap-2 w-56 animate-scale-in">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg text-yellow-400">Game Settings</span>
                <button onClick={() => setShowSettings(false)} aria-label="Close Settings" className="text-gray-400 hover:text-yellow-400 focus:outline-none">
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>
              <button onClick={handleResign} className="text-red-400 font-semibold hover:underline focus:outline-none text-left py-2 px-2 rounded hover:bg-gray-800 transition-colors" aria-label="Resign">
                Resign Game
              </button>
              <button onClick={handlePlayAgain} className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors duration-200 text-left">
                New Game
              </button>
            </div>
          )}

          {/* Chessboard - centered, responsive */}
          {!showStart && !result && (
            <div className="w-full flex justify-center items-center bg-gradient-to-br from-yellow-400/10 to-black/30 rounded-2xl shadow-2xl p-4 mb-4 relative animate-scale-in" style={{ minHeight: window.innerWidth < 500 ? window.innerWidth - 32 : 400 }}>
              <Chessboard
                position={fen}
                onSquareClick={handleSquareClick}
                customSquareStyles={customSquareStyles}
                boardWidth={Math.min(window.innerWidth < 500 ? window.innerWidth - 64 : 400, 400)}
                customDarkSquareStyle={{ backgroundColor: BOARD_COLORS.dark, boxShadow: 'inset 0 2px 8px #00000044' }}
                customLightSquareStyle={{ backgroundColor: BOARD_COLORS.light, boxShadow: 'inset 0 2px 8px #00000022' }}
                arePiecesDraggable={false}
                animationDuration={300}
                boardOrientation="white"
                id="chessclash-board"
              />
            </div>
          )}

          {/* User Info Card (bottom-left below board) */}
          {!showStart && !result && (
            <div className="w-full flex flex-row items-center mb-4 px-1">
              <div className={`flex items-center gap-3 bg-gradient-to-br from-yellow-400/10 to-black/30 rounded-xl shadow-lg px-4 py-3 transition-all duration-300 ${
                activeTimer === 'user' ? 'border-2 border-green-400 bg-green-400/10' : 'border border-gray-600'
              }`}>
                <img src={profile.avatar_url || '/assets/solxclash_logo.svg'} alt="User" className="w-10 h-10 rounded-full" />
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm">{profile.username}</span>
                  <span className={`font-mono text-xs ${userTime < 10 ? 'text-red-400' : userTime < 60 ? 'text-yellow-400' : 'text-white'}`}>
                    {formatTime(userTime)}
                  </span>
                  {activeTimer === 'user' && !botThinking && (
                    <span className="text-green-400 text-xs">Your turn</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Game Info Sidebar */}
        {!showStart && !result && (
          <div className="w-full lg:w-1/3 space-y-4">
            {/* Game Stats */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-xl shadow-lg p-4">
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
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-xl shadow-lg p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-3">Move History</h3>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {moveHistory.length === 0 ? (
                  <span className="text-gray-400 text-sm">No moves yet.</span>
                ) : (
                  moveHistory.map((move, i) => (
                    <div key={i} className="flex items-center justify-between bg-gray-800/50 rounded px-2 py-1">
                      <span className="text-xs text-gray-400">{Math.floor(i/2) + 1}.</span>
                      <span className="text-white font-mono text-sm">{move}</span>
                      <span className="text-xs text-gray-500">{i % 2 === 0 ? 'You' : 'Bot'}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Difficulty Info */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-xl shadow-lg p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center">
                <Cpu className="w-5 h-5 mr-2" />
                Opponent
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Difficulty:</span>
                  <span className="text-white font-semibold">{getDifficultyInfo(selectedMode)?.label}</span>
                </div>
                <p className="text-sm text-gray-400">{getDifficultyInfo(selectedMode)?.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">XP Invested:</span>
                  <span className="text-yellow-400 font-bold">{XP_COSTS[selectedMode]} XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Win Reward:</span>
                  <span className="text-green-400 font-bold">{XP_WIN[selectedMode]} XP</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Start Card (overlay, improved UI) */}
      {showStart && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-400/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl relative animate-scale-in">
            <button onClick={() => navigate('/')} className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 focus:outline-none" aria-label="Go Home">
              <CloseIcon className="w-6 h-6" />
            </button>
            
            <div className="mb-6">
              <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-yellow-400 mb-4">ChessClash</h2>
              <p className="text-gray-300 mb-2">Test your chess skills against our AI</p>
              <p className="text-sm text-gray-400">Choose your difficulty and prove your strategic mastery</p>
            </div>

            <div className="space-y-6">
              {/* Difficulty Selection */}
              <div>
                <h3 className="text-white font-semibold mb-3 flex items-center justify-center">
                  <Cpu className="w-5 h-5 mr-2 text-yellow-400" />
                  Select Difficulty
                </h3>
                <div className="space-y-3">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSelectedMode(level.value)}
                      className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                        selectedMode === level.value
                          ? 'bg-yellow-400 text-black border-yellow-400'
                          : 'bg-gray-800 text-white border-gray-700 hover:bg-yellow-400/20 hover:border-yellow-400/50'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold">{level.label}</span>
                        <span className="text-sm">{XP_COSTS[level.value]} XP</span>
                      </div>
                      <p className="text-xs opacity-80">{level.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Info */}
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Time Control:</span>
                  <span className="text-white font-semibold">10 minutes each</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">XP Cost:</span>
                  <span className="text-yellow-400 font-bold">{XP_COSTS[selectedMode]} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Win Reward:</span>
                  <span className="text-green-400 font-bold">{XP_WIN[selectedMode]} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Draw:</span>
                  <span className="text-blue-400 font-bold">XP Refunded</span>
                </div>
              </div>

              <button
                onClick={handleStart}
                disabled={xpState < XP_COSTS[selectedMode] || isProcessing}
                className="w-full bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Trophy className="w-5 h-5" />
                <span>Start Game</span>
              </button>

              {xpState < XP_COSTS[selectedMode] && (
                <div className="text-red-400 text-sm">Not enough XP to play this difficulty.</div>
              )}
              {error && <div className="text-red-400 text-sm">{error}</div>}
            </div>
          </div>
        </div>
      )}

      {/* Result Card/Modal (overlay, enhanced) */}
      {result && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-400/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl relative animate-scale-in">
            <button onClick={() => { setResult(null); setShowStart(true); }} className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 focus:outline-none">
              <CloseIcon className="w-6 h-6" />
            </button>
            
            <div className="flex items-center justify-center mb-4">
              {result.type === 'win' && <CheckCircle className="w-12 h-12 text-green-400" />}
              {result.type === 'lose' && <AlertCircle className="w-12 h-12 text-red-400" />}
              {result.type === 'draw' && <RotateCcw className="w-12 h-12 text-blue-400" />}
              {result.type === 'timeout' && <Clock className="w-12 h-12 text-yellow-400" />}
            </div>
            
            <h3 className="text-2xl font-bold mb-4 text-white">{result.message}</h3>
            
            {/* Game Summary */}
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
                <span className="text-white">{getDifficultyInfo(selectedMode)?.label}</span>
              </div>
            </div>
            
            <div className="text-lg font-semibold text-yellow-400 mb-6">
              {result.type === 'win' && <>+{XP_WIN[selectedMode]} XP</>}
              {result.type === 'draw' && <>XP Refunded</>}
              {result.type === 'lose' && <>0 XP</>}
              {result.type === 'timeout' && <>0 XP</>}
            </div>
            
            <div className="flex flex-col gap-3">
              <button onClick={handlePlayAgain} className="w-full bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200">
                Play Again
              </button>
              <button onClick={() => navigate('/')} className="w-full bg-gray-800 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black transition-colors duration-200">
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resign Confirmation Modal */}
      {showResignConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-red-500/30 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl animate-scale-in">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Resign Game?</h3>
            <p className="text-gray-300 mb-6">Are you sure you want to resign? You will lose your invested XP.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={confirmResign} className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-400 transition-colors">
                Yes, Resign
              </button>
              <button onClick={cancelResign} className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                Continue Playing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Game Modal */}
      {showLeaveGameModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-400/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl animate-scale-in">
            <AlertCircle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Leave Game?</h3>
            <p className="text-gray-300 mb-6">You have an active game. Leaving will count as a resignation.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={confirmLeaveGame} className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-400 transition-colors">
                Leave Game
              </button>
              <button onClick={cancelLeaveGame} className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors">
                Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessClash;