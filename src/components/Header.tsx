import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, ChevronDown, LogOut, Loader2 } from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import AuthButtons from './AuthButtons';
import { getLevel } from '../lib/levelSystem';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const location = useLocation();
  const { user, profile, loading, signOut } = useAuthContext();

  const navLinks = [
    { name: 'CryptoClash', href: '/cryptoclash', isRoute: true },
    { name: 'Leaderboard', href: '/leaderboard', isRoute: true },
    { name: 'Roadmap', href: '#roadmap', isRoute: false },
    { name: 'About', href: '/about', isRoute: true },
  ];

  const scrollToSection = (href: string) => {
    if (location.pathname !== '/') {
      // If not on home page, navigate to home first then scroll
      window.location.href = `/${href}`;
      return;
    }
    
    // If on home page, scroll to section
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setShowUserDropdown(false);
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const handleViewProfile = () => {
    if (profile?.username) {
      setShowUserDropdown(false);
    }
  };

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-yellow-400/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
              <div className="w-10 h-10 rounded overflow-hidden">
                <img 
                  src="/assets/solxclash_logo.svg" 
                  alt="SolxClash" 
                  className="w-full h-full"
                />
              </div>
              <span className="text-xl font-bold text-white">SolxClash</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </button>
                )
              ))}
            </nav>

            {/* Loading State */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="bg-gray-800 border border-yellow-400/20 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Loading...</span>
              </div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800 transition-colors duration-200"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // Check if user is authenticated and profile is loaded
  const isAuthenticated = user && profile;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-yellow-400/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200">
            <img 
              src="/assets/solxclash_logo.svg" 
              alt="SolxClash" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-white">SolxClash</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.name}
                  to={link.href}
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium"
                >
                  {link.name}
                </Link>
              ) : (
                <button
                  key={link.name}
                  onClick={() => scrollToSection(link.href)}
                  className="text-gray-300 hover:text-yellow-400 transition-colors duration-200 font-medium"
                >
                  {link.name}
                </button>
              )
            ))}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Profile Dropdown - Show when authenticated */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 hover:border-yellow-400/30 hover:bg-gray-700/50 transition-all duration-200 text-gray-300 hover:text-white group"
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || profile.username}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-yellow-400/20 rounded-full flex items-center justify-center group-hover:bg-yellow-400/30 transition-colors duration-200">
                      <User className="w-4 h-4 text-yellow-400" />
                    </div>
                  )}
                  <div className="text-left">
                    <div className="text-sm font-semibold">
                      {profile.full_name || profile.username}
                    </div>
                    <div className="text-xs text-gray-400">
                      {profile.xp} XP • Level {getLevel(profile.xp)}
                    </div>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* User Dropdown Menu */}
                {showUserDropdown && (
                  <>
                    <div className="absolute top-full mt-2 right-0 bg-gray-900 border border-gray-700 rounded-lg shadow-xl min-w-64 z-50 animate-in slide-in-from-top-2 duration-200">
                      {/* User Info Header */}
                      <div className="p-4 border-b border-gray-700">
                        <div className="flex items-center space-x-3">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.full_name || profile.username}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-yellow-400/20 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-yellow-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-white truncate">
                              {profile.full_name || profile.username}
                            </div>
                            <div className="text-sm text-gray-400 truncate">
                              @{profile.username}
                            </div>
                            <div className="text-xs text-gray-500">
                              {profile.xp} XP • {profile.wins}/{profile.games_played} wins
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-2">
                        <Link
                          to={`/profile/${profile.username}`}
                          onClick={handleViewProfile}
                          className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors duration-200 flex items-center space-x-3 text-gray-300 hover:text-white"
                        >
                          <User className="w-4 h-4" />
                          <span>View Profile</span>
                        </Link>
                        
                        <div className="border-t border-gray-700 mt-2 pt-2">
                          <button
                            onClick={handleSignOut}
                            className="w-full px-4 py-3 text-left hover:bg-red-500/10 transition-colors duration-200 flex items-center space-x-3 text-red-400 hover:text-red-300"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowUserDropdown(false)}
                    />
                  </>
                )}
              </div>
            ) : (
              /* Google Sign In Button - Show when not authenticated */
              <AuthButtons />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-300 hover:text-yellow-400 hover:bg-gray-800 transition-colors duration-200"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/95 backdrop-blur-md border-t border-yellow-400/20">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-3 py-2 rounded-md text-gray-300 hover:text-yellow-400 hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </Link>
                ) : (
                  <button
                    key={link.name}
                    onClick={() => scrollToSection(link.href)}
                    className="block w-full text-left px-3 py-2 rounded-md text-gray-300 hover:text-yellow-400 hover:bg-gray-800 transition-colors duration-200 font-medium"
                  >
                    {link.name}
                  </button>
                )
              ))}
              
              {/* Mobile User Profile */}
              {isAuthenticated ? (
                <div className="pt-3 px-3 border-t border-gray-700 mt-3">
                  <div className="flex items-center space-x-3 mb-3">
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.full_name || profile.username}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-yellow-400" />
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-white">
                        {profile.full_name || profile.username}
                      </div>
                      <div className="text-sm text-gray-400">
                        @{profile.username}
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to={`/profile/${profile.username}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="block w-full text-left px-3 py-2 rounded-md text-gray-300 hover:text-yellow-400 hover:bg-gray-800 transition-colors duration-200 font-medium mb-2"
                  >
                    View Profile
                  </Link>
                  
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-md text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors duration-200 font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="pt-3 px-3 border-t border-gray-700 mt-3">
                  <AuthButtons />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;