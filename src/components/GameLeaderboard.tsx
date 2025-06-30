import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Award, TrendingUp, Target, Zap, Crown, Star } from 'lucide-react';
import { supabase, Profile } from '../lib/supabase';
import { getLevel } from '../lib/levelSystem';

interface LeaderboardEntry extends Profile {
  rank: number;
  winRate: number;
  level: number;
}

const GameLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('xp', { ascending: false })
        .limit(50);

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
    } catch (error) {
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
    return 'hover:bg-gray-800/50';
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl overflow-hidden">
      <div className="bg-yellow-400/10 border-b border-yellow-400/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span>Live Leaderboard</span>
          </h2>
          
          <div className="flex items-center space-x-2">
            {(['all', 'week', 'month'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 capitalize ${
                  timeframe === period
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {period === 'all' ? 'All Time' : `This ${period}`}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-400">{leaderboard.length}</div>
            <div className="text-sm text-gray-400">Active Players</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">
              {leaderboard.reduce((sum, player) => sum + player.games_played, 0)}
            </div>
            <div className="text-sm text-gray-400">Total Games</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-400">
              {leaderboard.reduce((sum, player) => sum + player.xp, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-400">Total XP</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/50 border-b border-gray-700 px-6 py-4">
        <div className="grid grid-cols-12 gap-4 items-center text-sm font-semibold text-yellow-400 uppercase tracking-wider">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Player</div>
          <div className="col-span-2">Level</div>
          <div className="col-span-2">XP</div>
          <div className="col-span-2">Win Rate</div>
        </div>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No players found for this timeframe</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {leaderboard.map((player) => (
              <div
                key={player.id}
                className={`px-6 py-4 transition-all duration-200 border-l-4 border-transparent ${getRowStyle(player.rank)}`}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
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
                          className="w-12 h-12 rounded-full object-cover border-2 border-gray-600"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 rounded-full flex items-center justify-center border-2 border-gray-600">
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
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <div>
                        <div className="font-bold text-white">Level {player.level}</div>
                        <div className="text-xs text-gray-400">
                          {player.xp % 500}/500 XP
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="font-bold text-yellow-400">{player.xp.toLocaleString()}</div>
                    <div className="text-sm text-gray-400">{player.games_played} games</div>
                  </div>

                  <div className="col-span-2">
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
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gray-900/50 border-t border-gray-700 px-6 py-4 text-center">
        <p className="text-sm text-gray-400">
          Leaderboard updates in real-time • Last updated: {new Date().toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
};

export default GameLeaderboard;