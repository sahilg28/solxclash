import React from 'react';
import { Link } from 'react-router-dom';
import { Coins, Trophy, Users, Zap, Mail, MapPin, Calendar, ExternalLink } from 'lucide-react';

const Footer = () => {
  const platformLinks = [
    { name: 'CryptoClash', href: '/cryptoclash', isRoute: true },
    { name: 'ChessClash', href: '/chessclash', isRoute: true },
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
    <footer className="bg-gradient-to-t from-black via-gray-900 to-gray-800 border-t border-yellow-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid lg:grid-cols-12 gap-12">
            {/* Brand Section */}
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-2 mb-6">
                <img 
                  src="/assets/solxclash_logo.svg" 
                  alt="SolxClash" 
                  className="w-10 h-10 rounded"
                />
                <span className="text-3xl font-bold text-white">SolxClash</span>
              </div>
              
              <p className="text-gray-300 leading-relaxed mb-8 max-w-md text-lg">
                The ultimate Web3 play-to-earn gaming platform where everyone earns and skilled players earn more. 
                <span className="text-yellow-400 font-semibold"> Play. Compete. Earn.</span>
              </p>

              {/* Key Features */}
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-3 text-gray-300">
                  <Coins className="w-5 h-5 text-yellow-400" />
                  <span>Play-to-earn gaming platform</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Trophy className="w-5 h-5 text-green-400" />
                  <span>Fair competition & transparent rewards</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>Global community of players</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-300">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span>Instant rewards & real-time gameplay</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                <a
                  href="https://x.com/sahilgupta_as"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group w-12 h-12 bg-gray-800 hover:bg-yellow-400/20 border border-gray-700 hover:border-yellow-400/30 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <img 
                    src="/assets/icons8-twitter-100.png" 
                    alt="X (Twitter)" 
                    className="w-6 h-6 filter brightness-0 invert opacity-70 group-hover:opacity-100 transition-opacity duration-200"
                  />
                </a>
                <div className="flex items-center space-x-2 text-gray-400">
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm">Follow for updates</span>
                </div>
              </div>
            </div>

            {/* Platform Links */}
            <div className="lg:col-span-3">
              <h3 className="text-white font-bold text-lg mb-6 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Platform</span>
              </h3>
              <ul className="space-y-4">
                {platformLinks.map((link) => (
                  <li key={link.name}>
                    {link.isRoute ? (
                      <Link
                        to={link.href}
                        className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 flex items-center space-x-2 group"
                      >
                        <span className="w-1 h-1 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                        <span>{link.name}</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => scrollToSection(link.href)}
                        className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 flex items-center space-x-2 group"
                      >
                        <span className="w-1 h-1 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                        <span>{link.name}</span>
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div className="lg:col-span-2">
              <h3 className="text-white font-bold text-lg mb-6">Legal</h3>
              <ul className="space-y-4">
                {legalLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-yellow-400 transition-colors duration-200 flex items-center space-x-2 group"
                    >
                      <span className="w-1 h-1 bg-yellow-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"></span>
                      <span>{link.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Solana & Contact Section */}
            <div className="lg:col-span-3">
              <h3 className="text-white font-bold text-lg mb-6">Built on Solana</h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <img 
                    src="/assets/solanaLogo.png" 
                    alt="Solana" 
                    className="h-6 w-auto"
                  />
                  <span className="text-gray-300">Lightning-fast transactions</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <span className="text-gray-300">Low fees & high performance</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-300">Secure & transparent</span>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                <h4 className="text-white font-semibold mb-3 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-yellow-400" />
                  <span>Get in Touch</span>
                </h4>
                <p className="text-gray-400 text-sm mb-3">
                  Questions, feedback, or partnership inquiries? Reach out through our official channels.
                </p>
                <div className="flex items-center space-x-2 text-yellow-400 text-sm">
                  <ExternalLink className="w-4 h-4" />
                  <span>Follow @sahilgupta_as on X</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="py-8 border-t border-gray-700">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-4 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>© 2025 SolxClash. All rights reserved.</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>Built with ❤️ by solo developer</span>
              </div>
            </div>
            
            {/* Platform Stats */}
            <div className="flex items-center space-x-8 text-sm">
              <div className="text-center">
                <div className="text-yellow-400 font-bold">500+</div>
                <div className="text-gray-500 text-xs">Players</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold">2</div>
                <div className="text-gray-500 text-xs">Games</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 font-bold">100%</div>
                <div className="text-gray-500 text-xs">Earn Rate</div>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-500 text-sm max-w-2xl mx-auto">
              SolxClash is a play-to-earn Web3 gaming platform where everyone earns from participation and skilled players earn exponentially more. 
              Built on Solana for fast, secure, and transparent gaming experiences.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;