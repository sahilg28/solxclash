import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gamepad2, Clock, Gift } from 'lucide-react';

const Hero = () => {
  const scrollToWaitlist = () => {
    const section = document.getElementById('waitlist');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen bg-black text-white pt-16 flex items-center">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full">
                <span className="text-yellow-400 text-sm font-medium">
                  🚀 Web3 Gaming Revolution
                </span>
              </div>

              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Predict.<br />
                <span className="text-yellow-400">Win.</span><br />
                <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                  Dominate.
                </span>
              </h1>

              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                Join the ultimate Web3 gaming platform where skill meets blockchain. 
                Predict crypto prices, climb leaderboards, and earn real rewards on Solana.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/cryptoclash"
                className="group bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-300 transition-colors duration-200 flex items-center justify-center space-x-2"
              >
                <span>Start Playing</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>

              <button
                onClick={scrollToWaitlist}
                className="border border-yellow-400 text-yellow-400 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-yellow-400/10 transition-colors duration-200"
              >
                Join Waitlist
              </button>
            </div>

            {/* Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-800">
              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-400/10 rounded-lg mb-3 mx-auto">
                  <Gamepad2 className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-white">For Real Gamers</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-400/10 rounded-lg mb-3 mx-auto">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-white">Beta Launch Soon</div>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-400/10 rounded-lg mb-3 mx-auto">
                  <Gift className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="text-lg font-bold text-white">Earn XP & Perks</div>
              </div>
            </div>
          </div>

          {/* Right Content - Visual Element */}
          <div className="relative">
            <div className="relative z-10">
              <div className="bg-gradient-to-br from-gray-900 to-black border border-yellow-400/20 rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">CryptoClash</h3>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-400">Live</span>
                  </div>
                </div>

                <div className="bg-black/50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400">BTC/USD</span>
                    <span className="text-green-400 text-sm">+2.34%</span>
                  </div>
                  <div className="text-3xl font-bold text-yellow-400">$105,449.00</div>
                  <div className="text-sm text-gray-400 mt-1">Next prediction in 45s</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button className="bg-green-600 hover:bg-green-500 text-white py-3 rounded-lg font-semibold transition-colors duration-200">
                    📈 UP
                  </button>
                  <button className="bg-red-600 hover:bg-red-500 text-white py-3 rounded-lg font-semibold transition-colors duration-200">
                    📉 DOWN
                  </button>
                </div>

                <div className="mt-6 p-4 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Potential Reward</span>
                    <span className="text-yellow-400 font-bold">+150 USDT</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 rounded-2xl blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;