import React from 'react';
import ScrollVelocityText from './ScrollVelocityText';

const Hero = () => {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-b from-black via-purple-900/30 to-black text-white pt-16 flex items-start relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex flex-col items-center text-center justify-start min-h-[calc(90vh-64px)] pt-8">
          {/* Main Content - Bold and Engaging */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-8xl font-black leading-tight tracking-tight">
                <span className="block text-yellow-400 drop-shadow-2xl">SolxClash:</span>
                <span className="block text-white mt-2">Where</span>
                <span className="block">
                  <span className="text-yellow-400">Gamers</span>{' '}
                  <span className="text-white">Compete,</span>
                </span>
                <span className="block">
                  <span className="text-yellow-400">Strategies</span>{' '}
                  <span className="text-white">Win,</span>
                </span>
                <span className="block text-white">and</span>
                <span className="block">
                  <span className="text-yellow-400">Web3</span>{' '}
                  <span className="text-white">Unlocks</span>
                </span>
                <span className="block text-yellow-400">the Future.</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-300 max-w-4xl leading-relaxed mx-auto font-medium">
                The ultimate gaming platform where <span className="text-yellow-400 font-bold">your skills unlock bigger rewards</span>. 
                Compete globally, earn through gameplay, and shape the future of Web3 gaming.
              </p>
            </div>

            {/* Enhanced CTAs */}
            <div className="flex flex-col sm:flex-row gap-6 animate-slide-in-left justify-center pt-8">
              <button
                onClick={() => scrollToSection('featured-games')}
                className="group relative bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-10 py-5 rounded-2xl font-bold text-xl hover:from-yellow-300 hover:to-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-yellow-400/25"
              >
                <span className="relative z-10 flex items-center justify-center space-x-3">
                  <span>Play Now</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-300 to-yellow-400 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>

              <button
                onClick={() => scrollToSection('waitlist')}
                className="group relative border-2 border-yellow-400 text-yellow-400 px-10 py-5 rounded-2xl font-bold text-xl hover:bg-yellow-400 hover:text-black focus:outline-none focus:ring-4 focus:ring-yellow-400/30 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-yellow-400/25"
              >
                <span className="relative z-10 flex items-center justify-center space-x-3">
                  <span>Join Waitlist</span>
                  <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-yellow-400 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </button>
            </div>

            {/* Additional engagement elements */}
            <div className="pt-12 space-y-4">
              <div className="flex items-center justify-center space-x-8 text-sm md:text-base text-gray-400">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Live Gaming</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse delay-300"></div>
                  <span>Real Rewards</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse delay-700"></div>
                  <span>Web3 Powered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Velocity Text Animation - Full Screen Width */}
      <div className="absolute bottom-2 md:bottom-20 left-0 right-0 w-screen pointer-events-none">
        <ScrollVelocityText
          texts={[' COMPETE.', 'WIN.', 'EARN.']}
          velocity={50}
          className="text-8xl lg:text-9xl font-black text-white/20 select-none"
          damping={100}
          stiffness={1000}
          numCopies={6}
          velocityMapping={{ input: [0, 1000], output: [0, 1.5] }}
          parallaxStyle={{
            maskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 15%, black 85%, transparent)',
          }}
        />
      </div>
    </section>
  );
};

export default Hero;