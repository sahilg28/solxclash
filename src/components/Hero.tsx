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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex flex-col items-center text-center justify-start min-h-[calc(85vh-64px)] pt-4">
          {/* Main Content - Moved up with reduced spacing */}
          <div className="space-y-6 animate-fade-in-up">
            <div className="space-y-3">
              <h1 className="text-6xl lg:text-8xl font-black leading-tight uppercase tracking-wide">
                <span className="text-white">Join the future of</span> <span className="text-yellow-400">Web3 gaming</span>
              </h1>

              <p className="text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
                SolxClash is the gaming platform where players globally compete, earn rewards, and play their favorite games together.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-left justify-center">
              <button
                onClick={() => scrollToSection('featured-games')}
                className="group btn-primary flex items-center justify-center space-x-2">
                <span>Try Now</span>
              </button>

              <button
                onClick={() => scrollToSection('waitlist')}
                className="btn-secondary"
              >
                Join Waitlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Velocity Text Animation - Full Screen Width */}
      <div className="absolute bottom-2 md:bottom-20 left-0 right-0 w-screen pointer-events-none">
        <ScrollVelocityText
          texts={[' PLAY.', 'COMPETE.', 'EARN.']}
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