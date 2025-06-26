import React from 'react';
import { TrendingUp, Clock, Trophy } from 'lucide-react';

const FeaturedGame = () => {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Featured Game : <span className="text-yellow-400">CryptoClash</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Think you know crypto? Predict the next move and prove it.
          </p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Main Game Card */}
          <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-8 lg:p-12 shadow-2xl">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-3xl blur-xl"></div>
            
            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8">
                  <div>
                    <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full mb-4">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      <span className="text-green-400 text-sm font-medium animate-pulse">Live Now</span>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-4">Can You Outpredict the Market?</h3>
                    <p className="text-gray-300 text-lg leading-relaxed">
                    Will Bitcoin, Ethereum, or Solana go UP or DOWN in the next 60 seconds?
                    Make the right call. Stack your streak. Win more as your accuracy improves.
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">Live crypto charts, no delays</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">60-second prediction rounds</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                      <span className="text-gray-300">Earn instantly on every right call</span>
                    </div>
                  </div>
                  <button 
                    className="group bg-yellow-400 text-black px-6 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors duration-200 flex items-center space-x-2"
                    onClick={() => window.location.href='/cryptoclash'}>
                    <span>Play CryptoClash</span>
                  </button>
                </div>

                {/* Right Content - Game Preview */}
                <div className="relative">
                  <div className="bg-black/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
                    {/* Game Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-bold text-white">BTC/USD</h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400">Live</span>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-yellow-400 mb-2">$105,449.00</div>
                      <div className="text-green-400 text-sm">+2.34% (+$1,523.12)</div>
                    </div>

                    {/* Timer */}
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-white mb-1">00:45</div>
                      <div className="text-gray-400 text-sm">Next round starts in</div>
                    </div>

                    {/* Prediction Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button className="bg-green-600 hover:bg-green-500 text-white py-4 rounded-lg font-semibold transition-colors duration-200">
                        📈 UP
                      </button>
                      <button className="bg-red-600 hover:bg-red-500 text-white py-4 rounded-lg font-semibold transition-colors duration-200">
                        📉 DOWN
                      </button>
                    </div>

                    {/* Reward Info */}
                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm">Potential Reward</span>
                        <span className="text-yellow-400 font-bold">+150 USDT</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGame;