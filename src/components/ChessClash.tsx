import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Zap, CheckCircle, AlertCircle, RotateCcw, Settings, X as CloseIcon, Clock, User as UserIcon, Cpu, Brain, Target, Trophy, ArrowLeft, Home, Flag, Menu, BarChart3, History, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from './AuthProvider';
import { useNavigate } from 'react-router-dom';
import { createChessAI } from '../lib/chessAI';

const BOARD_COLORS = {
  light: '#f7fafc', // modern off-white
  dark: '#23272f', // modern dark/blue-gray
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
  const [gameTime, setGameTime] = useState(600); // 10 minutes total
  const [lastMove, setLastMove] = useState(null);
  const [gameStats, setGameStats] = useState({ captures: 0, checks: 0 });
  const [currentGameId, setCurrentGameId] = useState(null);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const navigate = useNavigate();
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const chessAI = useRef(createChessAI(gameConfig.difficulty));
  const botMoveTimeoutRef = useRef(null);

  // Determine player and bot colors
  const playerColor = gameConfig.playerColor === 'white' ? 'w' : 'b';
  const botColor = gameConfig.playerColor === 'white' ? 'b' : 'w';

  console.log(`🎮 ChessClash initialized:`);
  console.log(`  Player color: ${playerColor} (${gameConfig.playerColor})`);
  console.log(`  Bot color: ${botColor}`);
  console.log(`  Difficulty: ${gameConfig.difficulty}`);
  console.log(`  XP Cost: ${gameConfig.xpCost}`);

  // Initialize game and create database entry
  useEffect(() => {
    console.log(`🚀 ChessClash useEffect: initializing game...`);
    initializeGame();
    
    // Cleanup function
    return () => {
      console.log(`🧹 ChessClash cleanup: clearing bot timeout`);
      if (botMoveTimeoutRef.current) {
        clearTimeout(botMoveTimeoutRef.current);
      }
    };
  }, []);

  // Game timer effect
  useEffect(() => {
    if (!isGameActive || result) return;
    
    const id = setInterval(() => {
      setGameTime((t) => {
        if (t <= 1) {
          console.log(`⏰ Game timeout!`);
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

  // Game end detection and bot move triggering
  useEffect(() => {
    console.log(`🔄 ChessClash game state effect triggered:`);
    console.log(`  FEN: ${fen}`);
    console.log(`  Current turn: ${game.turn()}`);
    console.log(`  Game over: ${game.isGameOver()}`);
    console.log(`  Is game active: ${isGameActive}`);
    console.log(`  Bot thinking: ${isBotThinking}`);
    console.log(`  Result: ${result ? result.type : 'none'}`);

    if (!isGameActive) {
      console.log(`❌ Game not active, skipping game state logic`);
      return;
    }

    if (game.isGameOver()) {
      console.log(`🏁 Game over detected!`);
      let type = 'draw';
      let message = 'Draw! Your XP is refunded.';
      
      if (game.isCheckmate()) {
        if (game.turn() !== playerColor) {
          type = 'win';
          message = 'Checkmate! You win!';
          console.log(`🎉 Player wins by checkmate!`);
        } else {
          type = 'lose';
          message = 'Checkmate! You lose.';
          console.log(`😞 Player loses by checkmate!`);
        }
      } else if (game.isDraw()) {
        type = 'draw';
        message = 'Draw! Your XP is refunded.';
        console.log(`🤝 Game ended in draw`);
      }
      
      setResult({ type, message });
      setIsGameActive(false);
      if (intervalId) clearInterval(intervalId);
      handleGameEnd(type);
      return;
    }

    // Trigger bot move if it's bot's turn
    if (game.turn() === botColor && !isBotThinking && !result) {
      console.log(`🤖 Bot's turn detected, triggering bot move...`);
      makeBotMove();
    } else {
      console.log(`👤 Player's turn or bot already thinking`);
    }
  }, [fen, isGameActive, playerColor, botColor, isBotThinking, result]);

  const initializeGame = async () => {
    console.log(`🎯 Initializing game...`);
    try {
      setIsProcessing(true);
      
      // Deduct XP cost first (simplified for testing)
      setXpState(prev => prev - gameConfig.xpCost);
      console.log(`💰 XP deducted: ${gameConfig.xpCost}, new XP: ${profile.xp - gameConfig.xpCost}`);

      // If player is black, bot makes first move
      if (gameConfig.playerColor === 'black') {
        console.log(`⚫ Player is black, bot will move first after delay`);
        setTimeout(() => {
          console.log(`🤖 Triggering initial bot move...`);
          makeBotMove();
        }, 1000);
      } else {
        console.log(`⚪ Player is white, waiting for player's first move`);
      }
    } catch (err) {
      console.error('❌ Failed to initialize game:', err);
      setError('Failed to initialize game. Please try again.');
      setXpState(prev => prev + gameConfig.xpCost);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGameEnd = async (type) => {
    console.log(`🏁 Game ended with type: ${type}`);
    
    // Clear any pending bot moves
    if (botMoveTimeoutRef.current) {
      console.log(`🧹 Clearing pending bot move timeout`);
      clearTimeout(botMoveTimeoutRef.current);
    }
    
    setIsBotThinking(false);

    setIsProcessing(true);
    setError(null);
    
    let xpChange = 0;
    let gameResult = 'lose';
    
    if (type === 'win') {
      xpChange = gameConfig.difficulty === 'easy' ? 40 : gameConfig.difficulty === 'medium' ? 60 : 100;
      gameResult = 'win';
    } else if (type === 'draw') {
      xpChange = gameConfig.xpCost; // refund
      gameResult = 'draw';
    } else if (type === 'lose' || type === 'timeout') {
      xpChange = 0;
      gameResult = 'lose';
    }

    console.log(`💰 XP change: ${xpChange}, Game result: ${gameResult}`);

    try {
      setXpState(prev => prev + xpChange);
      console.log(`✅ Game end handled successfully`);
    } catch (error) {
      console.error('❌ Failed to complete game:', error);
      setError('Failed to complete game. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const makeBotMove = () => {
    console.log(`🤖 makeBotMove called`);
    console.log(`  Game over: ${game.isGameOver()}`);
    console.log(`  Current turn: ${game.turn()}`);
    console.log(`  Bot color: ${botColor}`);
    console.log(`  Bot thinking: ${isBotThinking}`);

    if (game.isGameOver()) {
      console.log(`❌ Game is over, bot cannot move`);
      return;
    }

    if (game.turn() !== botColor) {
      console.log(`❌ Not bot's turn (current: ${game.turn()}, bot: ${botColor})`);
      return;
    }

    if (isBotThinking) {
      console.log(`❌ Bot is already thinking`);
      return;
    }
    
    console.log(`✅ Bot move conditions met, starting calculation...`);
    setIsBotThinking(true);
    
    // Clear any existing timeout
    if (botMoveTimeoutRef.current) {
      console.log(`🧹 Clearing existing bot timeout`);
      clearTimeout(botMoveTimeoutRef.current);
    }

    const thinkingTime = 1500 + Math.random() * 1500; // 1.5-3 second thinking time
    console.log(`⏱️ Bot will think for ${Math.round(thinkingTime)}ms`);

    botMoveTimeoutRef.current = setTimeout(() => {
      console.log(`🧠 Bot calculation timeout triggered`);
      
      try {
        console.log(`🎯 Calling chessAI.getBestMove...`);
        const bestMove = chessAI.current.getBestMove(game);
        console.log(`🎲 Bot calculated move: ${bestMove}`);
        
        if (bestMove && !game.isGameOver()) {
          console.log(`✅ Executing bot move: ${bestMove}`);
          const newGame = new Chess(game.fen());
          const moveObj = newGame.move(bestMove);
          
          if (moveObj) {
            console.log(`✅ Bot move executed successfully:`, moveObj);
            setGame(newGame);
            setFen(newGame.fen());
            setMoveHistory(h => [...h, moveObj.san]);
            setLastMove({ from: moveObj.from, to: moveObj.to });
            
            if (moveObj.captured) {
              console.log(`🎯 Bot captured: ${moveObj.captured}`);
              setGameStats(prev => ({ ...prev, captures: prev.captures + 1 }));
            }
            if (newGame.isCheck()) {
              console.log(`👑 Bot gave check!`);
              setGameStats(prev => ({ ...prev, checks: prev.checks + 1 }));
            }
          } else {
            console.error(`❌ Bot move failed to execute: ${bestMove}`);
          }
        } else {
          console.log(`❌ No valid bot move found or game is over`);
          console.log(`  bestMove: ${bestMove}`);
          console.log(`  gameOver: ${game.isGameOver()}`);
        }
      } catch (error) {
        console.error('❌ Error in bot move calculation:', error);
      } finally {
        console.log(`🏁 Bot thinking complete, setting isBotThinking to false`);
        setIsBotThinking(false);
      }
    }, thinkingTime);
  };

  const handleSquareClick = (square) => {
    console.log(`🖱️ Square clicked: ${square}`);
    console.log(`  Game active: ${isGameActive}`);
    console.log(`  Current turn: ${game.turn()}`);
    console.log(`  Player color: ${playerColor}`);
    console.log(`  Bot thinking: ${isBotThinking}`);

    if (!isGameActive || game.turn() !== playerColor || isBotThinking) {
      console.log(`❌ Player move not allowed`);
      return;
    }
    
    // If a square is selected and this click is on a legal move target
    if (selectedSquare && legalMoves.includes(square)) {
      console.log(`🎯 Executing player move: ${selectedSquare} -> ${square}`);
      const newGame = new Chess(game.fen());
      
      try {
        const moveObj = newGame.move({ 
          from: selectedSquare, 
          to: square, 
          promotion: 'q' // Auto-promote to queen
        });
        
        if (moveObj) {
          console.log(`✅ Player move executed successfully:`, moveObj);
          setGame(newGame);
          setFen(newGame.fen());
          setMoveHistory(h => [...h, moveObj.san]);
          setLastMove({ from: moveObj.from, to: moveObj.to });
          setSelectedSquare(null);
          setLegalMoves([]);
          
          if (moveObj.captured) {
            console.log(`🎯 Player captured: ${moveObj.captured}`);
            setGameStats(prev => ({ ...prev, captures: prev.captures + 1 }));
          }
          if (newGame.isCheck()) {
            console.log(`👑 Player gave check!`);
            setGameStats(prev => ({ ...prev, checks: prev.checks + 1 }));
          }
          
          // The useEffect will handle triggering the bot move
          console.log(`🔄 Player move complete, useEffect will trigger bot move`);
        } else {
          console.error(`❌ Player move failed to execute: ${selectedSquare} -> ${square}`);
        }
      } catch (error) {
        console.error('❌ Error making player move:', error);
        setSelectedSquare(null);
        setLegalMoves([]);
      }
      return;
    }
    
    // Select a piece if it belongs to the current player
    const piece = game.get(square);
    if (piece && piece.color === playerColor) {
      const moves = game.moves({ square, verbose: true });
      console.log(`🎯 Piece selected: ${square} (${piece.type}), Legal moves: ${moves.length}`);
      
      if (moves.length > 0) {
        setSelectedSquare(square);
        setLegalMoves(moves.map((m) => m.to));
      } else {
        console.log(`❌ No legal moves for piece on ${square}`);
        setSelectedSquare(null);
        setLegalMoves([]);
      }
    } else {
      // Deselect if clicking on empty square or opponent piece
      console.log(`🔄 Deselecting (empty square or opponent piece)`);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  const handleResign = () => {
    console.log(`🏳️ Player wants to resign`);
    setShowResignConfirm(true);
    setIsSidebarOpen(false);
  };
  
  const confirmResign = () => {
    console.log(`✅ Player confirmed resignation`);
    setShowResignConfirm(false);
    setResult({ type: 'lose', message: 'You resigned. You lose.' });
    setIsGameActive(false);
    if (intervalId) clearInterval(intervalId);
    handleGameEnd('lose');
  };
  
  const cancelResign = () => {
    console.log(`❌ Player cancelled resignation`);
    setShowResignConfirm(false);
  };

  const customSquareStyles = useMemo(() => {
    const styles = {};
    
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

  const formatTime = (t) => `${Math.floor(t/60)}:${(t%60).toString().padStart(2,'0')}`;

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

  const getBoardWidth = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) {
      return Math.min(screenWidth - 32, 360);
    } else if (screenWidth < 1024) {
      return 400;
    } else {
      return 480;
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 to-black">
      {/* Debug Info */}
      <div className="bg-gray-800 text-white p-2 text-xs font-mono">
        Turn: {game.turn()} | Player: {playerColor} | Bot: {botColor} | Bot Thinking: {isBotThinking ? 'Yes' : 'No'} | Game Over: {game.isGameOver() ? 'Yes' : 'No'} | Moves: {game.moves().length}
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden bg-gradient-to-r from-gray-900/80 to-black/60 border-b border-yellow-400/20 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToSetup}
            className="p-2 rounded-lg bg-gray-800/50 text-yellow-400 hover:bg-yellow-400/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
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
          
          {/* Desktop Left Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
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

          {/* Center - Chessboard */}
          <div className="flex-1 flex flex-col items-center">
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

          {/* Desktop Right Sidebar */}
          <div className="hidden lg:block w-80 space-y-6">
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
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          
          <div className="relative ml-auto w-80 max-w-[85vw] bg-gradient-to-br from-gray-900 to-black border-l border-yellow-400/20 h-full overflow-y-auto">
            <div className="p-6 space-y-6">
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

      {/* Result Modal */}
      {result && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 border border-yellow-400/20 rounded-2xl p-8 w-full max-w-md text-center shadow-2xl relative">
            <button
              onClick={() => setResult(null)}
              className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-yellow-400 hover:bg-gray-800 transition-colors"
            >
              <CloseIcon className="w-5 h-5" />
            </button>

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
                Play New Game
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
            <p className="text-gray-300 mb-6">Are you sure you want to resign? You will lose your invested XP and the game will end immediately.</p>
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