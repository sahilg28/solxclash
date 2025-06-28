import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, Clock, Gift, Zap, Target, TrendingUp, Trophy, Users, Coins } from 'lucide-react';

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

      {/* Purple gradient at bottom flowing from bottom to top */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-900/30 to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex flex-col items-center text-center justify-center min-h-[calc(100vh-64px)]">
          {/* Main Content - Centered */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full animate-scale-in">
                <Coins className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-yellow-400 text-sm font-medium">
                  🎮 Play-to-Earn Gaming Revolution
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-yellow-400">Play.</span> <span className="text-white">Compete.</span> <span className="text-yellow-400">Earn.</span><br />
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Where Skills Matter.
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed mx-auto">
                The ultimate Web3 play-to-earn gaming platform where <span className="text-yellow-400 font-semibold">your skills unlock bigger rewards</span>. 
                Compete in real-time games, climb leaderboards, and earn through strategic gameplay.
              </p>

              {/* Value Propositions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Gamepad2 className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">Play & Earn</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">Skills = Rewards</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-gray-300">Fair Competition</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-left justify-center">
              <Link
                to="/cryptoclash"
                className="group btn-primary flex items-center justify-center space-x-2"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Start Earning Now</span>
              </Link>

              <button
                onClick={scrollToWaitlist}
                className="btn-secondary"
              >
                Join the Revolution
              </button>
            </div>

            {/* Enhanced Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-800 animate-slide-in-left max-w-4xl mx-auto">
              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-400/10 rounded-lg mb-3 mx-auto group-hover:bg-yellow-400/20 transition-colors duration-300">
                  <Coins className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-white">Play to Earn</div>
                <div className="text-sm text-gray-400">Every game rewards you</div>
              </div>

              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-400/10 rounded-lg mb-3 mx-auto group-hover:bg-yellow-400/20 transition-colors duration-300">
                  <Target className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-white">Skills Amplify</div>
                <div className="text-sm text-gray-400">Better skills = bigger rewards</div>
              </div>

              <div className="text-center group">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-400/10 rounded-lg mb-3 mx-auto group-hover:bg-yellow-400/20 transition-colors duration-300">
                  <Users className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-white">Global Competition</div>
                <div className="text-sm text-gray-400">Compete worldwide</div>
              </div>
            </div>

            {/* Earning Potential Showcase */}
            <div className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border border-yellow-400/20 rounded-xl p-6 max-w-3xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Start Earning Today</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-yellow-400">100</div>
                  <div className="text-xs text-gray-400">Starting XP</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">2x</div>
                  <div className="text-xs text-gray-400">Win Multiplier</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-400">300</div>
                  <div className="text-xs text-gray-400">Streak Bonus</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">∞</div>
                  <div className="text-xs text-gray-400">Earning Potential</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;