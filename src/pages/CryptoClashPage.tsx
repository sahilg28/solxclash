import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { TrendingUp, Clock, Trophy, Zap, Play, Pause, RotateCcw, Target } from 'lucide-react';
import { useAuthContext } from '../components/AuthProvider';
import TradingViewChart from '../components/TradingViewChart';

const CryptoClashPage = () => {
  const { user, profile, loading } = useAuthContext();
  const [selectedCoin, setSelectedCoin] = useState('BINANCE:BTCUSDT');
  const [gameActive, setGameActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [prediction, setPrediction] = useState<'up' | 'down' | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  // Cryptocurrency options
  const cryptoOptions = [
    { symbol: 'BINANCE:BTCUSDT', name: 'Bitcoin', ticker: 'BTC', color: 'text-orange-400' },
    { symbol: 'BINANCE:ETHUSDT', name: 'Ethereum', ticker: 'ETH', color: 'text-blue-400' },
    { symbol: 'BINANCE:SOLUSDT', name: 'Solana', ticker: 'SOL', color: 'text-purple-400' },
    { symbol: 'BINANCE:ADAUSDT', name: 'Cardano', ticker: 'ADA', color: 'text-blue-500' },
    { symbol: 'BINANCE:DOTUSDT', name: 'Polkadot', ticker: 'DOT', color: 'text-pink-400' }
  ];

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

  // Redirect to home if not authenticated
  if (!user || !profile) {
    return <Navigate to="/" replace />;
  }

  // Game timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameActive(false);
      // Here you would typically resolve the prediction
      setTimeout(() => {
        setTimeLeft(60);
        setPrediction(null);
      }, 3000);
    }

    return () => clearInterval(interval);
  }, [gameActive, timeLeft]);

  const startGame = () => {
    setGameActive(true);
    setTimeLeft(60);
    setPrediction(null);
  };

  const makePrediction = (direction: 'up' | 'down') => {
    if (!gameActive) return;
    setPrediction(direction);
  };

  const resetGame = () => {
    setGameActive(false);
    setTimeLeft(60);
    setPrediction(null);
  };

  const selectedCoinData = cryptoOptions.find(coin => coin.symbol === selectedCoin);

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
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Live</span>
                  </div>
                </div>
                
                {/* Coin Selector */}
                <div className="flex flex-wrap gap-2">
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
                        {coin.ticker}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart Container */}
              <div className="h-96 lg:h-[500px]">
                <TradingViewChart
                  symbol={selectedCoin}
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
                  {selectedCoinData?.ticker}/USDT
                </div>
              </div>

              {/* Timer */}
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-white mb-2">
                  {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-400">
                  {gameActive ? 'Time remaining' : 'Next round starts in'}
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Game Controls */}
              {!gameActive ? (
                <button
                  onClick={startGame}
                  className="w-full bg-yellow-400 text-black py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <Play className="w-5 h-5" />
                  <span>Start New Game</span>
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Prediction Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => makePrediction('up')}
                      disabled={!!prediction}
                      className={`py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                        prediction === 'up'
                          ? 'bg-green-600 text-white ring-2 ring-green-400'
                          : prediction
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-500 text-white'
                      }`}
                    >
                      <TrendingUp className="w-5 h-5" />
                      <span>UP</span>
                    </button>
                    
                    <button
                      onClick={() => makePrediction('down')}
                      disabled={!!prediction}
                      className={`py-4 rounded-lg font-semibold text-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                        prediction === 'down'
                          ? 'bg-red-600 text-white ring-2 ring-red-400'
                          : prediction
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-red-600 hover:bg-red-500 text-white'
                      }`}
                    >
                      <TrendingUp className="w-5 h-5 rotate-180" />
                      <span>DOWN</span>
                    </button>
                  </div>

                  {/* Reset Button */}
                  <button
                    onClick={resetGame}
                    className="w-full bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Game</span>
                  </button>
                </div>
              )}

              {/* Prediction Status */}
              {prediction && (
                <div className="mt-4 p-4 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                  <div className="text-center">
                    <div className="text-sm text-gray-400 mb-1">Your Prediction</div>
                    <div className={`text-lg font-bold ${
                      prediction === 'up' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      Price will go {prediction.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Potential Rewards */}
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h4 className="text-lg font-bold text-white mb-4">Potential Rewards</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Correct Prediction</span>
                  <span className="text-green-400 font-bold">+100 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Win Streak Bonus</span>
                  <span className="text-yellow-400 font-bold">+50 XP</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">USDT Reward</span>
                  <span className="text-blue-400 font-bold">+25 USDT</span>
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
                  <span>Wait for the 60-second timer to complete</span>
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