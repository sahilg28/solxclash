import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, ArrowRight, Target, Zap, TrendingUp, Coins, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, Profile } from '../lib/supabase';

interface LeaderboardEntry extends Profile {
  rank: number;
  winRate: number;
  level: number;
}

const LeaderboardPreview = () => {
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopPlayers();
  }, []);

  const fetchTopPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(5);

      if (error) {
        return;
      }

      const processedData: LeaderboardEntry[] = data.map((profile, index) => ({
        ...profile,
        rank: index + 1,
        winRate: profile.games_played > 0 ? Math.round((profile.wins / profile.games_played) * 100) : 0,
        level: Math.floor(profile.xp / 500) + 1
      }));

      setTopPlayers(processedData);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

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

  const getRankBadge = (rank: number) => {
    if (rank <= 3) {
      return (
        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
          rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-gray-300' : 'bg-yellow-600'
        }`}>
          <Star className="w-4 h-4 text-black" />
        </div>
      );
    }
    return null;
  };

  const getRowStyle = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400/30 animate-glow';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300/10 to-gray-500/10 border-gray-300/30';
    if (rank === 3) return 'bg-gradient-to-r from-yellow-600/10 to-yellow-800/10 border-yellow-600/30';
    return 'hover:bg-purple-800/50';
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-purple-900/30 via-purple-900/10 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
              Top <span className="text-yellow-400">Earners</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See who's earning the most through skilled gameplay. Will you be next?
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-purple-900/40 to-black/80 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading top earners...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-purple-900/30 via-purple-900/10 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-purple-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16 animate-fade-in-up">
          <div className="inline-flex items-center px-6 py-3 bg-purple-400/10 border border-purple-400/20 rounded-full mb-6">
            <Coins className="w-5 h-5 text-purple-400 mr-2" />
            <span className="text-purple-400 font-semibold">Play-to-Earn Rankings</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Top <span className="text-yellow-400">Earners</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meet the players earning the most through skilled gameplay. 
            <span className="text-yellow-400 font-semibold"> Every game rewards, but skills multiply earnings</span> exponentially.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-purple-900/40 to-black/80 backdrop-blur-xl border border-purple-400/20 rounded-2xl overflow-hidden shadow-2xl animate-scale-in">
            
            {/* Redesigned Header with Better Layout */}
            <div className="bg-purple-400/10 border-b border-purple-400/20 px-6 py-8">
              {/* Table Headers */}
              <div className="hidden md:grid grid-cols-12 gap-4 items-center text-sm font-bold text-purple-300 uppercase tracking-wider">
                <div className="col-span-1 text-center">Rank</div>
                <div className="col-span-4">Top Earner</div>
                <div className="col-span-2 text-center">Level</div>
                <div className="col-span-2 text-center">XP Earned</div>
                <div className="col-span-3 text-center">Success Rate</div>
              </div>
            </div>

            {/* Player List */}
            <div className="divide-y divide-purple-800/50">
              {topPlayers.length === 0 ? (
                <div className="text-center py-16">
                  <Coins className="w-20 h-20 text-gray-600 mx-auto mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">No earners yet</h3>
                  <p className="text-gray-400">Be the first to start earning and claim the top spot!</p>
                </div>
              ) : (
                topPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className={`px-6 py-6 transition-all duration-300 border-l-4 border-transparent ${getRowStyle(player.rank)} animate-slide-in-left`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Rank */}
                      <div className="md:col-span-1 flex md:justify-center">
                        <div className="relative flex items-center space-x-3 md:space-x-0 md:justify-center">
                          {getRankIcon(player.rank)}
                          {getRankBadge(player.rank)}
                        </div>
                      </div>

                      {/* Player Info */}
                      <div className="md:col-span-4 flex items-center space-x-4">
                        <div className="relative flex-shrink-0">
                          {player.avatar_url ? (
                            <img
                              src={player.avatar_url}
                              alt={player.full_name || player.username}
                              className="w-14 h-14 rounded-full object-cover border-2 border-purple-400/30"
                            />
                          ) : (
                            <div className="w-14 h-14 bg-gradient-to-br from-yellow-400/20 to-purple-400/20 rounded-full flex items-center justify-center border-2 border-purple-400/30">
                              <span className="text-yellow-400 font-bold text-xl">
                                {(player.full_name || player.username).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          {player.rank === 1 && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Trophy className="w-3 h-3 text-black" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-bold text-white text-lg truncate flex items-center space-x-2">
                            <span>{player.full_name || player.username}</span>
                            {player.rank <= 3 && <span className="text-yellow-400">🏆</span>}
                          </div>
                          <div className="text-sm text-gray-400 truncate">
                            @{player.username}
                          </div>
                        </div>
                      </div>

                      {/* Level */}
                      <div className="md:col-span-2 text-center">
                        <div className="flex items-center justify-center md:justify-center space-x-2">
                          <Zap className="w-5 h-5 text-yellow-400" />
                          <div>
                            <div className="font-bold text-white text-lg">Level {player.level}</div>
                            <div className="text-xs text-gray-400">
                              {player.xp % 500}/500 XP
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* XP Earned */}
                      <div className="md:col-span-2 text-center">
                        <div className="font-bold text-yellow-400 text-lg">{player.xp.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">{player.games_played} games</div>
                      </div>

                      {/* Success Rate */}
                      <div className="md:col-span-3 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <Target className="w-5 h-5 text-green-400" />
                          <div>
                            <div className={`font-bold text-lg ${
                              player.winRate >= 70 ? 'text-green-400' : 
                              player.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {player.winRate}%
                            </div>
                            <div className="text-xs text-gray-400">
                              {player.wins}/{player.games_played} wins
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="bg-purple-900/50 px-6 py-6 text-center border-t border-purple-800/50">
              <Link
                to="/leaderboard"
                className="group inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-200 btn-secondary"
              >
                <TrendingUp className="w-5 h-5" />
                <span>View Full Leaderboard</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>

          {/* Stats Cards - Moved Outside the Leaderboard Table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 animate-slide-in-left">
            <div className="bg-gradient-to-br from-purple-900/60 to-black/60 backdrop-blur-sm border border-purple-700 rounded-xl p-6 text-center card-hover">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">{topPlayers.length}</div>
              <div className="text-gray-300 font-medium mb-1">Active Earners</div>
              <div className="text-sm text-gray-400">Players currently earning XP</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/60 to-black/60 backdrop-blur-sm border border-purple-700 rounded-xl p-6 text-center card-hover">
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">
                {topPlayers.reduce((sum, player) => sum + player.games_played, 0)}
              </div>
              <div className="text-gray-300 font-medium mb-1">Total Games Played</div>
              <div className="text-sm text-gray-400">Games played by top earners</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-900/60 to-black/60 backdrop-blur-sm border border-purple-700 rounded-xl p-6 text-center card-hover">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {topPlayers.length > 0 ? topPlayers.reduce((sum, player) => sum + player.xp, 0).toLocaleString() : '0'}
              </div>
              <div className="text-gray-300 font-medium mb-1">Total XP Earned</div>
              <div className="text-sm text-gray-400">Combined XP from top players</div>
            </div>
          </div>

      </div>
    </section>
  );
};

export default LeaderboardPreview;