import React from 'react';
import { TrendingUp, Gamepad2 } from 'lucide-react';

const FeaturedGame = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-purple-900/30 via-purple-900/10 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Featured Game: <span className="text-yellow-400">CryptoClash</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Select your favourite coin, analyze it and predict whether it will fall or rise. Earn XPs with correct predictions.
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Main Game Card */}
          <div className="relative bg-gradient-to-br from-purple-900/40 to-black/80 backdrop-blur-xl border border-purple-400/30 rounded-3xl p-8 lg:p-12 shadow-2xl animate-scale-in">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-yellow-400/10 rounded-3xl blur-xl"></div>
            
            <div className="relative z-10">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Content */}
                <div className="space-y-8 animate-slide-in-left">
                  <div>
                    <h3 className="text-3xl font-bold text-white mb-4">CryptoClash</h3>
                    <p className="text-gray-300 text-lg leading-relaxed mb-6">
                      Select your favourite coin, analyze it and predict whether it will fall or rise. Earn XPs with correct predictions.
                    </p>
                    <p className="text-gray-400 text-sm mb-6">
                      Stay tuned for play-to-earn mechanism and onchain gaming... coming soon!
                    </p>
                  </div>

                  <button 
                    className="group btn-primary flex items-center space-x-2"
                    onClick={() => window.location.href='/cryptoclash'}>
                    <Gamepad2 className="w-5 h-5" />
                    <span>Play Now</span>
                  </button>
                </div>

                {/* Right Content - Game Image */}
                <div className="relative animate-slide-in-right">
                  <div className="bg-black/60 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-4 card-hover">
                    <img
                      src="/assets/Screenshot 2025-06-28 210140.png"
                      alt="CryptoClash Game Interface"
                      className="w-full h-auto rounded-lg"
                    />
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