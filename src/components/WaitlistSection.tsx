import React, { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
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
    <section id="waitlist" className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      {/* Subtle bottom glow effect */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-purple-900/30 to-transparent pointer-events-none"></div>
      
      {/* Crypto Coins in 4 Corners - Hidden on Mobile */}
      {/* Top Left - BTC */}
      <div className="hidden md:block absolute top-12 left-12 md:top-20 md:left-24 lg:top-16 lg:left-20 transform -rotate-12 animate-float">
        <img 
          src="/assets/BTC.svg" 
          alt="Bitcoin" 
          className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 opacity-60 hover:opacity-80 transition-opacity duration-300"
        />
      </div>

      {/* Top Right - ETH */}
      <div className="hidden md:block absolute top-16 right-8 md:top-24 md:right-20 lg:top-20 lg:right-16 transform rotate-12 animate-float-delayed">
        <img 
          src="/assets/ETH.svg" 
          alt="Ethereum" 
          className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 opacity-60 hover:opacity-80 transition-opacity duration-300"
        />
      </div>

      {/* Bottom Left - SOL */}
      <div className="hidden md:block absolute bottom-16 left-8 md:bottom-20 md:left-16 lg:bottom-24 lg:left-12 transform rotate-12 animate-float">
        <img 
          src="/assets/SOL.svg" 
          alt="Solana" 
          className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 opacity-60 hover:opacity-80 transition-opacity duration-300"
        />
      </div>

      {/* Bottom Right - POL */}
      <div className="hidden md:block absolute bottom-12 right-16 md:bottom-24 md:right-12 lg:bottom-20 lg:right-24 transform -rotate-12 animate-float-delayed">
        <img 
          src="/assets/Poly.svg" 
          alt="Polygon" 
          className="w-20 h-20 md:w-28 md:h-28 lg:w-32 lg:h-32 opacity-60 hover:opacity-80 transition-opacity duration-300"
        />
      </div>
      
      <div className="text-center relative z-10">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-5xl lg:text-6xl font-bold text-white mb-4">
            Good things come<br />
            to those <span className="italic text-yellow-400">who wait.</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Be among the first to experience the next generation of Web3 gaming where your skills unlock bigger rewards. Join our waitlist and get early access.
          </p>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex items-center gap-4 max-w-md mx-auto">
            <div className="flex-1">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your Email Address"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all duration-200"
                required
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading || success}
              className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
              ) : success ? (
                <Check className="w-5 h-5" />
              ) : (
                'Get Notified'
              )}
            </button>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mt-4 text-green-400 text-sm">
              🎉 Welcome to the revolution! We'll reach out with exclusive updates soon.
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 text-red-400 text-sm flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </div>
    </section>
  );
};

export default WaitlistSection;