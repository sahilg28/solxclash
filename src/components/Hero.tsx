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
          
          {/* Crypto Images - Bigger and positioned in corners */}
          <img 
            src="/assets/BTC.svg" 
            alt="Bitcoin" 
            className="absolute -top-8 -left-12 w-32 h-32 lg:w-48 lg:h-48 xl:w-56 xl:h-56 opacity-15 transform rotate-12 z-0"
          />
          <img 
            src="/assets/SOL.svg" 
            alt="Solana" 
            className="absolute top-4 -right-16 w-28 h-28 lg:w-40 lg:h-40 xl:w-48 xl:h-48 opacity-20 transform -rotate-6 z-0"
          />
          <img 
            src="/assets/Poly.svg" 
            alt="Polygon" 
            className="absolute -bottom-12 -left-8 w-36 h-36 lg:w-52 lg:h-52 xl:w-60 xl:h-60 opacity-12 transform rotate-45 z-0"
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