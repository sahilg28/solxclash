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
    <section className="min-h-screen bg-black text-white pt-16 flex items-start relative overflow-hidden">
      {/* Aurora Background Effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary Aurora Layer */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-blue-500/10 to-cyan-400/15 animate-pulse"></div>
        
        {/* Secondary Aurora Layer */}
        <div className="absolute inset-0 bg-gradient-to-tl from-yellow-400/10 via-purple-500/15 to-pink-500/10 animate-pulse delay-1000"></div>
        
        {/* Tertiary Aurora Layer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/5 to-transparent animate-pulse delay-2000"></div>
        
        {/* Moving Aurora Waves */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-0 w-full h-32 bg-gradient-to-r from-transparent via-purple-400/20 to-transparent transform -skew-y-12 animate-aurora-wave"></div>
          <div className="absolute top-1/2 left-0 w-full h-24 bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent transform skew-y-6 animate-aurora-wave-reverse"></div>
          <div className="absolute top-3/4 left-0 w-full h-20 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent transform -skew-y-3 animate-aurora-wave delay-1000"></div>
        </div>
        
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-400/8 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/6 rounded-full blur-3xl animate-float-delayed"></div>
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-cyan-400/8 rounded-full blur-3xl animate-float delay-500"></div>
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-pink-400/6 rounded-full blur-3xl animate-float-delayed delay-700"></div>
        
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/2 to-transparent animate-shimmer-slow"></div>
      </div>

      {/* Dark Overlay for Text Readability */}
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="flex flex-col items-center text-center justify-start min-h-[calc(90vh-64px)] pt-8">
          {/* Main Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-6">
              <h1 className="text-6xl lg:text-8xl font-bold leading-tight drop-shadow-2xl">
                <span className="text-yellow-400 drop-shadow-lg">Enter</span> <span className="text-white drop-shadow-lg">the</span> <span className="text-yellow-400 drop-shadow-lg">Clash</span>
              </h1>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 animate-slide-in-left justify-center">
              <button
                onClick={() => scrollToSection('featured-games')}
                className="group btn-primary flex items-center justify-center space-x-2 shadow-2xl hover:shadow-yellow-400/25">
                <span>Try Now</span>
              </button>

              <button
                onClick={() => scrollToSection('waitlist')}
                className="btn-secondary shadow-2xl hover:shadow-yellow-400/25"
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