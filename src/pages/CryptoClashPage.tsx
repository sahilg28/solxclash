import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { TrendingUp, Clock, Trophy, Zap, Play, RotateCcw, Target, Wifi, WifiOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuthContext } from '../components/AuthProvider';
import { useGameLogic } from '../hooks/useGameLogic';
import TradingViewChart from '../components/TradingViewChart';

const CryptoClashPage = () => {
  const { user, profile, loading: authLoading } = useAuthContext();
  const {
    gameState,
    currentPrice,
    priceConnected,
    startGame,
    makePrediction,
    resetGame,
    loading: gameLoading,
    error: gameError
  } = useGameLogic();

  const [selectedCoin, setSelectedCoin] = useState('BTC');

  // Updated cryptocurrency options with correct coins
  const cryptoOptions = [
    { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin', ticker: 'BTC', color: 'text-orange-400' },
    { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum', ticker: 'ETH', color: 'text-blue-400' },
    { symbol: 'BINANCE:SOLUSDT', name: 'Solana', ticker: 'SOL', color: 'text-purple-400' },
    { symbol: 'BINANCE:BNBUSDT', name: 'BNB', ticker: 'BNB', color: 'text-yellow-500' },
    { symbol: 'BINANCE:XRPUSDT', name: 'XRP', ticker: 'XRP', color: 'text-blue-500' }
  ];

  // Show loading state while authentication is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen bg-black pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  const selectedCoinData = cryptoOptions.find(coin => coin.ticker === selectedCoin);
  const isGameActive = gameState.status === 'active';
  const isGameCompleted = gameState.status === 'completed';
  const isGameResolving = gameState.status === 'resolving';

  const handleStartGame = async () => {
    await startGame(selectedCoin);
  };

  const handleMakePrediction = async (prediction: 'up' | 'down') => {
    await makePrediction(prediction);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(price);
  };

  const getPriceChange = () => {
    if (!gameState.startPrice || !gameState.endPrice) return null;
    return ((gameState.endPrice - gameState.startPrice) / gameState.startPrice) * 100;
  };

  return (
    <div className="min-h-screen bg-black pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            <span className="text-yellow-400">Crypto</span>Clash
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Predict crypto price movements in real-time. Choose your coin, make your prediction, and win rewards!
          </p>
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-center mb-6">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            priceConnected 
              ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            {priceConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
            <span className="text-sm font-medium">
              {priceConnected ? 'Live Price Feed Connected' : 'Price Feed Disconnected'}
            </span>
          </div>
        </div>

        {/* Error Display */}
        {gameError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <span className="text-red-400">{gameError}</span>
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
                <div className="flex items-center space-x-1">
                  <span className="text-orange-400">🔥</span>
                  <span className="text-white font-semibold">{profile.streak}</span>
                  <span className="text-gray-400">Streak</span>
                </div>
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Chart Section */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl overflow-hidden">
              {/* Chart Header */}
              <div className="p-6 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-white">Live Chart</h2>
                  <div className="flex items-center space-x-4">
                    {currentPrice && (
                      <div className="text-right">
                        <div className="text-sm text-gray-400">Current Price</div>
                        <div className="text-lg font-bold text-yellow-400">
                          {formatPrice(currentPrice)}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-green-400">Live</span>
                    </div>
                  </div>
                </div>
                
                {/* Coin Selector */}
                <div className="flex flex-wrap gap-2">
                  {cryptoOptions.map((coin) => (
                    <button
                      key={coin.ticker}
                      onClick={() => setSelectedCoin(coin.ticker)}
                      disabled={isGameActive}
                      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                        selectedCoin === coin.ticker
                          ? 'bg-yellow-400 text-black'
                          : isGameActive
                          ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className={selectedCoin === coin.ticker ? 'text-black' : coin.color}>
                        {coin.ticker}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Container */}
              <div className="h-96 lg:h-[500px]">
                <TradingViewChart
                  symbol={selectedCoinData?.symbol || 'BINANCE:BTCUSDT'}
                  theme="dark"
                  interval="1"
                  allowSymbolChange={false}
                  saveImage={false}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Game Panel */}
          <div className="space-y-6">
            {/* Current Game Status */}
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedCoinData?.name} Prediction
                </h3>
                <div className="text-3xl font-bold text-yellow-400 mb-2">
                  {selectedCoin}/USDT
                </div>
              </div>

              {/* Game Status Display */}
              {isGameCompleted && (
                <div className="mb-6 p-4 rounded-lg border-2 border-dashed">
                  <div className={`text-center ${
                    gameState.result === 'win' 
                      ? 'border-green-400 bg-green-400/10' 
                      : 'border-red-400 bg-red-400/10'
                  }`}>
                    <div className="flex items-center justify-center mb-2">
                      {gameState.result === 'win' ? (
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      ) : (
                        <XCircle className="w-8 h-8 text-red-400" />
                      )}
                    </div>
                    <div className={`text-2xl font-bold mb-2 ${
                      gameState.result === 'win' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {gameState.result === 'win' ? 'YOU WON!' : 'YOU LOST!'}
                    </div>
                    <div className="text-sm text-gray-300 mb-3">
                      Start: {formatPrice(gameState.startPrice)} → End: {formatPrice(gameState.endPrice)}
                    </div>
                    <div className="text-sm text-gray-300 mb-3">
                      Price Change: {getPriceChange()?.toFixed(2)}%
                    </div>
                    {gameState.result === 'win' && (
                      <div className="space-y-1">
                        <div className="text-yellow-400 font-bold">+{gameState.xpEarned} XP</div>
                        {gameState.usdtEarned > 0 && (
                          <div className="text-blue-400 font-bold">+{gameState.usdtEarned} USDT</div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timer */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {formatTime(gameState.timeLeft)}
                </div>
                <div className="text-sm text-gray-400">
                  {isGameActive ? 'Time remaining' : isGameResolving ? 'Resolving...' : 'Game duration: 5 minutes'}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div 
                    className={`h-2 rounded-full transition-all duration-1000 ${
                      isGameResolving ? 'bg-orange-400' : 'bg-yellow-400'
                    }`}
                    style={{ width: `${(gameState.timeLeft / 300) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Game Controls */}
              {gameState.status === 'idle' ? (
                <button
                  onClick={handleStartGame}
                  disabled={gameLoading || !priceConnected}
                  className="w-full bg-yellow-400 text-black py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play className="w-5 h-5" />
                  <span>{gameLoading ? 'Starting...' : 'Start New Game'}</span>
                </button>
              ) : isGameActive ? (
                <div className="space-y-4">
                  {/* Game Info */}
                  <div className="bg-gray-800/50 rounded-lg p-3 text-center">
                    <div className="text-sm text-gray-400 mb-1">Starting Price</div>
                    <div className="text-lg font-bold text-white">
                      {formatPrice(gameState.startPrice)}
                    </div>
                  </div>

                  {/* Prediction Buttons */}
                  {!gameState.prediction ? (
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleMakePrediction('up')}
                        disabled={gameLoading}
                        className="bg-green-600 hover:bg-green-500 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <TrendingUp className="w-5 h-5" />
                        <span>UP</span>
                      </button>
                      
                      <button
                        onClick={() => handleMakePrediction('down')}
                        disabled={gameLoading}
                        className="bg-red-600 hover:bg-red-500 text-white py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                      >
                        <TrendingUp className="w-5 h-5 rotate-180" />
                        <span>DOWN</span>
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                      <div className="text-center">
                        <div className="text-sm text-gray-400 mb-1">Your Prediction</div>
                        <div className={`text-lg font-bold ${
                          gameState.prediction === 'up' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          Price will go {gameState.prediction.toUpperCase()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reset Button */}
                  <button
                    onClick={resetGame}
                    className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Game</span>
                  </button>
                </div>
              ) : isGameResolving ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 border-4 border-orange-400/20 border-t-orange-400 rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-orange-400 font-semibold">Resolving game...</p>
                </div>
              ) : (
                <button
                  onClick={resetGame}
                  className="w-full bg-yellow-400 text-black py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Play Again</span>
                </button>
              )}
            </div>

            {/* Potential Rewards */}
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">Potential Rewards</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Correct Prediction</span>
                  <span className="text-green-400 font-bold">+50 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Win Streak Bonus</span>
                  <span className="text-yellow-400 font-bold">+{Math.min(profile.streak * 5, 150)} XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">USDT Reward</span>
                  <span className="text-blue-400 font-bold">+{Math.min(10 + profile.streak, 30)} USDT</span>
                </div>
              </div>
            </div>

            {/* Game Rules */}
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">How to Play</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Choose a cryptocurrency from the available options</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Start a new game and predict if the price will go UP or DOWN</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Wait for the 5-minute timer to complete</span>
                </li>
                <li className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Earn XP and rewards for correct predictions</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoClashPage;