import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const platformLinks = [
    { name: 'CryptoClash', href: '/cryptoclash', isRoute: true },
    { name: 'Leaderboard', href: '/leaderboard', isRoute: true },
    { name: 'About', href: '/about', isRoute: true },
    { name: 'Roadmap', href: '#roadmap', isRoute: false }
  ];

  const legalLinks = [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Disclaimer', href: '/disclaimer' }
  ];

  const scrollToSection = (href: string) => {
    if (window.location.pathname !== '/') {
      // If not on home page, navigate to home first
      window.location.href = `/${href}`;
      return;
    }
    
    // If on home page, scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-t from-purple-900/40 via-purple-900/20 to-black border-t border-purple-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content - Reduced padding */}
        <div className="py-12">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* Brand Section */}
            <div className="lg:col-span-5">
              <div className="flex items-center space-x-1 mb-4">
                <img 
                  src="/assets/solxclash_logo.svg" 
                  alt="SolxClash" 
                  className="w-8 h-8 rounded"
                />
                <span className="text-2xl font-bold text-white">SolxClash</span>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
               The ultimate Web3 gaming platform. Test your intuition, compete globally, and unlock achievements.
              </p>

              {/* Social Links */}
              <div className="flex items-center space-x-4 mb-6">
                <a
                  href="https://x.com/sahilgupta_as"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-purple-800/50 hover:bg-yellow-400/20 border border-purple-700 hover:border-yellow-400/30 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <img 
                    src="/assets/icons8-twitter-100.png" 
                    alt="X (Twitter)" 
                    className="w-6 h-6 filter brightness-0 invert opacity-70 hover:opacity-100 transition-opacity duration-200"
                  />
                </a>
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
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-gray-400 hover:text-yellow-400 transition-colors duration-200"
                      >
                        {link.name}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Solana Section */}
            <div className="lg:col-span-4 text-center lg:text-right">
              <div className="inline-flex items-center space-x-3 mb-3">
                <img 
                  src="/assets/solanaLogo.png" 
                  alt="Solana" 
                  className="h-5 w-auto"
                />
                <span className="text-gray-300">launch soon</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs mx-auto lg:mx-0 lg:ml-auto">
                Experience lightning-fast transactions and low fees on the most performant blockchain.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar - Reduced padding */}
        <div className="py-4 border-t border-purple-800/30">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="text-gray-400 text-sm">
              © 2025 SolxClash. All rights reserved.
            </div>
            
            {/* Legal Links - Horizontal */}
            <div className="flex items-center space-x-6">
              {legalLinks.map((link, index) => (
                <React.Fragment key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 text-sm"
                  >
                    {link.name}
                  </Link>
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