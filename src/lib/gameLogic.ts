import { supabase } from './supabase';
import { CoinSymbol, PriceData } from './pyth';

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
  private gameTimer: NodeJS.Timeout | null = null;
  private realtimeSubscription: any = null;

  constructor() {
    this.initializeGameState();
    this.setupRealtimeSubscription();
  }

  private async initializeGameState() {
    try {
      console.log('🎮 Initializing game state...');
      
      // Get the current active round
      const { data: currentRound, error } = await supabase
        .from('game_rounds')
        .select('*')
        .in('status', ['waiting', 'predicting', 'resolving'])
        .order('round_number', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching current round:', error);
        return;
      }

      if (currentRound) {
        this.currentGameState.currentRound = currentRound;
        this.updateGamePhase();
      } else {
        // No active round, create a new one
        await this.createNewRound();
      }

      this.startGameTimer();
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
          console.log('🔄 Game round update received:', payload);
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
      console.log('🆕 Creating new game round...');
      
      // Get the next round number
      const { data: lastRound } = await supabase
        .from('game_rounds')
        .select('round_number')
        .order('round_number', { ascending: false })
        .limit(1)
        .single();

      const nextRoundNumber = (lastRound?.round_number || 0) + 1;
      
      // Select a random coin for this round
      const coins: CoinSymbol[] = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP'];
      const selectedCoin = coins[Math.floor(Math.random() * coins.length)];
      
      // Calculate times
      const now = new Date();
      const startTime = new Date(now.getTime() + 30 * 1000); // Start in 30 seconds
      const predictionEndTime = new Date(startTime.getTime() + 60 * 1000); // 60 seconds for predictions
      const endTime = new Date(predictionEndTime.getTime() + 10 * 1000); // 10 seconds for resolution

      const { data: newRound, error } = await supabase
        .from('game_rounds')
        .insert([{
          round_number: nextRoundNumber,
          status: 'waiting',
          selected_coin: selectedCoin,
          start_time: startTime.toISOString(),
          prediction_end_time: predictionEndTime.toISOString(),
          end_time: endTime.toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      this.currentGameState.currentRound = newRound;
      this.updateGamePhase();
      
      console.log(`✅ New round created: #${nextRoundNumber} for ${selectedCoin}`);
    } catch (error) {
      console.error('❌ Failed to create new round:', error);
    }
  }

  private async startPredictionPhase(roundId: string) {
    try {
      console.log('🎯 Starting prediction phase...');
      
      const { error } = await supabase
        .from('game_rounds')
        .update({ 
          status: 'predicting',
          start_price: null // Will be set when we get the first price
        })
        .eq('id', roundId);

      if (error) throw error;
      
      console.log('✅ Prediction phase started');
    } catch (error) {
      console.error('❌ Failed to start prediction phase:', error);
    }
  }

  private async startResolvingPhase(roundId: string) {
    try {
      console.log('⚖️ Starting resolving phase...');
      
      const { error } = await supabase
        .from('game_rounds')
        .update({ status: 'resolving' })
        .eq('id', roundId);

      if (error) throw error;
      
      console.log('✅ Resolving phase started');
    } catch (error) {
      console.error('❌ Failed to start resolving phase:', error);
    }
  }

  private async completeRound(roundId: string) {
    try {
      console.log('🏁 Completing round...');
      
      // This would typically involve:
      // 1. Getting final price
      // 2. Determining price direction
      // 3. Updating all predictions with results
      // 4. Awarding XP to winners
      // 5. Updating user profiles
      
      const { error } = await supabase
        .from('game_rounds')
        .update({ status: 'completed' })
        .eq('id', roundId);

      if (error) throw error;
      
      console.log('✅ Round completed');
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
      console.log(`🎯 Making prediction: ${prediction} for round ${round.round_number}`);
      
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
      
      console.log('✅ Prediction saved');
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
    console.log('🎮 Game logic service disconnected');
  }
}

// Export singleton instance
export const gameLogicService = new GameLogicService();