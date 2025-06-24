import React, { useState } from 'react';
import { Zap, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Insert email into newsletter_subscribers table
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: email.trim() }]);

      if (insertError) {
        // Check if email already exists
        if (insertError.code === '23505') {
          throw new Error('Email is already subscribed to our newsletter');
        }
        throw insertError;
      }

      setSuccess(true);
      setEmail('');
      
      // Reset success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Newsletter signup error:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe to newsletter');
    } finally {
      setLoading(false);
    }
  };

  const platformLinks = [
    { name: 'CryptoClash', href: '/cryptoclash', isRoute: true },
    { name: 'Leaderboard', href: '#leaderboard', isRoute: false },
    { name: 'About', href: '#about', isRoute: false },
    { name: 'Roadmap', href: '#roadmap', isRoute: false }
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Cookie Policy', href: '#' }
  ];

  return (
    <footer className="bg-gradient-to-t from-black to-gray-900 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content - Reduced padding */}
        <div className="py-12">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-5">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-black" />
                </div>
                <span className="text-2xl font-bold text-white">SolxClash</span>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                The ultimate Web3 skill-based gaming platform. 
                Test your market knowledge, compete with players worldwide, and earn rewards.
              </p>

              {/* Social Links */}
              <div className="flex items-center space-x-4 mb-6">
                <a
                  href="#"
                  className="w-12 h-12 bg-gray-800 hover:bg-yellow-400/20 border border-gray-700 hover:border-yellow-400/30 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <img 
                    src="/assets/icons8-twitter-100.png" 
                    alt="X (Twitter)" 
                    className="w-6 h-6 filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-200"
                  />
                </a>
              </div>

              {/* Newsletter - Enhanced */}
              <div className="max-w-sm">
                <h3 className="text-sm font-semibold text-white mb-2">Stay Updated</h3>
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                      className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 text-sm focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20 transition-all duration-200"
                      required
                      disabled={loading}
                    />
                    <button
                      type="submit"
                      disabled={loading || success}
                      className="bg-yellow-400 text-black px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                      ) : success ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <ArrowRight className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  
                  {/* Success Message */}
                  {success && (
                    <div className="flex items-center space-x-2 text-green-400 text-xs">
                      <Check className="w-3 h-3" />
                      <span>Successfully subscribed!</span>
                    </div>
                  )}
                  
                  {/* Error Message */}
                  {error && (
                    <div className="flex items-center space-x-2 text-red-400 text-xs">
                      <AlertCircle className="w-3 h-3" />
                      <span>{error}</span>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Platform Links */}
            <div className="lg:col-span-3">
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-3">
                {platformLinks.map((link) => (
                  <li key={link.name}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        className="text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                      >
                        {link.name}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solana Section */}
            <div className="lg:col-span-4 text-center lg:text-right">
              <div className="inline-flex items-center space-x-3 mb-3">
                <span className="text-gray-300">Built on</span>
                <img 
                  src="/assets/solanaLogo.png" 
                  alt="Solana" 
                  className="h-5 w-auto"
                />
              </div>
              <p className="text-gray-400 text-sm max-w-xs mx-auto lg:mx-0 lg:ml-auto">
                Experience lightning-fast transactions and low fees on the most performant blockchain.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Reduced padding */}
        <div className="py-4 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-gray-400 text-sm">
              © 2025 SolxClash. All rights reserved.
            </div>
            
            {/* Legal Links - Horizontal */}
            <div className="flex items-center space-x-6">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </a>
                  {index < legalLinks.length - 1 && (
                    <span className="text-gray-600">•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;