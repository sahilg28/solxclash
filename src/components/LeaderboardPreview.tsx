import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, ArrowRight } from 'lucide-react';
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
        .limit(3);

      if (error) {
        console.error('Error fetching top players:', error);
        return;
      }

      // Process the data to add rank, win rate, and level
      const processedData: LeaderboardEntry[] = data.map((profile, index) => ({
        ...profile,
        rank: index + 1,
        winRate: profile.games_played > 0 ? Math.round((profile.wins / profile.games_played) * 100) : 0,
        level: Math.floor(profile.xp / 1000) + 1
      }));

      setTopPlayers(processedData);
    } catch (error) {
      console.error('❌ Failed to fetch top players:', error);
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

  if (loading) {
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
            <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-400">Loading top players...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

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
                <div className="col-span-3">Win Rate</div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-800">
              {topPlayers.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No players found</p>
                </div>
              ) : (
                topPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="px-6 py-6 hover:bg-yellow-400/5 transition-colors duration-200"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Rank */}
                      <div className="col-span-1 flex items-center justify-center">
                        {getRankIcon(player.rank)}
                      </div>

                      {/* Player */}
                      <div className="col-span-4 flex items-center space-x-3">
                        <div className="relative">
                          {player.avatar_url ? (
                            <img
                              src={player.avatar_url}
                              alt={player.full_name || player.username}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center border-2 border-gray-600">
                              <span className="text-yellow-400 font-bold text-lg">
                                {(player.full_name || player.username).charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{player.full_name || player.username}</div>
                          <div className="text-sm text-gray-400">@{player.username}</div>
                        </div>
                      </div>

                      {/* XP */}
                      <div className="col-span-2">
                        <div className="font-bold text-white">{player.xp.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">Level {player.level}</div>
                      </div>

                      {/* Games Played */}
                      <div className="col-span-2">
                        <div className="font-bold text-white">{player.games_played}</div>
                        <div className="text-sm text-gray-400">{player.wins} wins</div>
                      </div>

                      {/* Win Rate */}
                      <div className="col-span-3">
                        <div className="font-bold text-green-400">{player.winRate}%</div>
                        <div className="text-sm text-gray-400">Win Rate</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* View More Button */}
            <div className="bg-gray-900/50 px-6 py-6 text-center border-t border-gray-800">
              <Link
                to="/leaderboard"
                className="group inline-flex items-center space-x-2 text-yellow-400 hover:text-yellow-300 font-semibold transition-colors duration-200"
              >
                <span>View Full Leaderboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">{topPlayers.length > 0 ? topPlayers.reduce((sum, player) => sum + 1, 0) : 0}</div>
              <div className="text-gray-300">Top Players</div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {topPlayers.length > 0 ? topPlayers.reduce((sum, player) => sum + player.xp, 0).toLocaleString() : '0'}
              </div>
              <div className="text-gray-300">Total XP Earned</div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-2">
                {topPlayers.length > 0 ? topPlayers.reduce((sum, player) => sum + player.games_played, 0) : 0}
              </div>
              <div className="text-gray-300">Games Played</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LeaderboardPreview;