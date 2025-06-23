import { supabase } from './supabase';
import { CoinSymbol, PriceData, binancePriceService } from './binancePriceService';

export interface GameRound {
  id: string;
  round_number: number;
  status: 'waiting' | 'predicting' | 'resolving' | 'completed';
  selected_coin: CoinSymbol;
  start_time: string | null;
  prediction_end_time: string | null;
  end_time: string | null;
  start_price: number | null;
  end_price: number | null;
  price_direction: 'up' | 'down' | 'unchanged' | null;
  created_at: string;
  updated_at: string;
}

export interface Prediction {
  id: string;
  round_id: string;
  user_id: string;
  prediction: 'up' | 'down';
  predicted_at: string;
  predicted_price?: number | null;
  is_correct: boolean | null;
  xp_earned: number;
  created_at: string;
}

export interface GameState {
  currentRound: GameRound | null;
  userPrediction: Prediction | null;
  timeLeft: number;
  phase: 'waiting' | 'predicting' | 'resolving' | 'completed';
}

class GameLogicService {
  private gameStateSubscribers: Set<(state: GameState) => void> = new Set();
  private currentGameState: GameState = {
    currentRound: null,
    userPrediction: null,
    timeLeft: 0,
    phase: 'waiting'
  };
  private gameTimer: number | null = null;
  private realtimeSubscription: any = null;
  private isInitialized = false;

  constructor() {
    // Don't auto-initialize - wait for explicit call when auth is ready
    this.setupRealtimeSubscription();
  }

