import React, { useState } from 'react';
import { useAuthContext } from '../components/AuthProvider';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AuthButtons from '../components/AuthButtons';
import ChessClash from '../components/ChessClash';
import { Zap, Crown, Target, Clock, Cpu, User, Trophy, Brain } from 'lucide-react';

const ChessClashPage = () => {
  const { user, profile, loading } = useAuthContext();
  const [gameConfig, setGameConfig] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');

  const difficulties = [
    { 
      value: 'easy', 
      label: 'Easy', 
      description: 'Casual play with some random moves',
      xpCost: 20,
      xpWin: 40,
      icon: <Target className="w-5 h-5" />,
      color: 'text-green-400'
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      description: 'Balanced strategy and tactical play',
      xpCost: 30,
      xpWin: 60,
      icon: <Brain className="w-5 h-5" />,
      color: 'text-yellow-400'
    },
    { 
      value: 'hard', 
      label: 'Hard', 
      description: 'Advanced AI with deep calculation',
      xpCost: 50,
      xpWin: 100,
      icon: <Crown className="w-5 h-5" />,
      color: 'text-red-400'
    }
  ];

  const handleStartGame = () => {
    // Always set player to white and bot to black
    setGameConfig({
      difficulty: selectedDifficulty,
      playerColor: 'white',
      xpCost: difficulties.find(d => d.value === selectedDifficulty)?.xpCost || 30
    });
  };

  const handleBackToSetup = () => {
    setGameConfig(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 min-h-screen flex items-center justify-center">
          <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 animate-scale-in">
              <div className="mb-6">
                <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-4"/>
                <h1 className="text-3xl font-bold text-white mb-4">
                  Ready to play <span className="text-yellow-400">ChessClash?</span>
                </h1>
                <p className="text-gray-300 mb-6">
                  Get <span className="text-yellow-400 font-semibold">100 XP bonus</span> on signup and start competing!
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  Sign up first to play ChessClash!
                </p>
              </div>
              <div className="flex items-center justify-center">
                <AuthButtons />
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // If game is configured, show the chess game
  if (gameConfig) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <main className="pt-16 min-h-screen">
          <ChessClash 
            profile={profile} 
            gameConfig={gameConfig}
            onBackToSetup={handleBackToSetup}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Show game setup interface
  return (
    <div className="min-h-screen bg-black">
      <Header />
      <div className="pt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              <span className="text-yellow-400">Chess</span>Clash
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8 ">
              Play against our AI, sharpen your strategy, win XPs and climb the ranks.
            </p>
            
            {/* Player Stats */}
            <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || profile.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                      <span className="text-yellow-400 font-bold">
                        {(profile.full_name || profile.username).charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-semibold text-white">{profile.full_name || profile.username}</div>
                    <div className="text-sm text-gray-400">Level {Math.floor(profile.xp / 500) + 1}</div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="text-yellow-400 font-bold">{profile.xp}</div>
                    <div className="text-gray-400">XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-green-400 font-bold">{profile.wins}</div>
                    <div className="text-gray-400">Wins</div>
                  </div>
                  <div className="text-center">
                    <div className="text-blue-400 font-bold">
                      {profile.games_played > 0 ? Math.round((profile.wins / profile.games_played) * 100) : 0}%
                    </div>
                    <div className="text-gray-400">Win Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-4xl mx-auto">
            {/* Game Configuration */}
            <div className="space-y-8 animate-slide-in-left">
              
              {/* Game Parameters Display */}
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <Cpu className="w-6 h-6 text-yellow-400 mr-3" />
                  Play with Bot
                </h2>
                
                {/* Fixed Game Parameters */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                    <Clock className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Timeframe</h3>
                    <p className="text-blue-400 font-bold">10 min round</p>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-center">
                    <User className="w-8 h-8 text-green-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">User Side</h3>
                    <p className="text-green-400 font-bold">White</p>
                    <p className="text-gray-400 text-sm">You move first</p>
                  </div>
                  
                  <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                    <Cpu className="w-8 h-8 text-red-400 mx-auto mb-3" />
                    <h3 className="text-lg font-semibold text-white mb-2">Bot</h3>
                    <p className="text-red-400 font-bold">Black</p>
                    <p className="text-gray-400 text-sm">AI opponent</p>
                  </div>
                </div>

                {/* Choose Mode Section */}
                <div className="border-t border-gray-700 pt-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Target className="w-5 h-5 text-yellow-400 mr-2" />
                    Choose Mode
                  </h3>
                  <div className="space-y-4">
                    {difficulties.map((difficulty) => (
                      <button
                        key={difficulty.value}
                        onClick={() => setSelectedDifficulty(difficulty.value)}
                        className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                          selectedDifficulty === difficulty.value
                            ? 'bg-yellow-400/10 border-yellow-400 shadow-lg'
                            : 'bg-gray-800/50 border-gray-700 hover:border-yellow-400/50 hover:bg-yellow-400/5'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`${difficulty.color}`}>
                              {difficulty.icon}
                            </div>
                            <span className="font-semibold text-white text-lg">{difficulty.label}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Cost</div>
                            <div className="text-yellow-400 font-bold">{difficulty.xpCost} XP</div>
                          </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-3">{difficulty.description}</p>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-400">Win Reward:</span>
                          <span className="text-green-400 font-semibold">{difficulty.xpWin} XP</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={handleStartGame}
                disabled={profile.xp < (difficulties.find(d => d.value === selectedDifficulty)?.xpCost || 30)}
                className="w-full bg-yellow-400 text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 focus:outline-none focus:ring-4 focus:ring-yellow-400/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3 transform hover:scale-105"
              >
                <Zap className="w-6 h-6" />
                <span>Start Chess Battle</span>
              </button>

              {profile.xp < (difficulties.find(d => d.value === selectedDifficulty)?.xpCost || 30) && (
                <div className="text-center text-red-400 text-sm">
                  Not enough XP for this difficulty. You need {difficulties.find(d => d.value === selectedDifficulty)?.xpCost} XP.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ChessClashPage;