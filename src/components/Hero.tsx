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
    <section className="min-h-screen bg-gradient-to-br from-gray-900 via-yellow-900/20 to-black text-white pt-16 flex items-start relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* 3D Cryptocurrency Icons Layer */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Main BTC Icon - Foreground */}
        <div className="absolute top-1/4 right-1/6 transform rotate-12 animate-float">
          <img 
            src="/assets/BTC.svg" 
            alt="Bitcoin" 
            className="w-32 h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 opacity-80 hover:rotate-12 transition-transform duration-700 drop-shadow-2xl"
            style={{ filter: 'drop-shadow(0 25px 50px rgba(250, 204, 21, 0.3))' }}
          />
        </div>

        {/* ETH Icon - Mid-layer */}
        <div className="absolute top-1/3 left-1/8 transform -rotate-45 animate-float-delayed">
          <img 
            src="/assets/ETH.svg" 
            alt="Ethereum" 
            className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 opacity-70 hover:-rotate-45 transition-transform duration-700 drop-shadow-xl"
            style={{ filter: 'drop-shadow(0 20px 40px rgba(99, 102, 241, 0.2))' }}
          />
        </div>

        {/* SOL Icon - Background */}
        <div className="absolute bottom-1/3 right-1/4 transform rotate-30 animate-float-slow">
          <img 
            src="/assets/SOL.svg" 
            alt="Solana" 
            className="w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 opacity-60 hover:rotate-30 transition-transform duration-700 drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 15px 30px rgba(147, 51, 234, 0.2))' }}
          />
        </div>

        {/* BNB Icon - Supporting */}
        <div className="absolute top-2/3 left-1/5 transform -rotate-20 animate-float-reverse">
          <img 
            src="/assets/BNB.svg" 
            alt="BNB" 
            className="w-18 h-18 md:w-20 md:h-20 lg:w-24 lg:h-24 opacity-50 hover:-rotate-20 transition-transform duration-700 drop-shadow-md"
            style={{ filter: 'drop-shadow(0 12px 25px rgba(245, 158, 11, 0.2))' }}
          />
        </div>

        {/* POL Icon - Accent */}
        <div className="absolute bottom-1/4 left-1/3 transform rotate-45 animate-float-gentle">
          <img 
            src="/assets/Poly.svg" 
            alt="Polygon" 
            className="w-16 h-16 md:w-18 md:h-18 lg:w-20 lg:h-20 opacity-45 hover:rotate-45 transition-transform duration-700 drop-shadow-sm"
            style={{ filter: 'drop-shadow(0 10px 20px rgba(139, 69, 19, 0.2))' }}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex flex-col items-center text-center justify-start min-h-[calc(90vh-64px)] pt-8">
          {/* Main Content - Minimal */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight relative z-20">
                <span className="text-yellow-400">Play.</span> <span className="text-white">Compete.</span> <span className="text-yellow-400">Earn.</span>
              </h1>

              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed mx-auto relative z-20">
                The ultimate Web3 play-to-earn gaming platform where <span className="text-yellow-400 font-semibold">your gaming skills unlock bigger rewards</span>. 
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-left justify-center relative z-20">
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
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;