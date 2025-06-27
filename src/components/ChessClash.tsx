import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Zap, CheckCircle, AlertCircle, RotateCcw, Settings, X as CloseIcon, Clock, User as UserIcon, Cpu } from 'lucide-react';
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
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
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

  // Bot move logic (now with difficulty)
  const makeBotMove = () => {
    if (game.isGameOver()) return;
    setActiveTimer('bot');
    setTimeout(() => {
      let move = getBotMove(game, selectedMode);
      if (move) {
        game.move(move);
        setFen(game.fen());
        setMoveHistory((h) => [...h, move]);
        setActiveTimer('user');
      }
    }, 500);
  };

  // Handle user move (click-to-select, show dots)
  const handleSquareClick = (square) => {
    if (!isGameActive) return;
    if (selectedSquare && legalMoves.includes(square)) {
      const move = game.move({ from: selectedSquare, to: square, promotion: 'q' });
      if (move) {
        setFen(game.fen());
        setMoveHistory((h) => [...h, move.san]);
        setSelectedSquare(null);
        setLegalMoves([]);
        setActiveTimer('bot');
        setTimeout(makeBotMove, 500);
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
  };

  // Board square styles (dots, highlights)
  const customSquareStyles = useMemo(() => {
    const styles = {};
    if (selectedSquare) {
      styles[selectedSquare] = {
        boxShadow: '0 0 0 4px #facc15cc',
      };
      legalMoves.forEach((sq) => {
        styles[sq] = {
          backgroundColor: '#facc1580', // semi-transparent yellow for move dot
        };
      });
    }
    return styles;
  }, [selectedSquare, legalMoves]);

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

  // UI
  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-2 min-h-screen">
      <div className="w-full max-w-md flex flex-col items-center mx-auto relative">
        {/* Top Row: Bot info (left), Settings (right) - above board */}
        {!showStart && !result && (
          <div className="w-full flex flex-row justify-between items-center mb-4 px-1">
            {/* Bot Info Card (top-left above board) */}
            <div className="flex items-center gap-2 bg-gradient-to-br from-gray-700/80 to-black/60 rounded-xl shadow-md px-3 py-2">
              <img src="/assets/solxclash_logo.svg" alt="Bot" className="w-8 h-8 rounded-full" />
              <div className="flex flex-col items-start">
                <span className="text-yellow-400 font-semibold text-sm">Bot</span>
                <span className={`font-mono text-xs ${botTime < 10 ? 'text-red-400' : botTime < 60 ? 'text-yellow-400' : 'text-white'}`}>{formatTime(botTime)}</span>
              </div>
            </div>
            {/* Settings Button (top-right above board) */}
            <button
              className="bg-gray-800/80 rounded-full p-2 hover:bg-yellow-400/20 focus:outline-none border border-yellow-400/10 shadow-md"
              onClick={() => setShowSettings((v) => !v)}
              aria-label="Settings"
            >
              <Settings className="w-6 h-6 text-yellow-400" />
            </button>
          </div>
        )}
        {/* Settings Menu (dropdown, animated, never overlaps board) */}
        {showSettings && !showStart && !result && (
          <div className="absolute right-0 top-16 z-30 bg-gray-900 border border-yellow-400/20 rounded-xl shadow-lg p-4 flex flex-col gap-2 w-56 animate-fade-in">
            <div className="flex justify-between items-center mb-2">
              <span className="font-bold text-lg text-yellow-400">Settings</span>
              <button onClick={() => setShowSettings(false)} aria-label="Close Settings" className="text-gray-400 hover:text-yellow-400 focus:outline-none">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
            <button onClick={handleResign} className="text-red-400 font-semibold hover:underline focus:outline-none text-left py-2 px-2 rounded hover:bg-gray-800 transition-colors" aria-label="Resign">Resign</button>
            <button onClick={handlePlayAgain} className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors duration-200 text-left">Play New Game</button>
          </div>
        )}
        {/* Chessboard - centered, responsive */}
        {!showStart && !result && (
          <div className="w-full flex justify-center items-center bg-gradient-to-br from-yellow-400/10 to-black/30 rounded-2xl shadow-2xl p-2 mb-4 relative" style={{ minHeight: window.innerWidth < 500 ? window.innerWidth - 32 : 384 }}>
            <Chessboard
              position={fen}
              onSquareClick={handleSquareClick}
              customSquareStyles={customSquareStyles}
              boardWidth={window.innerWidth < 500 ? window.innerWidth - 32 : 384}
              customDarkSquareStyle={{ backgroundColor: BOARD_COLORS.dark, boxShadow: 'inset 0 2px 8px #00000044' }}
              customLightSquareStyle={{ backgroundColor: BOARD_COLORS.light, boxShadow: 'inset 0 2px 8px #00000022' }}
              arePiecesDraggable={false}
              animationDuration={200}
              boardOrientation="white"
              id="chessclash-board"
            />
          </div>
        )}
        {/* User Info Card (bottom-left below board) */}
        {!showStart && !result && (
          <div className="w-full flex flex-row items-center mb-2 px-1">
            <div className="flex items-center gap-2 bg-gradient-to-br from-yellow-400/10 to-black/30 rounded-xl shadow-md px-3 py-2">
              <img src={profile.avatar_url || '/assets/solxclash_logo.svg'} alt="User" className="w-8 h-8 rounded-full" />
              <div className="flex flex-col">
                <span className="text-white font-semibold text-sm">{profile.username}</span>
                <span className={`font-mono text-xs ${userTime < 10 ? 'text-red-400' : userTime < 60 ? 'text-yellow-400' : 'text-white'}`}>{formatTime(userTime)}</span>
              </div>
            </div>
          </div>
        )}
        {/* Move History (horizontal, below user/settings) */}
        {!showStart && !result && (
          <div className="w-full overflow-x-auto flex gap-2 mb-2 bg-gradient-to-br from-gray-900/80 to-black/80 rounded-xl shadow-md p-3">
            {moveHistory.length === 0 ? (
              <span className="text-gray-400">No moves yet.</span>
            ) : (
              moveHistory.map((m, i) => (
                <span key={i} className="block px-2 py-1 bg-yellow-400/10 rounded text-white font-mono text-xs border border-yellow-400/20">{m}</span>
              ))
            )}
          </div>
        )}
      </div>
      {/* Start Card (overlay, improved UI) */}
      {showStart && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-400/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl relative">
            <button onClick={() => navigate('/')} className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 focus:outline-none" aria-label="Go Home"><CloseIcon className="w-6 h-6" /></button>
            <h2 className="text-3xl font-bold text-yellow-400 mb-4 flex items-center justify-center gap-2"><Zap className="w-7 h-7" /> ChessClash</h2>
            <div className="flex flex-col gap-4 items-center mb-4">
              <div className="flex items-center gap-2"><Clock className="w-5 h-5 text-yellow-400" /><span className="text-white font-semibold">Timeframe:</span><span className="text-yellow-400 font-bold">10 min</span></div>
              <div className="flex items-center gap-2"><Cpu className="w-5 h-5 text-yellow-400" /><span className="text-white font-semibold">Difficulty:</span>
                <div className="flex gap-2">
                  {Object.keys(XP_COSTS).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setSelectedMode(mode)}
                      className={`px-4 py-1 rounded-lg font-semibold border-2 transition-all duration-200 ${selectedMode === mode ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-gray-800 text-white border-gray-700 hover:bg-yellow-400/20'}`}
                      aria-label={`Select ${mode} mode`}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2"><UserIcon className="w-5 h-5 text-yellow-400" /><span className="text-white font-semibold">XP to Play:</span><span className="text-yellow-400 font-bold">{XP_COSTS[selectedMode]}</span></div>
              <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /><span className="text-white font-semibold">Potential Win:</span><span className="text-green-400 font-bold">{XP_WIN[selectedMode]}</span></div>
              <div className="flex items-center gap-2"><span className="text-gray-400 text-xs">Note: Draw = XP refunded</span></div>
            </div>
            <button
              onClick={handleStart}
              disabled={xpState < XP_COSTS[selectedMode] || isProcessing}
              className="w-full bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Start ChessClash game"
            >
              Start Game ({XP_COSTS[selectedMode]} XP)
            </button>
            {xpState < XP_COSTS[selectedMode] && <div className="text-red-400 mt-2">Not enough XP to play.</div>}
            {error && <div className="text-red-400 mt-2">{error}</div>}
          </div>
        </div>
      )}
      {/* Result Card/Modal (overlay, closeable by X or buttons) */}
      {result && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-400/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl relative">
            <button onClick={() => { setResult(null); setShowStart(true); }} className="absolute top-4 right-4 text-gray-400 hover:text-yellow-400 focus:outline-none" aria-label="Close"><CloseIcon className="w-6 h-6" /></button>
            <div className="flex items-center justify-center mb-2">
              {result.type === 'win' && <CheckCircle className="w-8 h-8 text-green-400" />}
              {result.type === 'lose' && <AlertCircle className="w-8 h-8 text-red-400" />}
              {result.type === 'draw' && <RotateCcw className="w-8 h-8 text-blue-400" />}
              {result.type === 'timeout' && <AlertCircle className="w-8 h-8 text-yellow-400" />}
            </div>
            <h3 className="text-2xl font-bold mb-2 text-white">{result.message}</h3>
            <div className="text-lg font-semibold text-yellow-400 mb-2">
              {result.type === 'win' && <>+{XP_WIN[selectedMode]} XP</>}
              {result.type === 'draw' && <>XP Refunded</>}
              {result.type === 'lose' && <>0 XP</>}
              {result.type === 'timeout' && <>0 XP</>}
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <button onClick={handlePlayAgain} className="w-full bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors duration-200" aria-label="Play Again">Play New Game</button>
              <button onClick={() => navigate('/')} className="w-full bg-gray-800 text-yellow-400 px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 transition-colors duration-200" aria-label="Go Home">Go Home</button>
            </div>
          </div>
        </div>
      )}
      {/* Leave Game Modal (if navigating away while playing) */}
      {showLeaveGameModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-400/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-4">Leaving game?</h3>
            <div className="flex gap-4 justify-center">
              <button onClick={confirmLeaveGame} className="bg-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-400 focus:outline-none">Yes</button>
              <button onClick={cancelLeaveGame} className="bg-gray-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-600 focus:outline-none">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChessClash; 