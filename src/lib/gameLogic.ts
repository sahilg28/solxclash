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
  private gameTimer: NodeJS.Timeout | null = null;
  private realtimeSubscription: any = null;
  private isInitialized = false;

  constructor() {
    // Don't auto-initialize - wait for explicit call when auth is ready
    this.setupRealtimeSubscription();
  }

  public async initializeGameState() {
    if (this.isInitialized) {
      console.log('🎮 Game state already initialized');
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
      
      // Get the next round number - Fixed to handle empty table
      const { data: rounds, error: roundsError } = await supabase
        .from('game_rounds')
        .select('round_number')
        .order('round_number', { ascending: false })
        .limit(1);

      if (roundsError) {
        console.error('Error fetching rounds:', roundsError);
        throw roundsError;
      }

      // Handle empty table case
      const nextRoundNumber = (rounds && rounds.length > 0) ? rounds[0].round_number + 1 : 1;
      
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
      
      // Get current round details
      const { data: round, error: roundError } = await supabase
        .from('game_rounds')
        .select('*')
        .eq('id', roundId)
        .single();

      if (roundError) throw roundError;

      // Get current price from Binance service
      const currentPrice = binancePriceService.getCurrentPrice(round.selected_coin);
      let startPrice = null;

      if (currentPrice && currentPrice.price > 0) {
        startPrice = currentPrice.price;
        console.log(`💰 Setting start price for ${round.selected_coin}: $${startPrice}`);
      } else {
        console.warn(`⚠️ No valid price data for ${round.selected_coin}, using fallback`);
        // Fallback prices for demo
        const fallbackPrices = {
          BTC: 67234.50,
          ETH: 3456.78,
          SOL: 145.23,
          BNB: 312.45,
          XRP: 0.6234
        };
        startPrice = fallbackPrices[round.selected_coin];
      }

      const { error } = await supabase
        .from('game_rounds')
        .update({ 
          status: 'predicting',
          start_price: startPrice
        })
        .eq('id', roundId);

      if (error) throw error;
      
      console.log('✅ Prediction phase started with start price:', startPrice);
    } catch (error) {
      console.error('❌ Failed to start prediction phase:', error);
    }
  }

  private async startResolvingPhase(roundId: string) {
    try {
      console.log('⚖️ Starting resolving phase...');
      
      // Get current round details
      const { data: round, error: roundError } = await supabase
        .from('game_rounds')
        .select('*')
        .eq('id', roundId)
        .single();

      if (roundError) throw roundError;

      // Get current price from Binance service
      const currentPrice = binancePriceService.getCurrentPrice(round.selected_coin);
      let endPrice = null;

      if (currentPrice && currentPrice.price > 0) {
        endPrice = currentPrice.price;
        console.log(`💰 Setting end price for ${round.selected_coin}: $${endPrice}`);
      } else {
        console.warn(`⚠️ No valid price data for ${round.selected_coin}, using simulated price`);
        // Simulate price movement based on start price
        const startPrice = round.start_price || 100;
        const changePercent = (Math.random() - 0.5) * 4; // -2% to +2%
        endPrice = startPrice * (1 + changePercent / 100);
      }

      const { error } = await supabase
        .from('game_rounds')
        .update({ 
          status: 'resolving',
          end_price: endPrice
        })
        .eq('id', roundId);

      if (error) throw error;
      
      console.log('✅ Resolving phase started with end price:', endPrice);
    } catch (error) {
      console.error('❌ Failed to start resolving phase:', error);
    }
  }

  private async completeRound(roundId: string) {
    try {
      console.log('🏁 Completing round...');
      
      // Get round details with start and end prices
      const { data: round, error: roundError } = await supabase
        .from('game_rounds')
        .select('*')
        .eq('id', roundId)
        .single();

      if (roundError) throw roundError;

      if (!round.start_price || !round.end_price) {
        console.error('❌ Cannot complete round: missing price data');
        return;
      }

      // Calculate price direction
      const priceDifference = round.end_price - round.start_price;
      let priceDirection: 'up' | 'down' | 'unchanged';
      
      if (Math.abs(priceDifference) < 0.01) {
        priceDirection = 'unchanged';
      } else if (priceDifference > 0) {
        priceDirection = 'up';
      } else {
        priceDirection = 'down';
      }

      console.log(`📊 Price moved ${priceDirection}: $${round.start_price} → $${round.end_price}`);

      // Get all predictions for this round
      const { data: predictions, error: predictionsError } = await supabase
        .from('predictions')
        .select('*')
        .eq('round_id', roundId);

      if (predictionsError) throw predictionsError;

      console.log(`🎯 Processing ${predictions.length} predictions...`);

      // Process each prediction
      for (const prediction of predictions) {
        const isCorrect = prediction.prediction === priceDirection;
        const xpEarned = isCorrect ? 100 : 0;

        // Update prediction with result
        const { error: updatePredictionError } = await supabase
          .from('predictions')
          .update({
            is_correct: isCorrect,
            xp_earned: xpEarned
          })
          .eq('id', prediction.id);

        if (updatePredictionError) {
          console.error('Error updating prediction:', updatePredictionError);
          continue;
        }

        // Update user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', prediction.user_id)
          .single();

        if (profileError) {
          console.error('Error fetching user profile:', profileError);
          continue;
        }

        const newGamesPlayed = profile.games_played + 1;
        const newWins = isCorrect ? profile.wins + 1 : profile.wins;
        const newXp = profile.xp + xpEarned;
        const newStreak = isCorrect ? profile.streak + 1 : 0;

        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({
            games_played: newGamesPlayed,
            wins: newWins,
            xp: newXp,
            streak: newStreak
          })
          .eq('user_id', prediction.user_id);

        if (updateProfileError) {
          console.error('Error updating user profile:', updateProfileError);
          continue;
        }

        console.log(`✅ Updated user ${prediction.user_id}: ${isCorrect ? 'WIN' : 'LOSS'} (+${xpEarned} XP)`);
      }

      // Update round status to completed
      const { error: completeError } = await supabase
        .from('game_rounds')
        .update({ 
          status: 'completed',
          price_direction: priceDirection
        })
        .eq('id', roundId);

      if (completeError) throw completeError;
      
      console.log(`🎉 Round completed! Price went ${priceDirection.toUpperCase()}`);
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
    this.isInitialized = false;
    console.log('🎮 Game logic service disconnected');
  }
}

// Export singleton instance
export const gameLogicService = new GameLogicService();