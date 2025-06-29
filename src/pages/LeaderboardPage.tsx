import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, Target, Crown, Star, Search } from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';
import { getLevel } from '../lib/levelSystem';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface LeaderboardEntry extends Profile {
  rank: number;
  winRate: number;
  level: number;
}

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [filteredLeaderboard, setFilteredLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all');
  const playersPerPage = 10;

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredLeaderboard(leaderboard);
    } else {
      const filtered = leaderboard.filter(player =>
        player.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (player.full_name && player.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredLeaderboard(filtered);
    }
    setCurrentPage(1);
  }, [searchTerm, leaderboard]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(100);

      if (timeframe === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        query = query.gte('updated_at', weekAgo.toISOString());
      } else if (timeframe === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        query = query.gte('updated_at', monthAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        return;
      }

      const processedData: LeaderboardEntry[] = data.map((profile, index) => ({
        ...profile,
        rank: index + 1,
        winRate: profile.games_played > 0 ? Math.round((profile.wins / profile.games_played) * 100) : 0,
        level: getLevel(profile.xp)
      }));

      setLeaderboard(processedData);
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-300" />;
      case 3:
        return <Award className="w-6 h-6 text-yellow-600" />;
      default:
        return <span className="text-gray-400 font-bold text-lg">#{rank}</span>;
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
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400/30';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300/10 to-gray-500/10 border-gray-300/30';
    if (rank === 3) return 'bg-gradient-to-r from-yellow-600/10 to-yellow-800/10 border-yellow-600/30';
    return 'hover:bg-purple-800/50';
  };

  const totalPages = Math.ceil(filteredLeaderboard.length / playersPerPage);
  const startIndex = (currentPage - 1) * playersPerPage;
  const endIndex = startIndex + playersPerPage;
  const currentPlayers = filteredLeaderboard.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading leaderboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-yellow-400 mb-4">
              <span className="text-white">Leader</span>board
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
              See who's dominating the game. Will you be next?
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/80 to-black/80 backdrop-blur-xl border border-purple-400/20 rounded-2xl p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 md:gap-6">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search players by username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-purple-800/50 border border-purple-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                />
              </div>

              <div className="flex items-center space-x-2 w-full lg:w-auto justify-center lg:justify-end">
                {(['all', 'week', 'month'] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimeframe(period)}
                    className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize text-sm md:text-base ${
                      timeframe === period
                        ? 'bg-yellow-400 text-black'
                        : 'bg-purple-800 text-gray-300 hover:bg-purple-700'
                    }`}
                  >
                    {period === 'all' ? 'All Time' : `This ${period}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center mt-6 pt-6 border-t border-purple-700">
              <div>
                <div className="text-xl md:text-2xl font-bold text-yellow-400">{leaderboard.length}</div>
                <div className="text-xs md:text-sm text-gray-400">Total Players</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-green-400">
                  {leaderboard.reduce((sum, player) => sum + player.games_played, 0)}
                </div>
                <div className="text-xs md:text-sm text-gray-400">Total Games</div>
              </div>
              <div>
                <div className="text-xl md:text-2xl font-bold text-blue-400">
                  {leaderboard.reduce((sum, player) => sum + player.xp, 0).toLocaleString()}
                </div>
                <div className="text-xs md:text-sm text-gray-400">Total XP</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/80 to-black/80 backdrop-blur-xl border border-purple-400/20 rounded-2xl overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden md:block bg-purple-400/10 border-b border-purple-400/20 px-6 py-4">
              <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-purple-300 uppercase tracking-wider">
                <div className="col-span-1">Rank</div>
                <div className="col-span-4">Player</div>
                <div className="col-span-2">XP</div>
                <div className="col-span-2">Games</div>
                <div className="col-span-3">Win Rate</div>
              </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {currentPlayers.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {searchTerm ? 'No players found matching your search' : 'No players found for this timeframe'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-purple-800">
                  {currentPlayers.map((player) => (
                    <div
                      key={player.id}
                      className={`px-4 md:px-6 py-4 transition-all duration-200 border-l-4 border-transparent ${getRowStyle(player.rank)}`}
                    >
                      {/* Desktop Layout */}
                      <div className="hidden md:grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-1 flex items-center justify-center relative">
                          {getRankIcon(player.rank)}
                          {getRankBadge(player.rank)}
                        </div>

                        <div className="col-span-4 flex items-center space-x-3">
                          <div className="relative">
                            {player.avatar_url ? (
                              <img
                                src={player.avatar_url}
                                alt={player.full_name || player.username}
                                className="w-12 h-12 rounded-full object-cover border-2 border-purple-600"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center border-2 border-purple-600">
                                <span className="text-yellow-400 font-bold text-lg">
                                  {(player.full_name || player.username).charAt(0).toUpperCase()}
                                </span>
                              </div>
                            )}
                            {player.rank <= 3 && (
                              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                                <span className="text-black text-xs font-bold">{player.rank}</span>
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-white truncate">
                              {player.full_name || player.username}
                            </div>
                            <div className="text-sm text-gray-400 truncate">
                              @{player.username}
                            </div>
                          </div>
                        </div>

                        <div className="col-span-2">
                          <div className="font-bold text-yellow-400">{player.xp.toLocaleString()}</div>
                          <div className="text-sm text-gray-400">Level {player.level}</div>
                        </div>

                        <div className="col-span-2">
                          <div className="font-bold text-white">{player.games_played}</div>
                          <div className="text-sm text-gray-400">{player.wins} wins</div>
                        </div>

                        <div className="col-span-3">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-green-400" />
                            <div>
                              <div className={`font-bold ${
                                player.winRate >= 70 ? 'text-green-400' : 
                                player.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {player.winRate}%
                              </div>
                              <div className="text-xs text-gray-400">
                                {player.wins}/{player.games_played}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="md:hidden">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="relative flex items-center">
                            {getRankIcon(player.rank)}
                            {getRankBadge(player.rank)}
                          </div>
                          
                          <div className="flex items-center space-x-3 flex-1">
                            <div className="relative flex-shrink-0">
                              {player.avatar_url ? (
                                <img
                                  src={player.avatar_url}
                                  alt={player.full_name || player.username}
                                  className="w-12 h-12 rounded-full object-cover border-2 border-purple-600"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center border-2 border-purple-600">
                                  <span className="text-yellow-400 font-bold text-lg">
                                    {(player.full_name || player.username).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                              {player.rank <= 3 && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                                  <span className="text-black text-xs font-bold">{player.rank}</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="font-bold text-white text-base truncate flex items-center space-x-2">
                                <span>{player.full_name || player.username}</span>
                                {player.rank <= 3 && <span className="text-yellow-400">🏆</span>}
                              </div>
                              <div className="text-sm text-gray-400 truncate">
                                @{player.username}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Mobile Stats Row */}
                        <div className="grid grid-cols-3 gap-3 text-center">
                          <div className="bg-purple-900/30 rounded-lg p-2">
                            <div className="text-xs text-gray-400 mb-1">XP</div>
                            <div className="font-bold text-yellow-400 text-sm">{player.xp.toLocaleString()}</div>
                            <div className="text-xs text-gray-400">Level {player.level}</div>
                          </div>
                          
                          <div className="bg-purple-900/30 rounded-lg p-2">
                            <div className="text-xs text-gray-400 mb-1">Games</div>
                            <div className="font-bold text-white text-sm">{player.games_played}</div>
                            <div className="text-xs text-gray-400">{player.wins} wins</div>
                          </div>
                          
                          <div className="bg-purple-900/30 rounded-lg p-2">
                            <div className="flex items-center justify-center space-x-1 mb-1">
                              <Target className="w-4 h-4 text-green-400" />
                              <span className="text-xs text-gray-400">Win Rate</span>
                            </div>
                            <div className={`font-bold text-sm ${
                              player.winRate >= 70 ? 'text-green-400' : 
                              player.winRate >= 50 ? 'text-yellow-400' : 'text-red-400'
                            }`}>
                              {player.winRate}%
                            </div>
                            <div className="text-xs text-gray-400">{player.wins}/{player.games_played}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {totalPages > 1 && (
              <div className="bg-purple-900/50 border-t border-purple-700 px-4 md:px-6 py-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-400 text-center sm:text-left">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredLeaderboard.length)} of {filteredLeaderboard.length} players
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 rounded bg-purple-800 text-gray-300 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-1 rounded transition-colors duration-200 text-sm ${
                            currentPage === page
                              ? 'bg-yellow-400 text-black'
                              : 'bg-purple-800 text-gray-300 hover:bg-purple-700'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 rounded bg-purple-800 text-gray-300 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default LeaderboardPage;