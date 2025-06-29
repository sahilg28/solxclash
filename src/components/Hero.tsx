import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react';

const Hero = () => {
  const scrollToWaitlist = () => {
    const section = document.getElementById('waitlist');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-black via-purple-900/30 to-black text-white pt-16 flex items-start relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex flex-col items-center text-center justify-start min-h-[calc(90vh-64px)] pt-8 relative">
          
          {/* Crypto Images - Positioned strategically */}
          <img 
            src="/assets/BTC.svg" 
            alt="Bitcoin" 
            className="absolute top-16 left-8 w-20 h-20 lg:w-24 lg:h-24 opacity-20 transform rotate-12"
          />
          <img 
            src="/assets/SOL.svg" 
            alt="Solana" 
            className="absolute top-32 right-12 w-16 h-16 lg:w-20 lg:h-20 opacity-25 transform -rotate-6"
          />
          <img 
            src="/assets/Poly.svg" 
            alt="Polygon" 
            className="absolute bottom-32 left-16 w-18 h-18 lg:w-22 lg:h-22 opacity-20 transform rotate-45"
          />

          {/* Main Content */}
          <div className="space-y-8 animate-fade-in-up relative z-20">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-yellow-400">Play.</span> <span className="text-white">Compete.</span> <span className="text-yellow-400">Earn.</span>
              </h1>

              <p className="text-xl text-gray-300 max-w-3xl leading-relaxed mx-auto">
                SolxClash is a Web3 gaming platform where players globally can play PvP games, tournaments, and earn. Games focused on players' skills, strategy, and risk management.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-left justify-center">
              <Link
                to="/cryptoclash"
                className="group btn-primary flex items-center justify-center space-x-2">
                <span>Play Now</span>
              </Link>

              <button
                onClick={scrollToWaitlist}
                className="btn-secondary"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;