import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

const FeaturedGame = () => {
  return (
    <section className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Subtle purple glow effect */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-900/30 to-transparent pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="text-center lg:text-left animate-fade-in-up">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              <span className="text-yellow-400">Crypto</span>Clash
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              Select your favourite coin, analyze it and predict whether it will fall or rise. 
              Earn XPs with correct predictions. Stay tuned for play-to-earn mechanism and onchain gaming... coming soon.
            </p>
            
            <Link
              to="/cryptoclash"
              className="group btn-primary flex items-center justify-center lg:justify-start space-x-2 w-full lg:w-auto"
            >
              <Gamepad2 className="w-5 h-5" />
              <span>Play Now</span>
            </Link>
          </div>

          {/* Right Content - Game Image */}
          <div className="relative animate-scale-in">
            <div className="bg-black/60 backdrop-blur-sm border border-gray-700 rounded-2xl p-4 card-hover">
              <img
                src="/assets/Screenshot 2025-06-28 210140.png"
                alt="CryptoClash Game Interface"
                className="w-full h-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedGame;