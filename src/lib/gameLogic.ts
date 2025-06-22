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
          this.handleRoundUpdate(payload);
        }
      )
      .subscribe();
  }

  private handleRoundUpdate(payload: any) {
    if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
      const updatedRound = payload.new as GameRound;
      
      if (this.currentGameState.currentRound?.id === updatedRound.id) {
        this.currentGameState.currentRound = updatedRound;
        this.updateGamePhase();
        this.notifySubscribers();
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
          await this.completeRound(round.id);
          await this.createNewRound();
          break;
      }
    } catch (error) {
      console.error('Error handling phase transition:', error);
    }
  }

  private async createNewRound() {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-management/create-round`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create new round');
      }

      // Immediately update local state to prevent race conditions
      this.currentGameState.currentRound = result.round;
      this.updateGamePhase();
      this.notifySubscribers();
    } catch (error) {
      console.error('❌ Failed to create new round:', error);
    }
  }

  private async startPredictionPhase(roundId: string) {
    try {
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
    } catch (error) {
      console.error('❌ Failed to start prediction phase:', error);
    }
  }

  private async startResolvingPhase(roundId: string) {
    try {
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
    } catch (error) {
      console.error('❌ Failed to start resolving phase:', error);
    }
  }

  private async completeRound(roundId: string) {
    try {
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

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete round');
      }

      // Immediately update local state to prevent race conditions
      this.currentGameState.currentRound = result.round;
      this.updateGamePhase();
      this.notifySubscribers();
    } catch (error) {
      console.error('❌ Failed to complete round:', error);
    }
  }

  public async makePrediction(prediction: 'up' | 'down', userId: string) {
    const round = this.currentGameState.currentRound;
    if (!round || round.status !== 'predicting') {
      throw new Error('No active prediction round');
    }

    try {
      // Check if user has enough XP (10 XP required per prediction)
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('xp')
        .eq('user_id', userId)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch user profile');
      }

      if (profile.xp < 10) {
        throw new Error('Insufficient XP! You need at least 10 XP to make a prediction.');
      }

      // Deduct 10 XP from user's profile
      const { error: deductError } = await supabase
        .from('profiles')
        .update({ xp: profile.xp - 10 })
        .eq('user_id', userId);

      if (deductError) {
        throw new Error('Failed to deduct XP from your account');
      }

      // Create the prediction
      const { data, error } = await supabase
        .from('predictions')
        .upsert([{
          round_id: round.id,
          user_id: userId,
          prediction: prediction
        }])
        .select()
        .single();

      if (error) throw error;

      this.currentGameState.userPrediction = data;
      this.notifySubscribers();
      
      return data;
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
  }
}

// Export singleton instance
export const gameLogicService = new GameLogicService();