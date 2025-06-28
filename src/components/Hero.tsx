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
        <div className="flex flex-col items-center text-center justify-center min-h-[calc(100vh-64px)]">
          {/* Main Content - Centered */}
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

              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed mx-auto">
                The first Web3 gaming platform where <span className="text-yellow-400 font-semibold">your skill determines your success</span>, not luck or how much you spend. 
                Compete in skill-based games, climb leaderboards, and earn through knowledge and strategy.
              </p>

              {/* USP Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-2xl mx-auto">
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-gray-300">100% Skill-Based</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-gray-300">No Pay-to-Win</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-400" />
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-800 animate-slide-in-left max-w-3xl mx-auto">
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
        </div>
      </div>
    </section>
  );
};

export default Hero;