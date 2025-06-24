import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { User, Mail, Edit3, Save, X, Check, AlertCircle, Trophy, Target, Zap, MapPin, Flame } from 'lucide-react';
import { useAuthContext } from '../components/AuthProvider';
import { supabase, Profile } from '../lib/supabase';
import { getLevel, getXpForNextLevel, getXpProgress } from '../lib/levelSystem';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const { user, profile: currentUserProfile } = useAuthContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    email: '',
    country: '',
    twitter_username: '',
  });

  const isOwnProfile = currentUserProfile?.username === username;

  useEffect(() => {
    fetchProfile();
  }, [username]);

  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        email: profile.email || '',
        country: profile.country || '',
        twitter_username: profile.twitter_username || '',
      });
    }
  }, [profile]);

  const fetchProfile = async () => {
    if (!username) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        setError('Profile not found');
        return;
      }

      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.username.trim()) {
        throw new Error('Username is required');
      }

      if (formData.username !== profile.username) {
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', formData.username)
          .neq('id', profile.id)
          .single();

        if (existingUser) {
          throw new Error('Username is already taken');
        }
      }

      const cleanTwitterUsername = formData.twitter_username.trim().replace(/^@/, '');

      const updateData = {
        full_name: formData.full_name.trim() || null,
        username: formData.username.trim(),
        country: formData.country.trim() || null,
        twitter_username: cleanTwitterUsername || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;

      setProfile({
        ...profile,
        full_name: formData.full_name.trim() || null,
        username: formData.username.trim(),
        country: formData.country.trim() || null,
        twitter_username: cleanTwitterUsername || null,
        updated_at: new Date().toISOString(),
      });

      setSuccess('Profile updated successfully!');
      setEditing(false);

      if (formData.username !== username) {
        window.history.replaceState(null, '', `/profile/${formData.username}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        username: profile.username || '',
        email: profile.email || '',
        country: profile.country || '',
        twitter_username: profile.twitter_username || '',
      });
    }
    setEditing(false);
    setError(null);
    setSuccess(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-screen bg-black">
        <Header />
        <div className="pt-16 flex items-center justify-center min-h-screen">
          <div className="text-center max-w-md mx-auto px-4">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Profile Not Found</h1>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={() => window.history.back()}
              className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const level = getLevel(profile.xp);
  const nextLevelXp = getXpForNextLevel(profile.xp);
  const currentLevelProgress = getXpProgress(profile.xp);
  const winRate = profile.games_played > 0 ? Math.round((profile.wins / profile.games_played) * 100) : 0;

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-gradient-to-br from-gray-900/80 to-black/80 backdrop-blur-xl border border-yellow-400/20 rounded-2xl p-8 mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || profile.username}
                    className="w-24 h-24 rounded-full object-cover border-2 border-yellow-400/20"
                  />
                ) : (
                  <div className="w-24 h-24 bg-yellow-400/20 rounded-full flex items-center justify-center">
                    <User className="w-12 h-12 text-yellow-400" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profile.full_name || profile.username || 'Anonymous User'}
                  </h1>
                  <p className="text-gray-400 mb-2">@{profile.username}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Level {level}</span>
                    <span>•</span>
                    <span>{profile.xp} XP</span>
                    <span>•</span>
                    <span>Joined {new Date(profile.created_at).toLocaleDateString()}</span>
                    {profile.country && (
                      <>
                        <span>•</span>
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{profile.country}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {isOwnProfile && (
                <div className="flex items-center space-x-3">
                  {!editing ? (
                    <button
                      onClick={() => setEditing(true)}
                      className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>Edit Profile</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-500 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        <span>{saving ? 'Saving...' : 'Save'}</span>
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={saving}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-500 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <Check className="w-5 h-5 text-green-400" />
                <span className="text-green-400">{success}</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400">{error}</span>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-3xl font-bold text-yellow-400 mb-2">{profile.xp}</div>
              <div className="text-gray-300 text-sm">Total XP</div>
              <div className="mt-2">
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(currentLevelProgress / 500) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {currentLevelProgress}/500 to Level {level + 1}
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-blue-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-blue-400 mb-2">{profile.games_played}</div>
              <div className="text-gray-300 text-sm">Games Played</div>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-green-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-green-400 mb-2">{profile.wins}</div>
              <div className="text-gray-300 text-sm">Wins</div>
              <div className="text-xs text-gray-500 mt-1">{winRate}% win rate</div>
            </div>

            <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-6 text-center">
              <div className="w-12 h-12 bg-red-400/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Flame className="w-6 h-6 text-red-400" />
              </div>
              <div className="text-3xl font-bold text-red-400 mb-2">{profile.daily_play_streak}</div>
              <div className="text-gray-300 text-sm">Daily Streak</div>
              <div className="text-xs text-gray-500 mt-1">
                {profile.daily_play_streak >= 7 ? 'Reward earned!' : `${7 - profile.daily_play_streak} days to 300 XP`}
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Profile Information</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                    {profile.full_name || <span className="text-gray-500">Not provided</span>}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username <span className="text-red-400">*</span>
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                    placeholder="Enter your username"
                    required
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                    @{profile.username}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email <span className="text-red-400">*</span>
                </label>
                <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span>{profile.email || <span className="text-gray-500">Not provided</span>}</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Email cannot be changed once set during signup</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Country
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                    placeholder="Enter your country"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{profile.country || <span className="text-gray-500">Not provided</span>}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Twitter/X Profile
                </label>
                {editing ? (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">@</span>
                    <input
                      type="text"
                      value={formData.twitter_username}
                      onChange={(e) => setFormData({ ...formData, twitter_username: e.target.value })}
                      className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                      placeholder="your_twitter_username"
                    />
                  </div>
                ) : (
                  <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>
                      {profile.twitter_username ? (
                        <a
                          href={`https://x.com/${profile.twitter_username}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 transition-colors duration-200"
                        >
                          @{profile.twitter_username}
                        </a>
                      ) : (
                        <span className="text-gray-500">Not provided</span>
                      )}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Profile Picture
                </label>
                <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {profile.avatar_url ? 'Synced from Google account' : 'No profile picture'}
                  </span>
                  {profile.avatar_url && (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Member Since
                </label>
                <div className="px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white">
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default ProfilePage;