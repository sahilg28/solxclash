import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chess, Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { AlertCircle, Settings, X as CloseIcon, Clock, User as UserIcon, Cpu, Brain, Target, Trophy, ArrowLeft, Home, Flag, Menu, BarChart3, History, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { createChessAI } from '../lib/chessAI';

const BOARD_COLORS = {
  light: '#f7fafc', // modern off-white
  dark: '#23272f', // modern dark/blue-gray
};

// Add types for props
interface ChessClashProps {
  profile: {
    id: string;
    xp: number;
    wins: number;
    games_played: number;
    avatar_url?: string;
    username: string;
  };
  gameConfig: {
    playerColor: 'white' | 'black';
    difficulty: 'easy' | 'medium' | 'hard';
    xpCost: number;
  };
  onBackToSetup: () => void;
}

const ChessClash: React.FC<ChessClashProps> = ({ profile, gameConfig, onBackToSetup }) => {
  const { refreshSessionAndProfile } = useAuthContext();
  const [game, setGame] = useState(new Chess());
  const [fen, setFen] = useState(game.fen());
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const [isGameActive, setIsGameActive] = useState(true);
  const [result, setResult] = useState<{ type: string; message: string } | null>(null);
  const [xpState, setXpState] = useState<number>(profile.xp);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [moveHistory, setMoveHistory] = useState<string[]>([]);
  
  // Single game timer (10 minutes total)
  const [gameTime, setGameTime] = useState(600); // 10 minutes total
  
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [gameStats, setGameStats] = useState({ captures: 0, checks: 0 });
  const navigate = useNavigate();
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const chessAI = useRef(createChessAI(gameConfig.difficulty));
  const botMoveTimeoutRef = useRef(null);
  const [showResultPopup, setShowResultPopup] = useState(false);

  // Determine player and bot colors
  const playerColor = gameConfig.playerColor === 'white' ? 'w' : 'b';
  const botColor = gameConfig.playerColor === 'white' ? 'b' : 'w';

  // Initialize game based on player color
  useEffect(() => {
    initializeGame();
    
    // Cleanup function
    return () => {
      if (botMoveTimeoutRef.current) {
        clearTimeout(botMoveTimeoutRef.current);
      }
    };
  }, []);

  // Deduct XP on game start
  useEffect(() => {
    const deductXP = async () => {
      setXpState((prev: number) => prev - gameConfig.xpCost);
      
      const { error } = await supabase
        .from('profiles')
        .update({ xp: profile.xp - gameConfig.xpCost })
        .eq('id', profile.id);
      
      if (error) {
        setXpState((prev: number) => prev + gameConfig.xpCost);
      }
      setShowResultPopup(true); // Show result popup after game ends
    };
    
    deductXP();
  }, []);

  // Timer effect: always run timer during game, regardless of bot thinking or turn
  useEffect(() => {
    if (!isGameActive || result) return;
    const id = setInterval(() => {
      setGameTime((t: number) => {
        if (t <= 1) {
          setResult({ type: 'timeout', message: 'Time is up! Game ended in timeout.' });
          setIsGameActive(false);
          if (intervalId) clearInterval(intervalId);
          handleGameEnd('timeout');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    setIntervalId(id as NodeJS.Timeout | null);
    return () => clearInterval(id as NodeJS.Timeout);
  }, [isGameActive, result]);

  // Game end detection and bot move triggering
  useEffect(() => {
    if (!isGameActive || result) return;

    if (game.isGameOver()) {
      let type = 'draw';
      let message = 'Draw! Your XP is refunded.';
      
      if (game.isCheckmate()) {
        if (game.turn() !== playerColor) {
          // If it's not the player's turn and the game is over, the player won
          type = 'win';
          message = 'Checkmate! You win!';
        } else {
          // If it's the player's turn and the game is over, the player lost
          type = 'lose';
          message = 'Checkmate! You lose.';
        }
      } else if (game.isDraw()) {
        type = 'draw';
        message = 'Draw! Your XP is refunded.';
      }
      
      setResult({ type, message });
      setIsGameActive(false);
      if (intervalId) clearInterval(intervalId);
      handleGameEnd(type);
      return;
    }

    // Trigger bot move if it's bot's turn
    if (game.turn() === botColor && !isBotThinking && !result) {
      makeBotMove();
    }
  }, [fen, isGameActive, playerColor, botColor, isBotThinking, result]);

  const initializeGame = async () => {
    try {
      setIsProcessing(true);
      
      // If player is black, bot (white) makes the first move
      if (gameConfig.playerColor === 'black') {
        setTimeout(() => {
          makeBotMove();
        }, 500);
      }
    } catch (err) {
      setXpState(prev => prev + gameConfig.xpCost);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle game end: update XP, wins, games_played in DB
  const handleGameEnd = async (type: string) => {
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
    setShowResultPopup(true); // Show result popup after game ends
  };

  // Bot move logic
  const makeBotMove = () => {
    if (game.isGameOver()) return;
    
    // Only make bot move if it's the bot's turn
    if (game.turn() !== botColor) return;
    
    setIsBotThinking(true);
    
    // Clear any existing timeout
    if (botMoveTimeoutRef.current) {
      clearTimeout(botMoveTimeoutRef.current);
    }

    botMoveTimeoutRef.current = setTimeout(() => {
      try {
        const bestMove = chessAI.current.getBestMove(game);
        
        if (bestMove && !game.isGameOver()) {
          // Create a new Chess instance from current FEN
          const newGame = new Chess(game.fen());
          const moveObj = newGame.move(bestMove);
          
          if (moveObj) {
            // Update state with new Chess instance
            setGame(newGame);
            setFen(newGame.fen());
            setMoveHistory((h) => [...h, moveObj.san]);
            setLastMove({ from: moveObj.from, to: moveObj.to });
            
            if (moveObj.captured) {
              setGameStats(prev => ({ ...prev, captures: prev.captures + 1 }));
            }
            if (newGame.isCheck()) {
              setGameStats(prev => ({ ...prev, checks: prev.checks + 1 }));
            }
          }
        }
      } catch (error) {
        // Silent error handling
      } finally {
        setIsBotThinking(false);
      }
    }, 1000 + Math.random() * 1000); // 1-2 second thinking time
  };

  // Handle user move
  const handleSquareClick = (square: Square) => {
    if (!isGameActive) return;
    
    // Only allow moves on player's turn
    if (game.turn() !== playerColor || isBotThinking) return;
    
    if (selectedSquare && legalMoves.includes(square.toString())) {
      // Create a new Chess instance from current FEN
      const newGame = new Chess(game.fen());
      const moveObj = newGame.move({ from: selectedSquare as Square, to: square as Square, promotion: 'q' });
      
      if (moveObj) {
        // Update state with new Chess instance
        setGame(newGame);
        setFen(newGame.fen());
        setMoveHistory((h) => [...h, moveObj.san]);
        setLastMove({ from: moveObj.from, to: moveObj.to });
        setSelectedSquare(null);
        setLegalMoves([]);
        
        if (moveObj.captured) {
          setGameStats(prev => ({ ...prev, captures: prev.captures + 1 }));
        }
        if (newGame.isCheck()) {
          setGameStats(prev => ({ ...prev, checks: prev.checks + 1 }));
        }
      }
      return;
    }
    
    const piece = game.get(square as Square);
    if (piece && piece.color === playerColor) {
      const moves = game.moves({ square: square as Square, verbose: true });
      if (moves.length > 0) {
        setSelectedSquare(square.toString());
        setLegalMoves(moves.map((m: any) => m.to as string));
      } else {
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Resign
  const handleResign = () => {
    setShowResignConfirm(true);
    setIsSidebarOpen(false);
  };
  
  const confirmResign = async () => {
    setShowResignConfirm(false);
    setResult({ type: 'lose', message: 'You resigned. You lose.' });
    setIsGameActive(false);
    if (intervalId) clearInterval(intervalId);
    await handleGameEnd('lose');
    // Do NOT auto-navigate or start a new game
    // Show result popup
    setShowResultPopup(true);
  };
  
  const cancelResign = () => {
    setShowResignConfirm(false);
  };

  // Enhanced board square styles with smaller dots for legal moves
  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    
    if (selectedSquare) {
      styles[selectedSquare] = {
        boxShadow: '0 0 0 3px #facc15cc',
      };
      legalMoves.forEach((sq) => {
        styles[sq] = {
          background: 'radial-gradient(circle, #facc15 15%, transparent 20%)',
          borderRadius: '0%',
        };
      });
    }
    
    if (lastMove) {
      styles[lastMove.from] = {
        ...styles[lastMove.from],
        backgroundColor: '#3b82f680',
      };
      styles[lastMove.to] = {
        ...styles[lastMove.to],
        backgroundColor: '#3b82f680',
      };
    }

    // King in check animation
    if (game.isCheck()) {
      const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
      const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
      for (let rank = 0; rank < 8; rank++) {
        for (let file = 0; file < 8; file++) {
          const square = files[file] + ranks[rank];
          const piece = game.get(square);
          if (piece && piece.type === 'k' && piece.color === game.turn()) {
            styles[square] = {
              ...styles[square],
              animation: 'king-in-check-pulse 1s infinite',
              boxShadow: '0 0 0 3px #ef4444',
            };
          }
        }
      }
    }
    
    return styles;
  }, [selectedSquare, legalMoves, lastMove, game]);

  const formatTime = (t: number) => `${Math.floor(t/60)}:${(t%60).toString().padStart(2,'0')}`;

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

  // Calculate board width for mobile-first design
  const getBoardWidth = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) { // mobile
      return Math.min(screenWidth - 32, 360);
    } else if (screenWidth < 1024) { // tablet
      return 400;
    } else { // desktop
      return 480;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-gray-900/80 to-black/60 border-b border-yellow-400/20 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToSetup}
            className="p-2 rounded-lg bg-gray-800/50 text-yellow-400 hover:bg-yellow-400/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          {/* Single Game Timer - Mobile */}
          <div className="flex items-center space-x-3 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/30 rounded-xl px-4 py-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <div className="text-center">
              <div className="text-xl font-bold text-white">
                {formatTime(gameTime)}
              </div>
              <div className="text-xs text-gray-400">Total Game Time</div>
            </div>
          </div>
          
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 rounded-lg bg-gray-800/50 text-yellow-400 hover:bg-yellow-400/20 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          
          {/* Desktop Left Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-80 space-y-6">
            {/* Game Timer - Desktop */}
            <div className="bg-gradient-to-br from-gray-800/80 to-black/60 rounded-xl p-4 border-2 border-yellow-400">
              <div className="text-center">
                <Clock className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-bold text-white mb-1">
                  {formatTime(gameTime)}
                </div>
                <div className="text-sm text-gray-400">Total Game Time</div>
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
                game.turn() === botColor ? 'border-yellow-400 bg-yellow-400/10' : 'border-gray-600'
              }`}>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img src="/assets/solxclash_logo.svg" alt="Bot" className="w-12 h-12 rounded-full" />
                    {isBotThinking && (
                      <div className="absolute -top-1 -right-1 w-4 h-4">
                        <div className="w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 font-semibold">ChessBot</span>
                      <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300 capitalize">
                        {gameConfig.difficulty}
                      </span>
                    </div>
                    {game.turn() === botColor && (
                      <div className="flex items-center space-x-1 text-yellow-400 text-xs">
                        <Brain className="w-3 h-3" />
                        <span>{isBotThinking ? 'Thinking...' : "Bot's turn"}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* User Card */}
              <div className={`bg-gradient-to-br from-yellow-400/10 to-black/30 rounded-xl p-4 border-2 transition-all duration-300 ${
                game.turn() === playerColor ? 'border-green-400 bg-green-400/10' : 'border-gray-600'
              }`}>
                <div className="flex items-center space-x-3">
                  <img src={profile.avatar_url || '/assets/solxclash_logo.svg'} alt="User" className="w-12 h-12 rounded-full" />
                  <div className="flex-1">
                    <span className="text-white font-semibold block">{profile.username}</span>
                    {game.turn() === playerColor && (
                      <span className="text-green-400 text-xs">Your turn</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Game Controls - Desktop */}
            <div className="space-y-3">
              {isGameActive ? (
                <button
                  onClick={handleResign}
                  className="w-full bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-400 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Flag className="w-5 h-5" />
                  <span>Resign</span>
                </button>
              ) : (
                <button
                  onClick={onBackToSetup}
                  className="w-full bg-yellow-400 text-black px-4 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  <span>Back to Setup</span>
                </button>
              )}
            </div>
          </div>

          {/* Center - Chessboard (Mobile-First) */}
          <div className="flex-1 flex flex-col items-center">
            {/* Turn Indicator - Mobile Only */}
            <div className="lg:hidden w-full max-w-sm mb-4">
              <div className="bg-gradient-to-r from-gray-800/80 to-black/60 rounded-lg p-3 border border-yellow-400/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {game.turn() === playerColor ? (
                      <>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-green-400 font-semibold">Your Turn</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                        <span className="text-yellow-400 font-semibold">
                          {isBotThinking ? 'Bot Thinking...' : "Bot's Turn"}
                        </span>
                      </>
                    )}
                  </div>
                  {game.isCheck() && (
                    <div className="flex items-center space-x-1 text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">Check!</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="w-full max-w-lg bg-gradient-to-br from-yellow-400/10 to-black/30 rounded-2xl shadow-2xl p-2 sm:p-4 mb-4">
              <Chessboard
                position={fen}
                onSquareClick={handleSquareClick}
                customSquareStyles={customSquareStyles}
                boardWidth={getBoardWidth()}
                customDarkSquareStyle={{ backgroundColor: BOARD_COLORS.dark, boxShadow: 'inset 0 2px 8px #00000044' }}
                customLightSquareStyle={{ backgroundColor: BOARD_COLORS.light, boxShadow: 'inset 0 2px 8px #00000022' }}
                arePiecesDraggable={false}
                animationDuration={300}
                boardOrientation={gameConfig.playerColor}
                id="chessclash-board"
              />
            </div>
          </div>

          {/* Desktop Right Sidebar - Hidden on mobile */}
          <div className="hidden lg:block w-80 space-y-6">
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
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative ml-auto w-80 max-w-[85vw] bg-gradient-to-br from-gray-900 to-black border-l border-yellow-400/20 h-full overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-yellow-400 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Game Menu
                </h2>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-800 transition-colors"
                >
                  <CloseIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Match Info */}
              <div className="bg-gradient-to-br from-gray-800/80 to-black/60 rounded-xl p-4 border border-yellow-400/20">
                <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center">
                  <Info className="w-5 h-5 mr-2" />
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

              {/* Game Stats */}
              <div className="bg-gradient-to-br from-gray-800/80 to-black/60 rounded-xl p-4 border border-yellow-400/20">
                <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
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
              <div className="bg-gradient-to-br from-gray-800/80 to-black/60 rounded-xl p-4 border border-yellow-400/20">
                <h3 className="text-lg font-bold text-yellow-400 mb-3 flex items-center">
                  <History className="w-5 h-5 mr-2" />
                  Move History
                </h3>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {moveHistory.length === 0 ? (
                    <span className="text-gray-400 text-sm">No moves yet.</span>
                  ) : (
                    moveHistory.map((move, i) => (
                      <div key={i} className="flex items-center justify-between bg-gray-700/50 rounded px-2 py-1">
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
                {isGameActive ? (
                  <button
                    onClick={handleResign}
                    className="w-full bg-red-500 text-white px-4 py-3 rounded-lg font-semibold hover:bg-red-400 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <Flag className="w-5 h-5" />
                    <span>Resign Game</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setIsSidebarOpen(false);
                      onBackToSetup();
                    }}
                    className="w-full bg-yellow-400 text-black px-4 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Setup</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Result Popup */}
      {showResultPopup && result && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 border-2 border-yellow-400 rounded-2xl p-8 max-w-md w-full text-center animate-in zoom-in-95 duration-300">
            <h3 className={`text-2xl font-bold mb-2 ${result.type === 'win' ? 'text-green-400' : result.type === 'draw' ? 'text-yellow-400' : 'text-red-400'}`}>{
              result.type === 'win' ? '🏆 You Win!' : result.type === 'draw' ? '🤝 Draw' : result.type === 'lose' ? '😞 You Lose' : 'Game Over'
            }</h3>
            <p className="text-gray-300 mb-4">{result.message}</p>
            <div className="flex flex-col gap-3 mt-6">
              <button
                className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onClick={() => navigate('/')}
                aria-label="Go to Home Page"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => { if (e.key === 'Enter' || e.key === ' ') navigate('/'); }}
              >
                Go to Home Page
              </button>
              <button
                className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                onClick={() => { setShowResultPopup(false); }}
                aria-label="Close Result Popup"
                tabIndex={0}
                onKeyDown={(e: React.KeyboardEvent<HTMLButtonElement>) => { if (e.key === 'Enter' || e.key === ' ') { setShowResultPopup(false); } }}
              >
                Close
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
            <p className="text-gray-300 mb-6">Are you sure you want to resign? You will lose your invested XP and be taken to the home page.</p>
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