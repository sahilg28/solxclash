import React from 'react';
import { TrendingUp, Gamepad2, Crown, Brain, Target, Zap, Users, Trophy } from 'lucide-react';

const FeaturedGame = () => {
  return (
    <section className="py-20 bg-gradient-to-b from-purple-900/30 via-purple-900/10 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Featured <span className="text-yellow-400">Games</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Two distinct gaming experiences, one unified earning ecosystem. Choose your path to victory.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* CryptoClash Game Card */}
          <div className="relative bg-gradient-to-br from-purple-900/40 to-black/80 backdrop-blur-xl border border-purple-400/30 rounded-3xl p-6 lg:p-8 shadow-2xl animate-scale-in">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-yellow-400/10 rounded-3xl blur-xl"></div>
            
            <div className="relative z-10">
              {/* Game Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">CryptoClash</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm font-medium">Beta Live</span>
                    </div>
                  </div>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-full px-3 py-1">
                  <span className="text-green-400 text-xs font-semibold">ONGOING</span>
                </div>
              </div>

              {/* Game Image */}
              <div className="mb-6">
                <div className="bg-black/60 backdrop-blur-sm border border-purple-400/30 rounded-xl p-3 card-hover">
                  <img
                    src="/assets/Screenshot 2025-06-28 210140.png"
                    alt="CryptoClash Game Interface"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Game Description */}
              <div className="space-y-4 mb-6">
                <p className="text-gray-300 leading-relaxed">
                  Master the art of crypto prediction. Select your favorite coin, analyze market trends, and predict whether prices will rise or fall. 
                  <span className="text-yellow-400 font-semibold"> Earn XP with every correct prediction</span> and climb the global leaderboards.
                </p>
                
                <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-400 font-semibold text-sm">Predict-to-Earn  in development</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Stay tuned for enhanced play-to-earn mechanics and onchain gaming integration... coming soon!
                  </p>
                </div>

                {/* Game Features */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Real-time prediction</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">XP rewards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">Global leaderboards</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">Skill-up Crypto Knowledge</span>
                  </div>
                </div>
              </div>

              <button 
                className="w-full group btn-primary flex items-center justify-center space-x-2"
                onClick={() => window.location.href='/cryptoclash'}>
                <Gamepad2 className="w-5 h-5" />
                <span>Play CryptoClash</span>
              </button>
            </div>
          </div>

          {/* ChessClash Game Card */}
          <div className="relative bg-gradient-to-br from-blue-900/40 to-black/80 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-6 lg:p-8 shadow-2xl animate-scale-in">
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-3xl blur-xl"></div>
            
            <div className="relative z-10">
              {/* Game Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center">
                    <Crown className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">ChessClash</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-blue-400 text-sm font-medium">Coming Soon</span>
                    </div>
                  </div>
                </div>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-full px-3 py-1">
                  <span className="text-blue-400 text-xs font-semibold">PROTOTYPE</span>
                </div>
              </div>

              {/* Game Image */}
              <div className="mb-6">
                <div className="bg-black/60 backdrop-blur-sm border border-blue-400/30 rounded-xl p-3 card-hover">
                  <img
                    src="/assets/download.jpeg"
                    alt="ChessClash Strategic Gaming"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              </div>

              {/* Game Description */}
              <div className="space-y-4 mb-6">
                <p className="text-gray-300 leading-relaxed">
                  Engage in strategic chess battles against our advanced AI. Choose your bot difficulty, sharpen your tactical skills, and 
                  <span className="text-blue-400 font-semibold"> earn XP through masterful victories</span>. The ultimate test of strategic thinking.
                </p>
                
                <div className="bg-blue-400/10 border border-blue-400/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-400 font-semibold text-sm">Strategic Mastery</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    This is just a prototype. Full PvP play-to-earn mechanics with real rewards coming soon!
                  </p>
                </div>

                {/* Game Features */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-blue-400" />
                    <span className="text-gray-300">AI opponents</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Target className="w-4 h-4 text-green-400" />
                    <span className="text-gray-300">Skill-based XP</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Crown className="w-4 h-4 text-yellow-400" />
                    <span className="text-gray-300">Multiple difficulties</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-purple-400" />
                    <span className="text-gray-300">PvP coming soon</span>
                  </div>
                </div>
              </div>

              <button 
                className="w-full group bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                onClick={() => window.location.href='/chessclash'}>
                <Crown className="w-5 h-5" />
                <span>Play ChessClash</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="text-center mt-16 animate-fade-in-up">
          <div className="bg-gradient-to-r from-purple-400/10 to-yellow-400/10 border border-purple-400/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Two Games, One Earning Ecosystem
            </h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Whether you're a market analyst or strategic mastermind, SolxClash rewards your unique skills. 
              Start earning today and shape the future of skill-based gaming.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.href = '/cryptoclash'}
                className="btn-primary"
              >
                Start Earning Now
              </button>
              <button 
                onClick={() => {
                  const section = document.getElementById('waitlist');
                  if (section) section.scrollIntoView({ behavior: 'smooth' });
                }}
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

export default FeaturedGame;