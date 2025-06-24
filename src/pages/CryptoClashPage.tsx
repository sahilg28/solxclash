import React, { useState, useEffect, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { 
  TrendingUp, Clock, Trophy, Zap, Target, Users, 
  Play, Pause, RotateCcw, AlertCircle, CheckCircle,
  Wifi, WifiOff, Activity, DollarSign, Flame, Star, LogIn, Coins
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuthContext } from '../components/AuthProvider';
import { binancePriceService, PriceUpdate, CoinSymbol, formatPrice, formatPriceChange, getPriceChangeColor } from '../lib/binancePriceService';
import { gameLogicService, GameState } from '../lib/gameLogic';
import TradingViewChart from '../components/TradingViewChart';
import AuthButtons from '../components/AuthButtons';
import Header from '../components/Header';
import Footer from '../components/Footer';

const CryptoClashPage = () => {
  const { user, profile, loading, refreshSessionAndProfile } = useAuthContext();
  const [gameState, setGameState] = useState<GameState>({
    currentRound: null,
    userPrediction: null,
    timeLeft: 0,
    phase: 'waiting'
  });
  const [priceData, setPriceData] = useState<Map<CoinSymbol, PriceUpdate>>(new Map());
  const [selectedCoin, setSelectedCoin] = useState<CoinSymbol>('BTC'); // User's choice for chart viewing and prediction
  const [selectedXpBet, setSelectedXpBet] = useState<number>(10); // XP bet amount
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [cancelledRoundDisplayMessage, setCancelledRoundDisplayMessage] = useState<string | null>(null);
  const [roundResults, setRoundResults] = useState<{
    show: boolean;
    isCorrect: boolean | null;
    priceDirection: string | null;
    predictedPrice: number | null;
    endPrice: number | null;
    xpEarned: number;
  }>({
    show: false,
    isCorrect: null,
    priceDirection: null,
    predictedPrice: null,
    endPrice: null,
    xpEarned: 0
  });

  // Cryptocurrency options with TradingView symbols
  const cryptoOptions = [
    { symbol: 'BTC' as CoinSymbol, name: 'Bitcoin', tvSymbol: 'BINANCE:BTCUSDT', color: 'text-orange-400' },
    { symbol: 'ETH' as CoinSymbol, name: 'Ethereum', tvSymbol: 'BINANCE:ETHUSDT', color: 'text-blue-400' },
    { symbol: 'SOL' as CoinSymbol, name: 'Solana', tvSymbol: 'BINANCE:SOLUSDT', color: 'text-purple-400' },
    { symbol: 'BNB' as CoinSymbol, name: 'BNB', tvSymbol: 'BINANCE:BNBUSDT', color: 'text-yellow-500' },
    { symbol: 'XRP' as CoinSymbol, name: 'XRP', tvSymbol: 'BINANCE:XRPUSDT', color: 'text-blue-500' }
  ];

  // XP bet options
  const xpBetOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  // Initialize price service and game logic
  useEffect(() => {
    console.log('🎮 Initializing CryptoClash page...');
    
    // Subscribe to price updates
    const priceSubscriptionId = binancePriceService.subscribe((update: PriceUpdate) => {
      setPriceData(prev => new Map(prev.set(update.symbol, update)));
      
      // Update connection status based on price service health
      setConnectionStatus(binancePriceService.isConnectionHealthy() ? 'connected' : 'disconnected');
    });

    // Subscribe to game state updates
    const gameUnsubscribe = gameLogicService.subscribe((state: GameState) => {
      console.log('🎮 [DEBUG] CryptoClashPage: Received game state update:', {
        currentRound: state.currentRound ? {
          id: state.currentRound.id,
          round_number: state.currentRound.round_number,
          status: state.currentRound.status,
          selected_coin: state.currentRound.selected_coin,
          price_direction: state.currentRound.price_direction,
          start_price: state.currentRound.start_price,
          end_price: state.currentRound.end_price
        } : null,
        userPrediction: state.userPrediction ? {
          id: state.userPrediction.id,
          prediction: state.userPrediction.prediction,
          is_correct: state.userPrediction.is_correct,
          xp_earned: state.userPrediction.xp_earned,
          xp_bet: state.userPrediction.xp_bet
        } : null,
        phase: state.phase,
        timeLeft: state.timeLeft
      });

      setGameState(state);

      // Handle cancelled round display message
      if (state.currentRound?.status === 'cancelled') {
        setCancelledRoundDisplayMessage("No players participated and the round was cancelled. A new round is starting!");
      } else if (state.currentRound?.status === 'waiting') {
        // Clear cancelled message when new round starts
        setCancelledRoundDisplayMessage(null);
      }

      // Show results when round is completed and user had a prediction
      if (state.currentRound?.status === 'completed' && state.userPrediction) {
        console.log('🎮 [DEBUG] CryptoClashPage: Round completed, showing results:', {
          isCorrect: state.userPrediction.is_correct,
          priceDirection: state.currentRound.price_direction,
          predictedPrice: state.userPrediction.predicted_price,
          endPrice: state.currentRound.end_price,
          xpEarned: state.userPrediction.xp_earned
        });

        setRoundResults({
          show: true,
          isCorrect: state.userPrediction.is_correct,
          priceDirection: state.currentRound.price_direction,
          predictedPrice: state.userPrediction.predicted_price || null,
          endPrice: state.currentRound.end_price,
          xpEarned: state.userPrediction.xp_earned || 0
        });

        // Show toast notification
        if (state.userPrediction.is_correct) {
          toast.success(`🎉 Correct prediction! +${state.userPrediction.xp_earned} XP earned!`, {
            position: "top-right",
            autoClose: 5000,
          });
        } else {
          toast.error(`😔 Wrong prediction. Better luck next time!`, {
            position: "top-right",
            autoClose: 5000,
          });
        }

        // Refresh profile to get updated XP
        console.log('🎮 [DEBUG] CryptoClashPage: Refreshing user profile after round completion...');
        refreshSessionAndProfile().then(() => {
          console.log('🎮 [DEBUG] CryptoClashPage: Profile refreshed successfully');
        }).catch((error) => {
          console.error('🎮 [DEBUG] CryptoClashPage: Error refreshing profile:', error);
        });

        // Hide results after 10 seconds
        setTimeout(() => {
          console.log('🎮 [DEBUG] CryptoClashPage: Hiding round results after timeout');
          setRoundResults(prev => ({ ...prev, show: false }));
        }, 10000);
      }
    });

    // Set initial connection status
    setConnectionStatus(binancePriceService.isConnectionHealthy() ? 'connected' : 'connecting');

    return () => {
      binancePriceService.unsubscribe(priceSubscriptionId);
      gameUnsubscribe();
    };
  }, []);

  // Initialize game logic when authentication is ready
  useEffect(() => {
    if (!loading && user && profile) {
      gameLogicService.initializeGameState();
    }
  }, [loading, user, profile]);

  // Load user prediction for current round
  useEffect(() => {
    if (gameState.currentRound && user && !gameState.userPrediction) {
      gameLogicService.getUserPrediction(gameState.currentRound.id, user.id);
    }
  }, [gameState.currentRound, user]);

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show anonymous user access page if not authenticated
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Minimal CTA */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8">
              <div className="mb-6">
                <LogIn className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-white mb-4">
                  Ready to play <span className="text-yellow-400">CryptoClash?</span>
                </h1>
                <p className="text-gray-300 mb-6">
                  Get <span className="text-yellow-400 font-semibold">100 XP bonus</span> on signup and start competing!
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Sign up first to play CryptoClash!
                </p>
              </div>
              <div className="items-center justify-center">
                <AuthButtons />
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    );
  }

  const makePrediction = async (direction: 'up' | 'down') => {
    if (!gameState.currentRound || gameState.userPrediction) {
      return;
    }

    // Only allow predictions during waiting phase
    if (gameState.currentRound.status !== 'waiting') {
      setError('Predictions can only be made during the lobby phase');
      toast.error('Predictions can only be made during the lobby phase', {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    try {
      setError(null);
      const result = await gameLogicService.makePrediction(direction, user.id, selectedCoin, selectedXpBet);
      
      // Show success toast
      toast.success(`Prediction "${direction.toUpperCase()}" locked in for ${selectedCoin}! ${selectedXpBet} XP invested.`, {
        position: "top-right",
        autoClose: 3000,
      });

      // Show daily streak reward if applicable
      if (result && 'streakReward' in result && result.streakReward > 0) {
        toast.success(`🔥 Daily play streak! +${result.streakReward} XP bonus!`, {
          position: "top-right",
          autoClose: 5000,
        });
      }
      
      // Refresh profile to show updated XP
      await refreshSessionAndProfile();
      
    } catch (err) {
      console.error('Failed to make prediction:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit prediction';
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  };

  const getCurrentPrice = (symbol: CoinSymbol) => {
    const price = priceData.get(symbol);
    return price ? price.price : 0;
  };

  const getCurrentPriceData = (symbol: CoinSymbol) => {
    return priceData.get(symbol);
  };

  const selectedCoinData = cryptoOptions.find(coin => coin.symbol === selectedCoin);
  const currentPrice = getCurrentPriceData(selectedCoin);

  const formatTimeLeft = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseDisplay = () => {
    switch (gameState.phase) {
      case 'waiting':
        return {
          title: 'Lobby Phase',
          subtitle: 'Choose your coin and make your prediction!',
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          borderColor: 'border-blue-400/30'
        };
      case 'predicting':
        return {
          title: 'Prediction Window',
          subtitle: 'Predictions locked - watching price movement!',
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          borderColor: 'border-green-400/30'
        };
      case 'resolving':
        return {
          title: 'Calculating Results',
          subtitle: 'Determining winners...',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          borderColor: 'border-yellow-400/30'
        };
      case 'completed':
        return {
          title: 'Round Complete',
          subtitle: 'Check your results!',
          color: 'text-purple-400',
          bgColor: 'bg-purple-400/10',
          borderColor: 'border-purple-400/30'
        };
      default:
        return {
          title: 'Loading...',
          subtitle: 'Connecting to game...',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          borderColor: 'border-gray-400/30'
        };
    }
  };

  const phaseDisplay = getPhaseDisplay();

  // Helper function to determine what coin to display for the round
  const getDisplayedRoundCoin = () => {
    if (!gameState.currentRound) return 'Select Coin';
    
    // If round coin is null (not yet selected), show "Select Coin"
    if (gameState.currentRound.selected_coin === null) {
      return 'Select Coin';
    }
    
    // Otherwise, show the actual locked round coin
    return gameState.currentRound.selected_coin;
  };

  const displayedRoundCoin = getDisplayedRoundCoin();
  const isRoundCoinLocked = gameState.currentRound?.selected_coin !== null;

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              <span className="text-yellow-400">Crypto</span>Clash
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              Skill-based crypto prediction game. Choose your coin, predict price movements, and earn XP rewards!
            </p>
            
            {/* Connection Status */}
            <div className="flex items-center justify-center space-x-2 mb-4">
              {connectionStatus === 'connected' ? (
                <>
                  <Wifi className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 text-sm">Live Binance Data Connected</span>
                </>
              ) : connectionStatus === 'connecting' ? (
                <>
                  <Activity className="w-5 h-5 text-yellow-400 animate-pulse" />
                  <span className="text-yellow-400 text-sm">Connecting to Binance...</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">Using Demo Data</span>
                </>
              )}
            </div>
          </div>

          {/* Round Results Modal */}
          {roundResults.show && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className={`bg-gradient-to-br from-gray-900 to-black border-2 rounded-2xl p-8 max-w-md w-full text-center transform animate-in zoom-in-95 duration-300 ${
                roundResults.isCorrect ? 'border-green-400/50' : 'border-red-400/50'
              }`}>
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  roundResults.isCorrect ? 'bg-green-400/20' : 'bg-red-400/20'
                }`}>
                  {roundResults.isCorrect ? (
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  ) : (
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  )}
                </div>
                
                <h3 className={`text-2xl font-bold mb-2 ${
                  roundResults.isCorrect ? 'text-green-400' : 'text-red-400'
                }`}>
                  {roundResults.isCorrect ? '🎉 Correct Prediction!' : '😔 Wrong Prediction'}
                </h3>
                
                <p className="text-gray-300 mb-4">
                  Price went <span className="font-bold text-yellow-400">
                    {roundResults.priceDirection?.toUpperCase()}
                  </span>
                </p>
                
                {roundResults.predictedPrice && roundResults.endPrice && (
                  <div className="bg-black/50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Your Prediction Price:</span>
                      <span className="text-white font-semibold">
                        {formatPrice(roundResults.predictedPrice, selectedCoin)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-400">Final Price:</span>
                      <span className="text-white font-semibold">
                        {formatPrice(roundResults.endPrice, selectedCoin)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-2">
                      <span className="text-gray-400">Price Change:</span>
                      <span className={`font-semibold ${
                        roundResults.endPrice > roundResults.predictedPrice ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {roundResults.endPrice > roundResults.predictedPrice ? '+' : ''}
                        {formatPrice(roundResults.endPrice - roundResults.predictedPrice, selectedCoin)}
                      </span>
                    </div>
                  </div>
                )}
                
                <div className={`text-lg font-bold flex items-center justify-center space-x-2 ${
                  roundResults.isCorrect ? 'text-green-400' : 'text-gray-400'
                }`}>
                  <Zap className="w-5 h-5" />
                  <span>+{roundResults.xpEarned} XP Earned</span>
                </div>
                
                <button
                  onClick={() => setRoundResults(prev => ({ ...prev, show: false }))}
                  className="mt-6 bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200"
                >
                  Continue Playing
                </button>
              </div>
            </div>
          )}

          {/* User Stats Bar */}
          <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-xl p-4 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || profile.username}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                      <span className="text-yellow-400 font-bold">
                        {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="font-semibold text-white">{profile.full_name || profile.username}</div>
                    <div className="text-sm text-gray-400">Level {Math.floor(profile.xp / 1000) + 1}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="flex items-center space-x-1">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-white font-semibold">{profile.xp}</span>
                    <span className="text-gray-400">XP</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Trophy className="w-4 h-4 text-green-400" />
                    <span className="text-white font-semibold">{profile.wins}</span>
                    <span className="text-gray-400">Wins</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-semibold">{profile.games_played}</span>
                    <span className="text-gray-400">Games</span>
                  </div>
                  {profile.daily_play_streak > 0 && (
                    <div className="flex items-center space-x-1">
                      <span className="text-red-400 text-lg">🔥</span>
                      <span className="text-white font-semibold">{profile.daily_play_streak}</span>
                      <span className="text-gray-400">Daily</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-400">Win Rate</div>
                <div className="text-lg font-bold text-green-400">
                  {profile.games_played > 0 ? Math.round((profile.wins / profile.games_played) * 100) : 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Game Round Info */}
          {gameState.currentRound && (
            <div className={`bg-gradient-to-r ${phaseDisplay.bgColor} border ${phaseDisplay.borderColor} rounded-xl p-6 mb-8`}>
              {/* Show cancelled round message if applicable */}
              {gameState.currentRound.status === 'cancelled' && cancelledRoundDisplayMessage ? (
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Round #{gameState.currentRound.round_number} - Cancelled
                  </h3>
                  <p className="text-gray-300">{cancelledRoundDisplayMessage}</p>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Round #{gameState.currentRound.round_number}
                    </h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-300">
                      <span>
                        Round Coin: <span className="text-yellow-400 font-semibold">{displayedRoundCoin}</span>
                        {!isRoundCoinLocked && displayedRoundCoin === 'Select Coin' && (
                          <span className="text-gray-500 text-xs ml-1">(choose below)</span>
                        )}
                      </span>
                      <span>•</span>
                      <span className={phaseDisplay.color}>{phaseDisplay.title}</span>
                      {gameState.currentRound.start_price && gameState.phase === 'predicting' && gameState.currentRound.selected_coin && (
                        <>
                          <span>•</span>
                          <span className="text-yellow-400">
                            Start: {formatPrice(gameState.currentRound.start_price, gameState.currentRound.selected_coin)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white mb-1">
                      {formatTimeLeft(gameState.timeLeft)}
                    </div>
                    <div className="text-sm text-gray-400">{phaseDisplay.subtitle}</div>
                  </div>
                </div>
              )}
              
              {/* Progress Bar - only show for non-cancelled rounds */}
              {gameState.currentRound.status !== 'cancelled' && (
                <div className="w-full bg-gray-700 rounded-full h-2 mt-4">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      gameState.phase === 'predicting' ? 'bg-green-400' : 
                      gameState.phase === 'waiting' ? 'bg-blue-400' : 
                      gameState.phase === 'resolving' ? 'bg-yellow-400' : 'bg-purple-400'
                    }`}
                    style={{ 
                      width: `${gameState.phase === 'predicting' ? (gameState.timeLeft / 60) * 100 : 
                               gameState.phase === 'waiting' ? (gameState.timeLeft / 240) * 100 : 
                               gameState.phase === 'resolving' ? (gameState.timeLeft / 10) * 100 : 100}%` 
                    }}
                  ></div>
                </div>
              )}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Chart Section */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl overflow-hidden">
                {/* Chart Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Live Chart</h2>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full animate-pulse ${
                        connectionStatus === 'connected' ? 'bg-green-400' : 'bg-yellow-400'
                      }`}></div>
                      <span className={`text-sm ${
                        connectionStatus === 'connected' ? 'text-green-400' : 'text-yellow-400'
                      }`}>
                        {connectionStatus === 'connected' ? 'Live' : 'Demo'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Coin Selector - Free selection for chart viewing and prediction */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {cryptoOptions.map((coin) => (
                      <button
                        key={coin.symbol}
                        onClick={() => setSelectedCoin(coin.symbol)}
                        className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                          selectedCoin === coin.symbol
                            ? 'bg-yellow-400 text-black'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        <span className={selectedCoin === coin.symbol ? 'text-black' : coin.color}>
                          {coin.symbol}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Current Price Display */}
                  {currentPrice && (
                    <div className="bg-black/30 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm text-gray-400">{selectedCoinData?.name}</div>
                          <div className="text-2xl font-bold text-white">
                            {formatPrice(currentPrice.price, selectedCoin)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-semibold ${getPriceChangeColor(currentPrice.changePercent24h)}`}>
                            {formatPriceChange(currentPrice.changePercent24h, true)}
                          </div>
                          <div className="text-sm text-gray-400">24h Change</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chart Container */}
                <div className="h-96 lg:h-[500px]">
                  <TradingViewChart
                    symbol={selectedCoinData?.tvSymbol || 'BINANCE:BTCUSDT'}
                    theme="dark"
                    interval="1"
                    allowSymbolChange={false}
                    saveImage={false}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Game Hub Panel */}
            <div className="space-y-6">
              {/* Dynamic Game Hub */}
              <div className={`bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-2 rounded-2xl p-6 transition-all duration-500 ${phaseDisplay.borderColor}`}>
                <div className="text-center mb-6">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full mb-4 ${phaseDisplay.bgColor} ${phaseDisplay.borderColor} border`}>
                    <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                      gameState.phase === 'predicting' ? 'bg-green-400' : 
                      gameState.phase === 'waiting' ? 'bg-blue-400' : 
                      gameState.phase === 'resolving' ? 'bg-yellow-400' : 'bg-purple-400'
                    }`}></div>
                    <span className={`text-sm font-medium ${phaseDisplay.color}`}>
                      {phaseDisplay.title}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    {selectedCoin} Prediction
                  </h3>
                  
                  {/* Show current price for the SELECTED coin */}
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {getCurrentPriceData(selectedCoin) ? 
                      formatPrice(getCurrentPriceData(selectedCoin)!.price, selectedCoin) :
                      'Loading...'
                    }
                  </div>
                </div>

                {/* Timer */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">
                    {formatTimeLeft(gameState.timeLeft)}
                  </div>
                  <div className={`text-sm ${phaseDisplay.color}`}>
                    {phaseDisplay.subtitle}
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${
                        gameState.phase === 'predicting' ? 'bg-green-400' : 
                        gameState.phase === 'waiting' ? 'bg-blue-400' : 
                        gameState.phase === 'resolving' ? 'bg-yellow-400' : 'bg-purple-400'
                      }`}
                      style={{ 
                        width: `${gameState.phase === 'predicting' ? (gameState.timeLeft / 60) * 100 : 
                                 gameState.phase === 'waiting' ? (gameState.timeLeft / 240) * 100 : 
                                 gameState.phase === 'resolving' ? (gameState.timeLeft / 10) * 100 : 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Game Controls */}
                {gameState.phase === 'waiting' && !gameState.userPrediction && (
                  <div className="space-y-4">
                    <div className="text-center mb-4">
                      <p className="text-gray-300 text-sm mb-2">
                        Will <span className="text-yellow-400 font-semibold">{selectedCoin}</span> price go UP or DOWN?
                      </p>
                    </div>

                    {/* XP Bet Selector */}
                    <div className="mb-4">
                      <div className="text-center mb-3">
                        <div className="flex items-center justify-center space-x-2 text-yellow-400 text-sm mb-2">
                          <Coins className="w-4 h-4" />
                          <span>XP Investment: {selectedXpBet}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          Correct prediction returns {selectedXpBet * 2} XP
                        </div>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {xpBetOptions.map((amount) => (
                          <button
                            key={amount}
                            onClick={() => setSelectedXpBet(amount)}
                            disabled={profile.xp < amount}
                            className={`py-2 px-3 rounded-lg text-sm font-semibold transition-all duration-200 ${
                              selectedXpBet === amount
                                ? 'bg-yellow-400 text-black'
                                : profile.xp >= amount
                                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                : 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                            }`}
                          >
                            {amount}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* XP Check */}
                    {profile.xp < selectedXpBet ? (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                        <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                        <p className="text-red-400 font-semibold">Insufficient XP!</p>
                        <p className="text-gray-400 text-sm">You need at least {selectedXpBet} XP to make this prediction.</p>
                      </div>
                    ) : (
                      /* Prediction Buttons */
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => makePrediction('up')}
                          className="py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-white hover:scale-105 transform"
                        >
                          <TrendingUp className="w-5 h-5" />
                          <span>UP</span>
                        </button>
                        
                        <button
                          onClick={() => makePrediction('down')}
                          className="py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-500 text-white hover:scale-105 transform"
                        >
                          <TrendingUp className="w-5 h-5 rotate-180" />
                          <span>DOWN</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {gameState.userPrediction && (
                  <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-400 mb-1">Your Prediction</div>
                      <div className={`text-lg font-bold flex items-center justify-center space-x-2 ${
                        gameState.userPrediction.prediction === 'up' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        <TrendingUp className={`w-5 h-5 ${gameState.userPrediction.prediction === 'down' ? 'rotate-180' : ''}`} />
                        <span>Price will go {gameState.userPrediction.prediction.toUpperCase()}</span>
                      </div>
                      {gameState.userPrediction.predicted_price && (
                        <div className="text-xs text-gray-500 mt-1">
                          Locked at {formatPrice(gameState.userPrediction.predicted_price, selectedCoin)}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        {gameState.userPrediction.xp_bet} XP invested • Submitted at {new Date(gameState.userPrediction.predicted_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                )}

                {gameState.phase === 'predicting' && (
                  <div className="text-center p-4">
                    <div className="text-yellow-400 mb-2">⏳ Prediction locked!</div>
                    <p className="text-sm text-gray-400">
                      Watching price movement...
                    </p>
                  </div>
                )}

                {gameState.phase === 'resolving' && (
                  <div className="text-center p-8">
                    <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-yellow-400 mb-2">Calculating Results...</p>
                    <p className="text-sm text-gray-400">
                      Results in {gameState.timeLeft} seconds
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>Quick Stats</span>
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">XP Investment</span>
                    <span className="text-blue-400 font-bold">{selectedXpBet} XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Potential Return</span>
                    <span className="text-green-400 font-bold">{selectedXpBet * 2} XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Daily Streak</span>
                    <span className="text-orange-400 font-bold">{profile.daily_play_streak}/7 days</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default CryptoClashPage;