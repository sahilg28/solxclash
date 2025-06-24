import React, { useState } from 'react';
import { Mail, Gift, Users, Clock, Check, AlertCircle } from 'lucide-react';
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
    <section className="py-20 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Join <span className="text-yellow-400">SolxClash</span>
            </h2>
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Be part of the next-gen Web3 gaming revolution. Sign up for early access to new game modes,
              on-chain features, and community perks.
            </p>
          </div>

          {/* Email Form */}
          <div className="mb-12">
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-200"
                    required
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="bg-yellow-400 text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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
                    <span>Join Waitlist</span>
                  )}
                </button>
              </div>

              {/* Success Message */}
              {success && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-green-400">
                    <Check className="w-5 h-5" />
                    <span>You're in! We’ll reach out with exclusive updates soon.</span>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span>{error}</span>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Gift className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Community Rewards</h3>
              <p className="text-gray-400">Unlock early perks, bonus XP, and access to test new game modes.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Shape the Platform</h3>
              <p className="text-gray-400">Your feedback helps drive feature development and direction.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Get Early Access</h3>
              <p className="text-gray-400">Try out SolxClash updates and game expansions before anyone else.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WaitlistSection;
