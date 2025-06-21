import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';
import { usePythWebSocket } from './usePythWebSocket';

interface GameState {
  id: string | null;
  symbol: string;
  prediction: 'up' | 'down' | null;
  startPrice: number | null;
  endPrice: number | null;
  startTime: Date | null;
  endTime: Date | null;
  timeLeft: number;
  status: 'idle' | 'active' | 'completed' | 'resolving';
  result: 'win' | 'loss' | 'pending' | null;
  xpEarned: number;
  usdtEarned: number;
}

interface UseGameLogicReturn {
  gameState: GameState;
  currentPrice: number | null;
  priceConnected: boolean;
  startGame: (symbol: string) => Promise<void>;
  makePrediction: (prediction: 'up' | 'down') => Promise<void>;
  resetGame: () => void;
  loading: boolean;
  error: string | null;
}

const GAME_DURATION = 300; // 5 minutes in seconds

export const useGameLogic = (): UseGameLogicReturn => {
  const { user, profile } = useAuthContext();
  const { prices, connected: priceConnected, subscribe, unsubscribe, getPrice } = usePythWebSocket();
  
  const [gameState, setGameState] = useState<GameState>({
    id: null,
    symbol: 'BTC',
    prediction: null,
    startPrice: null,
    endPrice: null,
    startTime: null,
    endTime: null,
    timeLeft: GAME_DURATION,
    status: 'idle',
    result: null,
    xpEarned: 0,
    usdtEarned: 0
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const gameResolveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current price for the selected symbol
  const currentPrice = getPrice(gameState.symbol)?.price || null;

  // Timer effect for active games
  useEffect(() => {
    if (gameState.status === 'active' && gameState.timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setGameState(prev => {
          const newTimeLeft = prev.timeLeft - 1;
          
          if (newTimeLeft <= 0) {
            // Game time is up, resolve the game
            resolveGame(prev.id!, prev.symbol, prev.prediction!, prev.startPrice!);
            return {
              ...prev,
              timeLeft: 0,
              status: 'resolving'
            };
          }
          
          return {
            ...prev,
            timeLeft: newTimeLeft
          };
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState.status, gameState.timeLeft]);

  // Subscribe to price feeds when component mounts
  useEffect(() => {
    const symbols = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];
    subscribe(symbols);

    return () => {
      unsubscribe(symbols);
    };
  }, [subscribe, unsubscribe]);

  const startGame = useCallback(async (symbol: string) => {
    if (!user || !profile) {
      setError('User not authenticated');
      return;
    }

    const currentPriceData = getPrice(symbol);
    if (!currentPriceData) {
      setError(`Price data not available for ${symbol}`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + GAME_DURATION * 1000);

      // Create game record in database
      const { data: gameData, error: gameError } = await supabase
        .from('games')
        .insert([{
          user_id: user.id,
          symbol: symbol,
          start_price: currentPriceData.price,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          duration: GAME_DURATION,
          prediction: null, // Will be set when user makes prediction
          result: 'pending'
        }])
        .select()
        .single();

      if (gameError) throw gameError;

      // Store price in price_history
      await supabase
        .from('price_history')
        .insert([{
          symbol: symbol,
          price: currentPriceData.price,
          timestamp: startTime.toISOString(),
          source: 'pyth'
        }]);

      setGameState({
        id: gameData.id,
        symbol: symbol,
        prediction: null,
        startPrice: currentPriceData.price,
        endPrice: null,
        startTime: startTime,
        endTime: endTime,
        timeLeft: GAME_DURATION,
        status: 'active',
        result: 'pending',
        xpEarned: 0,
        usdtEarned: 0
      });

      console.log('🎮 Game started:', {
        id: gameData.id,
        symbol,
        startPrice: currentPriceData.price,
        startTime
      });

    } catch (err) {
      console.error('❌ Error starting game:', err);
      setError(err instanceof Error ? err.message : 'Failed to start game');
    } finally {
      setLoading(false);
    }
  }, [user, profile, getPrice]);

  const makePrediction = useCallback(async (prediction: 'up' | 'down') => {
    if (!gameState.id || gameState.status !== 'active') {
      setError('No active game to make prediction');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Update game with prediction
      const { error: updateError } = await supabase
        .from('games')
        .update({ 
          prediction: prediction,
          updated_at: new Date().toISOString()
        })
        .eq('id', gameState.id);

      if (updateError) throw updateError;

      setGameState(prev => ({
        ...prev,
        prediction: prediction
      }));

      console.log('🎯 Prediction made:', prediction);

    } catch (err) {
      console.error('❌ Error making prediction:', err);
      setError(err instanceof Error ? err.message : 'Failed to make prediction');
    } finally {
      setLoading(false);
    }
  }, [gameState.id, gameState.status]);

  const resolveGame = useCallback(async (
    gameId: string, 
    symbol: string, 
    prediction: 'up' | 'down', 
    startPrice: number
  ) => {
    const currentPriceData = getPrice(symbol);
    if (!currentPriceData) {
      console.error('❌ No price data available to resolve game');
      return;
    }

    const endPrice = currentPriceData.price;
    const priceChange = ((endPrice - startPrice) / startPrice) * 100;
    const isWin = (prediction === 'up' && priceChange > 0) || (prediction === 'down' && priceChange < 0);
    const result = isWin ? 'win' : 'loss';

    try {
      // Calculate rewards
      const currentStreak = profile?.streak || 0;
      const { data: rewardData } = await supabase
        .rpc('calculate_game_rewards', {
          game_id: gameId,
          is_winner: isWin,
          current_streak: currentStreak
        });

      const xpReward = rewardData?.[0]?.xp_reward || 0;
      const usdtReward = rewardData?.[0]?.usdt_reward || 0;

      // Update game with final result
      const { error: updateError } = await supabase
        .from('games')
        .update({
          end_price: endPrice,
          end_time: new Date().toISOString(),
          result: result,
          xp_earned: xpReward,
          usdt_earned: usdtReward,
          updated_at: new Date().toISOString()
        })
        .eq('id', gameId);

      if (updateError) throw updateError;

      // Store final price in price_history
      await supabase
        .from('price_history')
        .insert([{
          symbol: symbol,
          price: endPrice,
          timestamp: new Date().toISOString(),
          source: 'pyth'
        }]);

      setGameState(prev => ({
        ...prev,
        endPrice: endPrice,
        status: 'completed',
        result: result,
        xpEarned: xpReward,
        usdtEarned: usdtReward
      }));

      console.log('🏁 Game resolved:', {
        gameId,
        result,
        startPrice,
        endPrice,
        priceChange: priceChange.toFixed(2) + '%',
        xpEarned: xpReward,
        usdtEarned: usdtReward
      });

      // Auto-reset after showing results
      gameResolveTimeoutRef.current = setTimeout(() => {
        resetGame();
      }, 5000);

    } catch (err) {
      console.error('❌ Error resolving game:', err);
      setError('Failed to resolve game');
    }
  }, [getPrice, profile?.streak]);

  const resetGame = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (gameResolveTimeoutRef.current) {
      clearTimeout(gameResolveTimeoutRef.current);
      gameResolveTimeoutRef.current = null;
    }

    setGameState({
      id: null,
      symbol: 'BTC',
      prediction: null,
      startPrice: null,
      endPrice: null,
      startTime: null,
      endTime: null,
      timeLeft: GAME_DURATION,
      status: 'idle',
      result: null,
      xpEarned: 0,
      usdtEarned: 0
    });

    setError(null);
    console.log('🔄 Game reset');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (gameResolveTimeoutRef.current) {
        clearTimeout(gameResolveTimeoutRef.current);
      }
    };
  }, []);

  return {
    gameState,
    currentPrice,
    priceConnected,
    startGame,
    makePrediction,
    resetGame,
    loading,
    error
  };
};