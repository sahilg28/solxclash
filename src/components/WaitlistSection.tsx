import React, { useState } from 'react';
import { Mail, Gift, Users, Clock, Check, AlertCircle, Zap, Target, Trophy, Coins, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';

const WaitlistSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error: insertError } = await supabase
        .from('waitlist_subscribers')
        .insert([{ email: email.trim() }]);

      if (insertError) {
        if (insertError.code === '23505') {
          throw new Error('Email is already on the waitlist');
        }
        throw insertError;
      }

      setSuccess(true);
      setEmail('');
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Waitlist signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to join waitlist');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="py-20 bg-gradient-to-b from-gray-900 via-yellow-900/20 to-black relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-yellow-400/3 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12 animate-fade-in-up">
            <div className="inline-flex items-center px-6 py-3 bg-yellow-400/10 border border-yellow-400/20 rounded-full mb-6">
              <Coins className="w-5 h-5 text-yellow-400 mr-2" />
              <span className="text-yellow-400 font-semibold">Join the Earning Revolution</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Shape the Future of <span className="text-yellow-400">Play-to-Earn Gaming</span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Be among the first to experience the next generation of Web3 games where 
              <span className="text-yellow-400 font-semibold"> everyone earns from playing</span> and 
              <span className="text-green-400 font-semibold"> skilled players earn exponentially more</span>. 
              Join our exclusive community and help shape the platform.
            </p>
          </div>

          {/* Email Form */}
          <div className="mb-12 animate-scale-in">
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus-enhanced transition-all duration-200"
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="btn-primary whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      <span>Joining...</span>
                    </>
                  ) : success ? (
                    <>
                      <Check className="w-5 h-5" />
                      <span>Joined!</span>
                    </>
                  ) : (
                    <span>Get Early Access</span>
                  )}
                </button>
              </div>

              {/* Success Message */}
              {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 animate-fade-in-up">
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span>🎉 Welcome to the earning revolution! We'll reach out with exclusive updates soon.</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 animate-fade-in-up">
                  <div className="flex items-center justify-center space-x-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Enhanced Benefits */}
          <div className="grid md:grid-cols-3 gap-8 animate-slide-in-left">
            <div className="text-center group">
              <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-400/20 transition-colors duration-300 card-hover">
                <Gift className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Exclusive Early Access</h3>
              <p className="text-gray-400">Be the first to play new earning games and features before public launch. Get a head start on building your earnings.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-400/20 transition-colors duration-300 card-hover">
                <Users className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Shape Earning Mechanics</h3>
              <p className="text-gray-400">Your feedback directly influences reward systems, earning rates, and the overall direction of SolxClash's play-to-earn features.</p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-yellow-400/20 transition-colors duration-300 card-hover">
                <Star className="w-10 h-10 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Founder Earning Benefits</h3>
              <p className="text-gray-400">Special earning bonuses, exclusive tournaments with higher rewards, and potential early access to premium earning features.</p>
            </div>
          </div>

          {/* Community Stats Preview */}
          <div className="mt-16 bg-gradient-to-r from-gray-900/60 to-black/60 backdrop-blur-sm border border-gray-700 rounded-xl p-8 animate-fade-in-up">
            <h3 className="text-xl font-bold text-white mb-6">Join a Growing Community of Earning Players</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">500+</div>
                <div className="text-sm text-gray-400">Early Earners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400 mb-1">2</div>
                <div className="text-sm text-gray-400">Earning Games</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">100%</div>
                <div className="text-sm text-gray-400">Players Earn</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400 mb-1">2x</div>
                <div className="text-sm text-gray-400">Skill Multiplier</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;