import React from 'react';
import { Trophy, Medal, Award, ArrowRight } from 'lucide-react';

const LeaderboardPreview = () => {
  const topPlayers = [
    {
      rank: 1,
      player: 'CryptoKing',
      xp: 15420,
      gamesPlayed: 234,
      winRate: 87,
      avatar: '👑'
    },
    {
      rank: 2,
      player: 'DiamondHands',
      xp: 12890,
      gamesPlayed: 198,
      winRate: 82,
      avatar: '💎'
    },
    {
      rank: 3,
      player: 'MoonShot',
      xp: 11250,
      gamesPlayed: 176,
      winRate: 79,
      avatar: '🚀'
    }
  ];

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-yellow-600" />;
      default:
        return <span className="text-gray-400 font-bold">#{rank}</span>;
    }
  };

  return (
    <section className="py-20 bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Top <span className="text-yellow-400">Champions</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            See who's dominating the leaderboards. Climb the ranks and earn your place among the elite.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Leaderboard Table */}
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl overflow-hidden shadow-2xl">
            {/* Table Header */}
            <div className="bg-yellow-400/10 border-b border-yellow-400/20 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-yellow-400 uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-2">XP</div>
                <div className="col-span-2">Games</div>
                <div className="col-span-2">Win Rate</div>
                <div className="col-span-1">Streak</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800">
              {topPlayers.map((player, index) => (
                <div
                  key={player.rank}
                  className="px-6 py-6 hover:bg-yellow-400/5 transition-colors duration-200"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Rank */}
                    <div className="col-span-1 flex items-center justify-center">
                      {getRankIcon(player.rank)}
                    </div>

                    {/* Player */}
                    <div className="col-span-4 flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center text-lg">
                        {player.avatar}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{player.player}</div>
                        <div className="text-sm text-gray-400">Level {Math.floor(player.xp / 1000)}</div>
                      </div>
                    </div>

                    {/* XP */}
                    <div className="col-span-2">
                      <div className="font-bold text-white">{player.xp.toLocaleString()}</div>
                      <div className="text-sm text-gray-400">XP</div>
                    </div>

                    {/* Games Played */}
                    <div className="col-span-2">
                      <div className="font-bold text-white">{player.gamesPlayed}</div>
                      <div className="text-sm text-gray-400">Games</div>
                    </div>

                    {/* Win Rate */}
                    <div className="col-span-2">
                      <div className="font-bold text-green-400">{player.winRate}%</div>
                      <div className="text-sm text-gray-400">Win Rate</div>
                    </div>

                    {/* Streak */}
                    <div className="col-span-1">
                      <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-green-400 font-bold text-sm">🔥</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View More Button */}
            <div className="bg-gray-900/50 px-6 py-6 text-center border-t border-gray-800">
              <button className="group inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-200">
                <span>View Full Leaderboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">2,547</div>
              <div className="text-gray-300">Active Players</div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">$127K</div>
              <div className="text-gray-300">Total Rewards Paid</div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">45,892</div>
              <div className="text-gray-300">Games Played Today</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;