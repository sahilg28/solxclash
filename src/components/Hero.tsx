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
    <section className="min-h-screen bg-black text-white pt-16 flex items-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 grid-background opacity-40"></div>
      
      {/* Crypto Icons - Positioned strategically */}
      <div className="absolute inset-0 pointer-events-none">
        {/* BTC - Top left */}
        <img 
          src="/assets/BTC.svg" 
          alt="Bitcoin" 
          className="absolute top-32 left-16 w-16 h-16 opacity-20 animate-gentle-float"
          style={{ animationDelay: '0s' }}
        />
        
        {/* SOL - Top right */}
        <img 
          src="/assets/SOL.svg" 
          alt="Solana" 
          className="absolute top-40 right-20 w-20 h-20 opacity-25 animate-gentle-float"
          style={{ animationDelay: '2s' }}
        />
        
        {/* POL - Bottom left */}
        <img 
          src="/assets/Poly.svg" 
          alt="Polygon" 
          className="absolute bottom-32 left-20 w-14 h-14 opacity-15 animate-gentle-float"
          style={{ animationDelay: '4s' }}
        />
        
        {/* BTC - Bottom right (smaller) */}
        <img 
          src="/assets/BTC.svg" 
          alt="Bitcoin" 
          className="absolute bottom-40 right-16 w-12 h-12 opacity-10 animate-gentle-float"
          style={{ animationDelay: '1s' }}
        />
        
        {/* SOL - Center left (very subtle) */}
        <img 
          src="/assets/SOL.svg" 
          alt="Solana" 
          className="absolute top-1/2 left-8 w-10 h-10 opacity-8 animate-gentle-float"
          style={{ animationDelay: '3s' }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex flex-col items-center text-center justify-center min-h-[calc(80vh-64px)]">
          {/* Main Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                <span className="text-yellow-400">Play.</span> <span className="text-white">Compete.</span> <span className="text-yellow-400">Earn.</span>
              </h1>

              <p className="text-xl text-gray-300 max-w-4xl leading-relaxed mx-auto">
                SolxClash is a Web3 gaming platform where players globally compete in PvP games and tournaments. 
                <span className="text-yellow-400 font-semibold"> Games focused on player skills, strategy, and calculated risk</span> — 
                where your abilities determine your success.
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

          {/* Decorative Cards Section - Bottom */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none">
            <div className="relative w-80 h-20">
              {/* Card 1 - Left */}
              <div className="absolute bottom-0 left-0 w-16 h-24 bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-lg border border-purple-400/20 transform rotate-[-15deg] backdrop-blur-sm"></div>
              
              {/* Card 2 - Center Left */}
              <div className="absolute bottom-0 left-12 w-16 h-24 bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-lg border border-blue-400/20 transform rotate-[-8deg] backdrop-blur-sm"></div>
              
              {/* Card 3 - Center */}
              <div className="absolute bottom-0 left-24 w-16 h-24 bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 rounded-lg border border-yellow-400/30 transform rotate-[0deg] backdrop-blur-sm"></div>
              
              {/* Card 4 - Center Right */}
              <div className="absolute bottom-0 left-36 w-16 h-24 bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-lg border border-green-400/20 transform rotate-[8deg] backdrop-blur-sm"></div>
              
              {/* Card 5 - Right */}
              <div className="absolute bottom-0 left-48 w-16 h-24 bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-lg border border-red-400/20 transform rotate-[15deg] backdrop-blur-sm"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;