  public async initializeGameState() {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🎮 Initializing game state...');
      
      // Get the current active round - Fixed to handle empty results
      const { data: rounds, error } = await supabase
        .from('game_rounds')
        .select('*')
        .in('status', ['waiting', 'predicting', 'resolving'])
        .order('round_number', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Error fetching current round:', error);
        return;
      }

      // Handle case where no active rounds exist
      if (rounds && rounds.length > 0) {
        this.currentGameState.currentRound = rounds[0];
        this.updateGamePhase();
      } else {
        // No active round, create a new one
        await this.createNewRound();
      }

      this.startGameTimer();
      this.isInitialized = true;
      console.log('✅ Game state initialized');
    } catch (error) {
      console.error('❌ Failed to initialize game state:', error);
    }
  }

  private setupRealtimeSubscription() {
    // Subscribe to game_rounds changes
    this.realtimeSubscription = supabase
      .channel('game_rounds_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rounds'
        },
        (payload) => {
          console.log('🔄 [DEBUG] Game round update received via realtime:', payload);
          this.handleRoundUpdate(payload);
        }
      )
      .subscribe();
  }

  private handleRoundUpdate(payload: any) {
    console.log('🔄 [DEBUG] Processing round update in handleRoundUpdate...');
    
    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
      const updatedRound = payload.new as GameRound;
      console.log('🔄 [DEBUG] Updated round data from realtime:', {
        id: updatedRound.id,
        round_number: updatedRound.round_number,
        status: updatedRound.status,
        price_direction: updatedRound.price_direction,
        start_price: updatedRound.start_price,
        end_price: updatedRound.end_price
      });
      
      if (this.currentGameState.currentRound?.id === updatedRound.id) {
        console.log('🔄 [DEBUG] Updating current game state with new round data');
        this.currentGameState.currentRound = updatedRound;
        this.updateGamePhase();
        this.notifySubscribers();
      } else {
        console.log('🔄 [DEBUG] Received update for different round, ignoring');
      }
    }
  }

  private updateGamePhase() {
    if (!this.currentGameState.currentRound) return;

    const round = this.currentGameState.currentRound;
    const now = new Date();

    switch (round.status) {
      case 'waiting':
        this.currentGameState.phase = 'waiting';
        if (round.start_time) {
          const startTime = new Date(round.start_time);
          this.currentGameState.timeLeft = Math.max(0, Math.floor((startTime.getTime() - now.getTime()) / 1000));
        }
        break;
      
      case 'predicting':
        this.currentGameState.phase = 'predicting';
        if (round.prediction_end_time) {
          const endTime = new Date(round.prediction_end_time);
          this.currentGameState.timeLeft = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
        }
        break;
      
      case 'resolving':
        this.currentGameState.phase = 'resolving';
        this.currentGameState.timeLeft = 10; // 10 seconds to show results
        break;
      
      case 'completed':
        this.currentGameState.phase = 'completed';
        this.currentGameState.timeLeft = 0;
        break;
    }
  }

  private startGameTimer() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
    }

    this.gameTimer = setInterval(() => {
      this.updateGamePhase();
      
      if (this.currentGameState.timeLeft > 0) {
        this.currentGameState.timeLeft--;
      } else {
        this.handlePhaseTransition();
      }
      
      this.notifySubscribers();
    }, 1000);
  }

  private async handlePhaseTransition() {
    const round = this.currentGameState.currentRound;
    if (!round) return;

    try {
      console.log(`🔄 Phase transition for round ${round.round_number}: ${round.status}`);
      
      switch (round.status) {
        case 'waiting':
          // Start prediction phase
          await this.startPredictionPhase(round.id);
          break;
        
        case 'predicting':
          // Start resolving phase
          await this.startResolvingPhase(round.id);
          break;
        
        case 'resolving':
          // Complete round and create new one
          console.log('🏁 Completing round and creating new one...');
          await this.completeRound(round.id);
          // Add a small delay before creating new round to ensure completion
          setTimeout(async () => {
            await this.createNewRound();
          }, 1000);
          break;
      }
    } catch (error) {
      console.error('❌ Error handling phase transition:', error);
    }
  }

  private async createNewRound() {
    try {
      console.log('🆕 Creating new game round...');
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-management/create-round`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Create round response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create new round');
      }

      // Immediately update local state to prevent race conditions
      this.currentGameState.currentRound = result.round;
      this.currentGameState.userPrediction = null; // Reset user prediction for new round
      this.updateGamePhase();
      this.notifySubscribers();
      
      console.log(`✅ New round created: #${result.round.round_number} with default coin ${result.round.selected_coin}`);
    } catch (error) {
      console.error('❌ Failed to create new round:', error);
    }
  }

  private async startPredictionPhase(roundId: string) {
    try {
      console.log('🎯 Starting prediction phase...');
      
      // Get current price from Binance service
      const round = this.currentGameState.currentRound;
      if (!round) return;

      const currentPrice = binancePriceService.getCurrentPrice(round.selected_coin);
      let startPrice = null;

      if (currentPrice && currentPrice.price > 0) {
        startPrice = currentPrice.price;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-management/start-prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          roundId,
          startPrice
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Start prediction response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start prediction phase');
      }

      // Immediately update local state to prevent race conditions
      this.currentGameState.currentRound = result.round;
      this.updateGamePhase();
      this.notifySubscribers();
      
      console.log('✅ Prediction phase started');
    } catch (error) {
      console.error('❌ Failed to start prediction phase:', error);
    }
  }

  private async startResolvingPhase(roundId: string) {
    try {
      console.log('⚖️ Starting resolving phase...');
      
      // Get current price from Binance service
      const round = this.currentGameState.currentRound;
      if (!round) return;

      const currentPrice = binancePriceService.getCurrentPrice(round.selected_coin);
      let endPrice = null;

      if (currentPrice && currentPrice.price > 0) {
        endPrice = currentPrice.price;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-management/start-resolving`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          roundId,
          endPrice
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Start resolving response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start resolving phase');
      }

      // Immediately update local state to prevent race conditions
      this.currentGameState.currentRound = result.round;
      this.updateGamePhase();
      this.notifySubscribers();
      
      console.log('✅ Resolving phase started');
    } catch (error) {
      console.error('❌ Failed to start resolving phase:', error);
    }
  }

  private async completeRound(roundId: string) {
    try {
      console.log('🏁 [DEBUG] Frontend: Starting completeRound request...');
      console.log('🏁 [DEBUG] Frontend: Request body:', { roundId });
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-management/complete-round`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          roundId
        })
      });

      console.log('🏁 [DEBUG] Frontend: Response received:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [DEBUG] Frontend: Complete round response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('🏁 [DEBUG] Frontend: Parsed response result:', result);
      
      if (!result.success) {
        console.error('❌ [DEBUG] Frontend: Complete round failed:', result.error);
        throw new Error(result.error || 'Failed to complete round');
      }

      // Immediately update local state to prevent race conditions
      console.log('🏁 [DEBUG] Frontend: Updating local game state with completed round');
      this.currentGameState.currentRound = result.round;
      this.updateGamePhase();
      this.notifySubscribers();
      
      console.log('✅ [DEBUG] Frontend: Round completed successfully');
    } catch (error) {
      console.error('❌ [DEBUG] Frontend: Failed to complete round:', error);
      console.error('❌ [DEBUG] Frontend: Error stack:', error.stack);
    }
  }

  public async makePrediction(prediction: 'up' | 'down', userId: string, chosenCoin: CoinSymbol) {
    const round = this.currentGameState.currentRound;
    // Allow predictions during both waiting and predicting phases
    if (!round || (round.status !== 'waiting' && round.status !== 'predicting')) {
      throw new Error('No active prediction round');
    }

    try {
      console.log(`🎯 Making prediction: ${prediction} for ${chosenCoin} in round ${round.round_number}`);
      
      // Get current price for the chosen coin
      const currentPrice = binancePriceService.getCurrentPrice(chosenCoin);
      if (!currentPrice || currentPrice.price <= 0) {
        throw new Error('Unable to get current price. Please try again.');
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-management/make-prediction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          roundId: round.id,
          userId,
          prediction,
          chosenCoin,
          predictedPrice: currentPrice.price
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Make prediction response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to make prediction');
      }

      this.currentGameState.userPrediction = result.prediction;
      
      // If the round coin was locked to the chosen coin, update local state
      if (result.roundCoinLocked && this.currentGameState.currentRound) {
        this.currentGameState.currentRound.selected_coin = result.lockedCoin;
      }
      
      this.notifySubscribers();
      
      console.log('✅ Prediction saved with locked price:', currentPrice.price);
      return result.prediction;
    } catch (error) {
      console.error('❌ Failed to make prediction:', error);
      throw error;
    }
  }

  public async getUserPrediction(roundId: string, userId: string) {
    try {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('round_id', roundId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      this.currentGameState.userPrediction = data;
      return data;
    } catch (error) {
      console.error('Error fetching user prediction:', error);
      return null;
    }
  }

  public subscribe(callback: (state: GameState) => void): () => void {
    this.gameStateSubscribers.add(callback);
    
    // Send current state immediately
    callback(this.currentGameState);
    
    return () => {
      this.gameStateSubscribers.delete(callback);
    };
  }

  private notifySubscribers() {
    console.log('🔔 [DEBUG] Notifying subscribers with current game state:', {
      currentRound: this.currentGameState.currentRound ? {
        id: this.currentGameState.currentRound.id,
        round_number: this.currentGameState.currentRound.round_number,
        status: this.currentGameState.currentRound.status,
        price_direction: this.currentGameState.currentRound.price_direction
      } : null,
      userPrediction: this.currentGameState.userPrediction ? {
        id: this.currentGameState.userPrediction.id,
        prediction: this.currentGameState.userPrediction.prediction,
        is_correct: this.currentGameState.userPrediction.is_correct,
        xp_earned: this.currentGameState.userPrediction.xp_earned
      } : null,
      phase: this.currentGameState.phase,
      timeLeft: this.currentGameState.timeLeft
    });

    this.gameStateSubscribers.forEach(callback => {
      try {
        callback({ ...this.currentGameState });
      } catch (error) {
        console.error('Error notifying game state subscriber:', error);
      }
    });
  }

  public getCurrentState(): GameState {
    return { ...this.currentGameState };
  }

  public async updateRoundPrice(roundId: string, priceData: PriceData, isStartPrice: boolean) {
    try {
      const updateData = isStartPrice 
        ? { start_price: priceData.price }
        : { end_price: priceData.price };

      const { error } = await supabase
        .from('game_rounds')
        .update(updateData)
        .eq('id', roundId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating round price:', error);
    }
  }

  public disconnect() {
    if (this.gameTimer) {
      clearInterval(this.gameTimer);
      this.gameTimer = null;
    }
    
    if (this.realtimeSubscription) {
      this.realtimeSubscription.unsubscribe();
      this.realtimeSubscription = null;
    }
    
    this.gameStateSubscribers.clear();
    this.isInitialized = false;
    console.log('🎮 Game logic service disconnected');
  }
}

// Export singleton instance
export const gameLogicService = new GameLogicService();