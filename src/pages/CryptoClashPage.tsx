import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, Clock, Trophy, Zap, Target, Users, 
  Play, Pause, RotateCcw, AlertCircle, CheckCircle,
  Wifi, WifiOff, Activity, DollarSign, Flame, Star, LogIn
} from 'lucide-react';
import { useAuthContext } from '../components/AuthProvider';
import { binancePriceService, PriceUpdate, CoinSymbol, formatPrice, formatPriceChange, getPriceChangeColor } from '../lib/binancePriceService';
import { gameLogicService, GameState } from '../lib/gameLogic';
import TradingViewChart from '../components/TradingViewChart';
import GameLeaderboard from '../components/GameLeaderboard';
import AuthButtons from '../components/AuthButtons';

const CryptoClashPage = () => {
  const { user, profile, loading, refreshSessionAndProfile } = useAuthContext();
  const [gameState, setGameState] = useState<GameState>({
    currentRound: null,
    userPrediction: null,
    timeLeft: 0,
    phase: 'waiting'
  });
  const [priceData, setPriceData] = useState<Map<CoinSymbol, PriceUpdate>>(new Map());
  const [selectedCoin, setSelectedCoin] = useState<CoinSymbol>('BTC');
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [roundResults, setRoundResults] = useState<{
    show: boolean;
    isCorrect: boolean | null;
    priceDirection: string | null;
    startPrice: number | null;
    endPrice: number | null;
    xpEarned: number;
  }>({
    show: false,
    isCorrect: null,
    priceDirection: null,
    startPrice: null,
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

  // Initialize price service and game logic
  useEffect(() => {
    // Subscribe to price updates
    const priceSubscriptionId = binancePriceService.subscribe((update: PriceUpdate) => {
      setPriceData(prev => new Map(prev.set(update.symbol, update)));
      
      // Update connection status based on price service health
      setConnectionStatus(binancePriceService.isConnectionHealthy() ? 'connected' : 'disconnected');
    });

    // Subscribe to game state updates
    const gameUnsubscribe = gameLogicService.subscribe((state: GameState) => {
      setGameState(state);
      
      // Auto-select the coin for the current round
      if (state.currentRound && state.currentRound.selected_coin !== selectedCoin) {
        setSelectedCoin(state.currentRound.selected_coin);
      }

      // Show results when round is completed and user had a prediction
      if (state.currentRound?.status === 'completed' && state.userPrediction) {
        setRoundResults({
          show: true,
          isCorrect: state.userPrediction.is_correct,
          priceDirection: state.currentRound.price_direction,
          startPrice: state.currentRound.start_price,
          endPrice: state.currentRound.end_price,
          xpEarned: state.userPrediction.xp_earned || 0
        });

        // Refresh profile to get updated XP
        refreshSessionAndProfile();

        // Hide results after 10 seconds
        setTimeout(() => {
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
      <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show anonymous user access page if not authenticated
  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              <span className="text-yellow-400">Crypto</span>Clash
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
              Predict crypto price movements in real-time. 5-minute game cycles with 60-second prediction windows!
            </p>
          </div>

          {/* Demo Game Preview */}
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            {/* Chart Section */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl overflow-hidden">
                {/* Chart Header */}
                <div className="p-6 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Live Chart</h2>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Live Demo</span>
                    </div>
                  </div>
                  
                  {/* Coin Selector */}
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
                  <div className="bg-black/30 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-400">{cryptoOptions.find(c => c.symbol === selectedCoin)?.name}</div>
                        <div className="text-2xl font-bold text-white">
                          {selectedCoin === 'BTC' ? '$67,234.50' : 
                           selectedCoin === 'ETH' ? '$3,456.78' :
                           selectedCoin === 'SOL' ? '$145.23' :
                           selectedCoin === 'BNB' ? '$312.45' : '$0.6234'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-semibold text-green-400">+2.34%</div>
                        <div className="text-sm text-gray-400">24h Change</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Chart Container */}
                <div className="h-96 lg:h-[500px]">
                  <TradingViewChart
                    symbol={cryptoOptions.find(c => c.symbol === selectedCoin)?.tvSymbol || 'BINANCE:BTCUSDT'}
                    theme="dark"
                    interval="1"
                    allowSymbolChange={false}
                    saveImage={false}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>

            {/* Game Preview Panel */}
            <div className="space-y-6">
              {/* Game Preview */}
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border-2 border-yellow-400/30 rounded-2xl p-6">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center px-4 py-2 rounded-full mb-4 bg-yellow-400/10 border border-yellow-400/20">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-sm font-medium text-yellow-400">Demo Mode</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">
                    Want to play CryptoClash?
                  </h3>
                  
                  <p className="text-gray-300 text-sm mb-4">
                    Predict if <span className="text-yellow-400 font-semibold">{selectedCoin}</span> will go UP or DOWN in the next 60 seconds!
                  </p>
                </div>

                {/* Demo Timer */}
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-white mb-2">4:32</div>
                  <div className="text-sm text-blue-400">Next round starts in</div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                    <div className="bg-blue-400 h-2 rounded-full w-3/4 transition-all duration-1000"></div>
                  </div>
                </div>

                {/* Disabled Prediction Buttons */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <button
                    disabled
                    className="py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span>UP</span>
                  </button>
                  
                  <button
                    disabled
                    className="py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                  >
                    <TrendingUp className="w-5 h-5 rotate-180" />
                    <span>DOWN</span>
                  </button>
                </div>

                {/* Call to Action */}
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 text-center">
                  <div className="mb-4">
                    <LogIn className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white font-semibold mb-1">Sign up to start playing!</p>
                    <p className="text-gray-400 text-sm">Get 100 XP bonus on signup</p>
                  </div>
                  
                  <AuthButtons />
                </div>
              </div>

              {/* Game Info */}
              <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span>XP Economy</span>
                </h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Signup Bonus</span>
                    <span className="text-yellow-400 font-bold">+100 XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Prediction Cost</span>
                    <span className="text-red-400 font-bold">-10 XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Correct Prediction</span>
                    <span className="text-green-400 font-bold">+20 XP</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Win Streak Bonus</span>
                    <span className="text-purple-400 font-bold">+10 XP per streak</span>
                  </div>
                </div>
              </div>

              {/* How to Play */}
              <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h4 className="text-lg font-bold text-white mb-4">How to Play</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Sign up and get 100 XP bonus</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Wait for the prediction window (60 seconds)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Spend 10 XP to predict UP or DOWN</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span>Earn 20 XP + streak bonus for correct predictions</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Live Leaderboard Section */}
          <div className="mb-8">
            <GameLeaderboard />
          </div>
        </div>
      </div>
    );
  }

  const makePrediction = async (direction: 'up' | 'down') => {
    if (!gameState.currentRound || gameState.phase !== 'predicting' || gameState.userPrediction) {
      return;
    }

    try {
      setError(null);
      await gameLogicService.makePrediction(direction, user.id);
      setSuccess(`Prediction "${direction.toUpperCase()}" submitted! 10 XP deducted.`);
      
      // Refresh profile to show updated XP
      await refreshSessionAndProfile();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('Failed to make prediction:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit prediction');
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
          subtitle: 'Prediction window opens soon!',
          color: 'text-blue-400',
          bgColor: 'bg-blue-400/10',
          borderColor: 'border-blue-400/30'
        };
      case 'predicting':
        return {
          title: 'Prediction Active',
          subtitle: 'Make your prediction now!',
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

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            <span className="text-yellow-400">Crypto</span>Clash
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Predict crypto price movements in real-time. 5-minute game cycles with 60-second prediction windows!
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
              
              {roundResults.startPrice && roundResults.endPrice && (
                <div className="bg-black/50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-400">Start Price:</span>
                    <span className="text-white font-semibold">
                      {formatPrice(roundResults.startPrice, selectedCoin)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-2">
                    <span className="text-gray-400">End Price:</span>
                    <span className="text-white font-semibold">
                      {formatPrice(roundResults.endPrice, selectedCoin)}
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

        {/* Success/Error Messages */}
        {success && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400">{success}</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
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
                {profile.streak > 0 && (
                  <div className="flex items-center space-x-1">
                    <Flame className="w-4 h-4 text-orange-400" />
                    <span className="text-white font-semibold">{profile.streak}</span>
                    <span className="text-gray-400">Streak</span>
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
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Round #{gameState.currentRound.round_number} - {gameState.currentRound.selected_coin}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-300">
                  <span className={phaseDisplay.color}>{phaseDisplay.title}</span>
                  {gameState.currentRound.start_price && gameState.phase === 'predicting' && (
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
            
            {/* Progress Bar */}
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
                
                {/* Coin Selector */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {cryptoOptions.map((coin) => (
                    <button
                      key={coin.symbol}
                      onClick={() => setSelectedCoin(coin.symbol)}
                      disabled={gameState.phase === 'predicting' && gameState.currentRound?.selected_coin !== coin.symbol}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        selectedCoin === coin.symbol
                          ? 'bg-yellow-400 text-black'
                          : gameState.phase === 'predicting' && gameState.currentRound?.selected_coin !== coin.symbol
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
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
                  {gameState.currentRound ? `${gameState.currentRound.selected_coin} Prediction` : 'Loading Game...'}
                </h3>
                
                {currentPrice && gameState.currentRound?.selected_coin === selectedCoin && (
                  <div className="text-3xl font-bold text-yellow-400 mb-2">
                    {formatPrice(currentPrice.price, selectedCoin)}
                  </div>
                )}
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
              {gameState.phase === 'waiting' && (
                <div className="text-center p-8">
                  <Clock className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Get Ready!</p>
                  <p className="text-sm text-gray-400">
                    Prediction window opens in {formatTimeLeft(gameState.timeLeft)}
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <button
                      disabled
                      className="py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                    >
                      <TrendingUp className="w-5 h-5" />
                      <span>UP</span>
                    </button>
                    
                    <button
                      disabled
                      className="py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 bg-gray-700 text-gray-500 cursor-not-allowed opacity-50"
                    >
                      <TrendingUp className="w-5 h-5 rotate-180" />
                      <span>DOWN</span>
                    </button>
                  </div>
                </div>
              )}

              {gameState.phase === 'predicting' && !gameState.userPrediction && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <p className="text-gray-300 text-sm mb-2">
                      Will {gameState.currentRound?.selected_coin} price go UP or DOWN in the next 60 seconds?
                    </p>
                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3">
                      <div className="flex items-center justify-center space-x-2 text-yellow-400 text-sm">
                        <DollarSign className="w-4 h-4" />
                        <span>Cost: 10 XP per prediction</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* XP Check */}
                  {profile.xp < 10 ? (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-center">
                      <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-red-400 font-semibold">Insufficient XP!</p>
                      <p className="text-gray-400 text-sm">You need at least 10 XP to make a prediction.</p>
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
                    <div className="text-xs text-gray-500 mt-2">
                      Submitted at {new Date(gameState.userPrediction.predicted_at).toLocaleTimeString()}
                    </div>
                  </div>
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

            {/* Potential Rewards */}
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>XP Economy</span>
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Prediction Cost</span>
                  <span className="text-red-400 font-bold">-10 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Correct Prediction</span>
                  <span className="text-green-400 font-bold">+20 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Win Streak Bonus</span>
                  <span className="text-yellow-400 font-bold">+{profile.streak * 10} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">New User Bonus</span>
                  <span className="text-purple-400 font-bold">+100 XP</span>
                </div>
              </div>
            </div>

            {/* Game Rules */}
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">How to Play</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Wait 4 minutes for the prediction window to open</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Spend 10 XP to predict UP or DOWN for the selected coin</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Wait for the 60-second prediction window to close</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Earn 20 XP + streak bonus for correct predictions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Live Leaderboard Section */}
        <div className="mb-8">
          <GameLeaderboard />
        </div>
      </div>
    </div>
  );
};

export default CryptoClashPage;