import React, { useState, useEffect } from 'react';
import { Wallet, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import { useWallet } from '../hooks/useWallet';

const WalletButton = () => {
  const { user, profile, loading: authLoading, refreshSessionAndProfile } = useAuthContext();
  const { connectWallet, connecting, error, isWalletAvailable } = useWallet();
  const [connectionSuccess, setConnectionSuccess] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('💳 WalletButton state:', { 
      user: !!user, 
      profile: !!profile, 
      authLoading, 
      connecting,
      hasWallet: isWalletAvailable,
      shouldRender: !(user && profile && !authLoading),
      timestamp: new Date().toISOString()
    });
  }, [user, profile, authLoading, connecting, isWalletAvailable]);

  const handleConnect = async () => {
    if (!isWalletAvailable) {
      window.open('https://phantom.app/', '_blank');
      return;
    }

    try {
      console.log('💳 Starting wallet connection process...');
      setConnectionSuccess(false);
      
      const result = await connectWallet();
      console.log('✅ Wallet connection result:', result);
      
      // Show success state briefly
      setConnectionSuccess(true);
      
      // If session was successfully set, refresh the auth state immediately
      if (result.sessionSet) {
        console.log('💳 SESSION_SET: true - Refreshing auth state...');
        
        // Add a small delay to ensure the auth state change has propagated
        setTimeout(async () => {
          try {
            await refreshSessionAndProfile();
            console.log('💳 Auth state refresh completed - UI should update now');
          } catch (refreshError) {
            console.error('❌ Error refreshing auth state:', refreshError);
          }
        }, 500);
      }
    } catch (err) {
      console.error('❌ Connection failed:', err);
      setConnectionSuccess(false);
    }
  };

  // Show loading state while auth is loading
  if (authLoading) {
    console.log('💳 WalletButton: Showing auth loading state');
    return (
      <div className="bg-gray-800 border border-yellow-400/20 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 w-full md:w-auto justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  // Don't render if user is authenticated and profile is loaded
  if (user && profile) {
    console.log('💳 WalletButton: Not rendering - user authenticated');
    return null;
  }

  // Show connecting state while wallet connection is in progress
  if (connecting) {
    console.log('💳 WalletButton: Showing connecting state');
    return (
      <div className="bg-yellow-400/20 border border-yellow-400/40 text-yellow-400 px-6 py-2 rounded-lg font-medium flex items-center space-x-2 w-full md:w-auto justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Connecting...</span>
      </div>
    );
  }

  // Show success state briefly after connection
  if (connectionSuccess) {
    return (
      <div className="bg-green-600/20 border border-green-600/40 text-green-400 px-6 py-2 rounded-lg font-medium flex items-center space-x-2 w-full md:w-auto justify-center">
        <CheckCircle className="w-4 h-4" />
        <span className="text-sm">Connected!</span>
      </div>
    );
  }

  // Show loading state if we have a user but no profile yet
  if (user && !profile) {
    console.log('💳 WalletButton: Showing profile loading state');
    return (
      <div className="bg-blue-600/20 border border-blue-600/40 text-blue-400 px-6 py-2 rounded-lg font-medium flex items-center space-x-2 w-full md:w-auto justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading profile...</span>
      </div>
    );
  }

  // Default - show connect button
  console.log('💳 WalletButton: Rendering connect button');
  return (
    <div className="relative">
      <button
        onClick={handleConnect}
        disabled={connecting || authLoading}
        className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 w-full md:w-auto justify-center"
      >
        <Wallet className="w-4 h-4" />
        <span>
          {!isWalletAvailable 
            ? 'Install Wallet' 
            : 'Connect Wallet'
          }
        </span>
      </button>
      
      {/* Error Message */}
      {error && (
        <div className="absolute top-full mt-2 right-0 bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm max-w-xs z-50">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Wallet Not Available Message */}
      {!isWalletAvailable && (
        <div className="absolute top-full mt-2 right-0 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-yellow-400 text-sm max-w-xs z-50">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>No Solana wallet detected. Click to install Phantom wallet.</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletButton;