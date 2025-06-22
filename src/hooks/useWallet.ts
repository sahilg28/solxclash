import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
      signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
      publicKey?: { toString: () => string };
      isConnected?: boolean;
    };
    phantom?: {
      solana?: Window['solana'];
    };
  }
}

interface AuthResult {
  access_token: string;
  refresh_token: string;
  user_id: string;
  wallet_address: string;
  success: boolean;
  error?: string;
}

interface WalletConnectionResult {
  walletAddress: string;
  userId: string;
  sessionSet: boolean;
}

// Retry operation utility with exponential backoff
const retryOperation = async <T>(
  operation: () => Promise<T>, 
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let attempts = 0;
  
  while (attempts < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      attempts++;
      
      if (attempts === maxRetries) {
        console.error(`❌ Operation failed after ${maxRetries} attempts:`, error);
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempts - 1); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Retry operation failed unexpectedly');
};

export const useWallet = () => {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = useCallback(async (): Promise<WalletConnectionResult> => {
    setConnecting(true);
    setError(null);

    try {
      // Check if Solana wallet is available
      if (!window.solana && !window.phantom?.solana) {
        throw new Error('Solana wallet not found. Please install Phantom or another Solana wallet.');
      }

      const wallet = window.solana || window.phantom?.solana;
      if (!wallet) {
        throw new Error('No Solana wallet available');
      }

      // Connect to wallet first with retry logic
      const response = await retryOperation(
        () => wallet.connect(),
        3,
        1000
      );
      
      const walletAddress = response.publicKey.toString();

      // Create a message to sign for authentication
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with SolxClash.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      // Sign the message with retry logic
      const signResult = await retryOperation(
        () => wallet.signMessage(encodedMessage),
        3,
        1000
      );

      // Convert signature to hex string
      const signatureHex = Array.from(signResult.signature)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Call our Edge Function for wallet authentication with retry logic
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wallet-auth`;
      
      const authResult: AuthResult = await retryOperation(
        async () => {
          const authResponse = await fetch(functionUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({
              wallet_address: walletAddress,
              message: message,
              signature: signatureHex
            })
          });

          if (!authResponse.ok) {
            throw new Error(`HTTP ${authResponse.status}: ${authResponse.statusText}`);
          }

          const result = await authResponse.json();
          
          if (!result.success) {
            throw new Error(result.error || 'Authentication failed');
          }

          return result;
        },
        3,
        2000
      );

      // Validate auth tokens
      if (!authResult.access_token || !authResult.refresh_token) {
        throw new Error('Authentication failed: Missing access or refresh tokens');
      }

      // Set session with retry logic and enhanced validation
      const sessionResult = await retryOperation(
        async () => {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: authResult.access_token,
            refresh_token: authResult.refresh_token
          });

          if (sessionError) {
            throw new Error(`Session establishment failed: ${sessionError.message}`);
          }

          if (!data.session) {
            throw new Error('Session establishment failed: No session returned');
          }

          if (!data.session.user) {
            throw new Error('Session establishment failed: No user in session');
          }

          return data;
        },
        3,
        1500
      );

      // Immediately verify the session was set correctly
      const { data: { session: verificationSession }, error: getSessionError } = await supabase.auth.getSession();
      
      if (!verificationSession || !verificationSession.user) {
        throw new Error('Session verification failed: Session not properly established');
      }

      // Monitor for SIGNED_IN event
      const authStatePromise = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('SIGNED_IN event timeout'));
        }, 10000); // 10 second timeout

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            clearTimeout(timeout);
            subscription.unsubscribe();
            resolve();
          }
        });
      });

      // Wait for SIGNED_IN event or timeout
      try {
        await Promise.race([
          authStatePromise,
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Auth state change timeout')), 5000)
          )
        ]);
      } catch (authStateError) {
        // Continue anyway since session is verified
      }

      // Return the wallet connection result
      return {
        walletAddress,
        userId: authResult.user_id,
        sessionSet: true
      };

    } catch (err) {
      console.error('💳 Wallet connection error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      // Disconnect wallet
      const wallet = window.solana || window.phantom?.solana;
      if (wallet && wallet.disconnect) {
        await wallet.disconnect();
      }
    } catch (err) {
      console.error('💳 Error disconnecting wallet:', err);
    }
  }, []);

  const isWalletAvailable = !!(window.solana || window.phantom?.solana);

  return {
    connectWallet,
    disconnectWallet,
    connecting,
    error,
    isWalletAvailable
  };
};