import React from 'react';
import { TrendingUp, Clock, Trophy, Target, Zap, Shield, Users } from 'lucide-react';

const FeaturedGame = () => {
  return (
    <section className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Featured Game: <span className="text-yellow-400">CryptoClash</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Think you know crypto? Prove it. <span className="text-yellow-400 font-semibold">Skill-based prediction gaming</span> where market knowledge beats luck every time.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Main Game Card */}
          <div className="relative bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/30 rounded-3xl p-8 lg:p-12 shadow-2xl animate-scale-in">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 rounded-3xl blur-xl"></div>
            
            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8 animate-slide-in-left">
                  <div>
                    <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-full mb-6">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                      <span className="text-green-400 text-sm font-medium">Live Now - Join the Competition</span>
                    </div>
                    
                    <h3 className="text-3xl font-bold text-white mb-4">Can You Outpredict the Market?</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      Will Bitcoin, Ethereum, or Solana go UP or DOWN in the next 60 seconds?
                      Make the right call based on your market analysis. Stack your streak. Win more as your accuracy improves.
                    </p>

                    {/* Why It's Different */}
                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 mb-6">
                      <h4 className="text-yellow-400 font-semibold mb-2 flex items-center">
                        <Shield className="w-4 h-4 mr-2" />
                        Why CryptoClash is Different
                      </h4>
                      <p className="text-gray-300 text-sm">
                        Unlike traditional crypto games that rely on NFTs, tokenomics, or random chance, 
                        CryptoClash rewards your <span className="text-yellow-400 font-semibold">market knowledge and analytical skills</span>. 
                        No gambling, no luck - just pure skill-based competition.
                      </p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 group">
                      <TrendingUp className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-gray-300">Live crypto charts with real market data</span>
                    </div>
                    <div className="flex items-center space-x-3 group">
                      <Clock className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-gray-300">60-second prediction rounds for quick action</span>
                    </div>
                    <div className="flex items-center space-x-3 group">
                      <Trophy className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-gray-300">Instant XP rewards for correct predictions</span>
                    </div>
                    <div className="flex items-center space-x-3 group">
                      <Target className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-gray-300">Competitive leaderboards and skill rankings</span>
                    </div>
                    <div className="flex items-center space-x-3 group">
                      <Users className="w-5 h-5 text-yellow-400 group-hover:scale-110 transition-transform duration-200" />
                      <span className="text-gray-300">Fair play - everyone starts equal</span>
                    </div>
                  </div>

                  <button 
                    className="group btn-primary flex items-center space-x-2"
                    onClick={() => window.location.href='/cryptoclash'}>
                    <Gamepad2 className="w-5 h-5" />
                    <span>Start Competing Now</span>
                  </button>
                </div>

                {/* Right Content - Enhanced Game Preview */}
                <div className="relative animate-slide-in-right">
                  <div className="bg-black/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 card-hover">
                    {/* Game Header */}
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-lg font-bold text-white flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                        <span>BTC/USD</span>
                      </h4>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-400 font-medium">Live Market Data</span>
                      </div>
                    </div>

                    {/* Price Display */}
                    <div className="text-center mb-6">
                      <div className="text-4xl font-bold text-yellow-400 mb-2">$105,449.00</div>
                      <div className="text-green-400 text-sm font-semibold">+2.34% (+$1,523.12)</div>
                      <div className="text-xs text-gray-400 mt-1">Real-time price feed</div>
                    </div>

                    {/* Skill Indicator */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-blue-400 font-medium">Your Skill Level</span>
                        <span className="text-white font-bold">Expert Trader</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                        <div className="bg-blue-400 h-2 rounded-full" style={{ width: '75%' }}></div>
                      </div>
                    </div>

                    {/* Timer */}
                    <div className="text-center mb-6">
                      <div className="text-2xl font-bold text-white mb-1">00:45</div>
                      <div className="text-gray-400 text-sm">Make your prediction</div>
                    </div>

                    {/* Prediction Buttons */}
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <button className="bg-green-600 hover:bg-green-500 text-white py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>📈 UP</span>
                      </button>
                      <button className="bg-red-600 hover:bg-red-500 text-white py-4 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2">
                        <TrendingUp className="w-4 h-4 rotate-180" />
                        <span>📉 DOWN</span>
                      </button>
                    </div>

                    {/* Reward Info */}
                    <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300 text-sm font-medium">Skill-Based Reward</span>
                        <span className="text-yellow-400 font-bold">+150 XP</span>
                      </div>
                      <div className="text-xs text-gray-400">
                        Earn more XP with higher accuracy and win streaks
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Skill vs Luck Comparison */}
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-red-900/20 to-red-800/20 border border-red-500/30 rounded-xl p-6">
              <h4 className="text-red-400 font-bold mb-3 flex items-center">
                <X className="w-5 h-5 mr-2" />
                Traditional Crypto Games
              </h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Expensive NFT requirements</li>
                <li>• Pay-to-win mechanics</li>
                <li>• Random chance outcomes</li>
                <li>• Complex tokenomics</li>
                <li>• High barrier to entry</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
              <h4 className="text-green-400 font-bold mb-3 flex items-center">
                <Check className="w-5 h-5 mr-2" />
                SolxClash CryptoClash
              </h4>
              <ul className="space-y-2 text-gray-300 text-sm">
                <li>• Free to start, skill to win</li>
                <li>• Pure skill-based gameplay</li>
                <li>• Market knowledge rewarded</li>
                <li>• Transparent mechanics</li>
                <li>• Equal opportunity for all</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGame;