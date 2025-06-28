import React from 'react';
import { Link } from 'react-router-dom';
import { Gamepad2, ArrowRight } from 'lucide-react';

const Hero = () => {
  const scrollToWaitlist = () => {
    const section = document.getElementById('waitlist');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-black via-yellow-900/10 to-black text-white pt-16 flex items-center relative overflow-hidden">
      {/* Subtle background grid pattern with yellow tint */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(250, 204, 21, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(250, 204, 21, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Yellow gradient overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-900/5 to-yellow-900/10"></div>

      {/* Animated background elements with yellow theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex flex-col items-center text-center justify-center min-h-[calc(100vh-64px)]">
          
          {/* Welcome badge */}
          <div className="inline-flex items-center px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-8 animate-fade-in-up">
            <span className="text-yellow-400 text-sm font-medium">
              Welcome to the Future of Gaming
            </span>
          </div>

          {/* Main headline */}
          <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-5xl">
              <span className="text-white">Play.</span>{' '}
              <span className="text-white">Compete.</span>{' '}
              <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                Earn.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              The ultimate Web3 gaming platform where your gaming skills unlock bigger rewards.
            </p>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <Link
              to="/cryptoclash"
              className="group bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-300 hover:to-yellow-400 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2 shadow-lg hover:shadow-yellow-400/25"
            >
              <span>Start Playing</span>
            </Link>

            <button
              onClick={scrollToWaitlist}
              className="group border-2 border-yellow-400/30 text-yellow-400 px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400/10 hover:border-yellow-400 transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <span>Join Waitlist</span>
            </button>
          </div>
              
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;