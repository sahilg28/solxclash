import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Clock, Gift, Zap, Target, TrendingUp } from 'lucide-react';

const Hero = () => {
  const scrollToWaitlist = () => {
    const section = document.getElementById('waitlist');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen bg-black text-white pt-16 flex items-center relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full animate-scale-in">
                <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-yellow-400 text-sm font-medium">
                  🚀 Skill-Based Web3 Gaming Revolution
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Master the Market.<br />
                <span className="text-yellow-400">Outsmart the Board.</span><br />
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Earn Real Rewards.
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                The first Web3 gaming platform where <span className="text-yellow-400 font-semibold">your skill determines your success</span>, not luck or how much you spend. 
                Compete in skill-based games, climb leaderboards, and earn through knowledge and strategy.
              </p>

              {/* USP Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                <div className="flex items-center space-x-2 text-sm">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">100% Skill-Based</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">No Pay-to-Win</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Fair Competition</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-left">
              <Link
                to="/cryptoclash"
                className="group btn-primary flex items-center justify-center space-x-2"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Start Playing Now</span>
              </Link>

              <button
                onClick={scrollToWaitlist}
                className="btn-secondary"
              >
                Join the Revolution
              </button>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-800 animate-slide-in-left">
              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-400/10 rounded-lg mb-3 mx-auto group-hover:bg-yellow-400/20 transition-colors duration-300">
                  <Gamepad2 className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-white">Skill Rewarded</div>
                <div className="text-sm text-gray-400">Knowledge pays off</div>
              </div>

              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-400/10 rounded-lg mb-3 mx-auto group-hover:bg-yellow-400/20 transition-colors duration-300">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-white">Live Competition</div>
                <div className="text-sm text-gray-400">Real-time gameplay</div>
              </div>

              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-400/10 rounded-lg mb-3 mx-auto group-hover:bg-yellow-400/20 transition-colors duration-300">
                  <Gift className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-white">Transparent Rewards</div>
                <div className="text-sm text-gray-400">Provably fair</div>
              </div>
            </div>
          </div>

          {/* Right Content - Enhanced Game Preview */}
          <div className="relative animate-slide-in-right">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-400/20 rounded-2xl p-8 shadow-2xl card-hover">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-yellow-400" />
                    <span>CryptoClash</span>
                  </h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400 font-medium">Live</span>
                  </div>
                </div>

                <div className="bg-black/50 rounded-lg p-6 mb-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 font-medium">BTC/USD</span>
                    <span className="text-green-400 text-sm font-semibold">+2.34%</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-400 mb-2">$105,449.00</div>
                  <div className="text-sm text-gray-400 mt-1">Next prediction in <span className="text-yellow-400 font-semibold">45s</span></div>
                  
                  {/* Mini chart visualization */}
                  <div className="mt-4 h-16 bg-gray-800/50 rounded flex items-end justify-between px-2">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-2 bg-gradient-to-t from-yellow-400/30 to-yellow-400 rounded-t"
                        style={{ height: `${Math.random() * 60 + 20}%` }}
                      ></div>
                    ))}
                  </div>
                </div>

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

                <div className="p-4 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300 font-medium">Skill-Based Reward</span>
                    <span className="text-yellow-400 font-bold">+150 XP</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Based on market knowledge, not luck</div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-2xl blur-3xl animate-glow"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;