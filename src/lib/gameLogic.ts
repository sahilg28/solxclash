import { supabase } from './supabase';
import { CoinSymbol, PriceData, binancePriceService } from './binancePriceService';

export interface GameRound {
  id: string;
  round_number: number;
  status: 'waiting' | 'predicting' | 'resolving' | 'completed' | 'cancelled';
  selected_coin: CoinSymbol | null;
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
  xp_bet: number;
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
    this.setupRealtimeSubscription();
  }

  public async initializeGameState() {
    if (this.isInitialized) {
      return;
    }

    try {
      const { data: rounds, error } = await supabase
        .from('game_rounds')
        .select('*')
        .in('status', ['waiting', 'predicting', 'resolving'])
        .order('round_number', { ascending: false })
        .limit(1);

      if (error) {
        return;
      }

      if (rounds && rounds.length > 0) {
        this.currentGameState.currentRound = rounds[0];
        this.updateGamePhase();
      } else {
        await this.createNewRound();
      }

      this.startGameTimer();
      this.isInitialized = true;
    } catch (error) {
      // Silent fail
    }
  }

  private setupRealtimeSubscription() {
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
        if (round.end_time) {
          const endTime = new Date(round.end_time);
          this.currentGameState.timeLeft = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
        } else {
          this.currentGameState.timeLeft = 10;
        }
        break;
      
      case 'completed':
      case 'cancelled':
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
          const hasPredictions = await this.checkRoundHasPredictions(round.id);
          
          if (hasPredictions) {
            await this.startPredictionPhase(round.id);
          } else {
            await this.cancelRound(round.id);
            setTimeout(async () => {
              await this.createNewRound();
            }, 2000);
          }
          break;
        
        case 'predicting':
          await this.startResolvingPhase(round.id);
          break;
        
        case 'resolving':
          const result = await this.completeRound(round.id);
          
          if (result && result.hasPredictions) {
            setTimeout(async () => {
              await this.createNewRound();
            }, 1000);
          } else {
            this.currentGameState.phase = 'completed';
            this.notifySubscribers();
          }
          break;
      }
    } catch (error) {
      // Silent fail
    }
  }

  private async checkRoundHasPredictions(roundId: string): Promise<boolean> {
    try {
      const { data: predictions, error } = await supabase
        .from('predictions')
        .select('id')
        .eq('round_id', roundId)
        .limit(1);

      if (error) {
        return false;
      }

      const hasPredictions = predictions && predictions.length > 0;
      return hasPredictions;
    } catch (error) {
      return false;
    }
  }

  private async cancelRound(roundId: string) {
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/game-management/cancel-round`, {
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
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to cancel round');
      }

      this.currentGameState.currentRound = result.round;
      this.updateGamePhase();
      this.notifySubscribers();
    } catch (error) {
      // Silent fail
    }
  }

  private async updateDailyPlayStreak(supabase: any, userId: string, profile: any) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const lastPlayedDate = profile.last_played_date;
      
      let newDailyPlayStreak = profile.daily_play_streak;
      let streakReward = 0;
      let newLastSevenDayRewardDate = profile.last_seven_day_reward_date;
      
      if (!lastPlayedDate) {
        newDailyPlayStreak = 1;
      } else if (lastPlayedDate === today) {
        return { streakReward: 0, newDailyPlayStreak, newLastSevenDayRewardDate };
      } else {
        const lastDate = new Date(lastPlayedDate);
        const todayDate = new Date(today);
        const daysDifference = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDifference === 1) {
          newDailyPlayStreak = profile.daily_play_streak + 1;
          
          if (newDailyPlayStreak === 7) {
            const lastRewardDate = profile.last_seven_day_reward_date;
            
            if (!lastRewardDate || 
                Math.floor((todayDate.getTime() - new Date(lastRewardDate).getTime()) / (1000 * 60 * 60 * 24)) >= 7) {
              streakReward = 300;
              newLastSevenDayRewardDate = today;
              newDailyPlayStreak = 0;
            }
          }
        } else {
          newDailyPlayStreak = 1;
        }
      }
      
      return { streakReward, newDailyPlayStreak, newLastSevenDayRewardDate };
    } catch (error) {
      return { streakReward: 0, newDailyPlayStreak: profile.daily_play_streak, newLastSevenDayRewardDate: profile.last_seven_day_reward_date };
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
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to create new round');
      }

      this.currentGameState.currentRound = result.round;
      this.currentGameState.userPrediction = null;
      this.updateGamePhase();
      this.notifySubscribers();
    } catch (error) {
      // Silent fail
    }
  }

  private async startPredictionPhase(roundId: string) {
    try {
      const round = this.currentGameState.currentRound;
      if (!round) return;

      const coinToUse = round.selected_coin || 'BTC';
      const currentPrice = binancePriceService.getCurrentPrice(coinToUse);
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start prediction phase');
      }

      this.currentGameState.currentRound = result.round;
      this.updateGamePhase();
      this.notifySubscribers();
    } catch (error) {
      // Silent fail
    }
  }

  private async startResolvingPhase(roundId: string) {
    try {
      const round = this.currentGameState.currentRound;
      if (!round) return;

      const coinToUse = round.selected_coin || 'BTC';
      const currentPrice = binancePriceService.getCurrentPrice(coinToUse);
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
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to start resolving phase');
      }

      this.currentGameState.currentRound = result.round;
      this.updateGamePhase();
      this.notifySubscribers();
    } catch (error) {
      // Silent fail
    }
  }

  private async completeRound(roundId: string): Promise<{ hasPredictions: boolean } | null> {
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
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to complete round');
      }

      this.currentGameState.currentRound = result.round;
      this.updateGamePhase();
      this.notifySubscribers();
      
      return { hasPredictions: result.hasPredictions || false };
    } catch (error) {
      return null;
    }
  }

  public async makePrediction(prediction: 'up' | 'down', userId: string, chosenCoin: CoinSymbol, xpBet: number) {
    const round = this.currentGameState.currentRound;
    if (!round || round.status !== 'waiting') {
      throw new Error('Predictions can only be made during the lobby phase');
    }

    try {
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
          predictedPrice: currentPrice.price,
          xpBet
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to make prediction');
      }

      this.currentGameState.userPrediction = result.prediction;
      
      if (result.roundCoinLocked && this.currentGameState.currentRound) {
        this.currentGameState.currentRound.selected_coin = result.lockedCoin;
      }
      
      this.notifySubscribers();
      
      return result;
    } catch (error) {
      throw error;
    }
  }

  public async getUserPrediction(roundId: string, userId: string) {
    try {
      // console.log('🔍 Fetching user prediction:', { roundId, userId });
      
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('round_id', roundId)
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // console.error('❌ Error fetching user prediction:', error);
        throw error;
      }

      // console.log('📊 User prediction result:', data ? {
      //   id: data.id,
      //   prediction: data.prediction,
      //   isCorrect: data.is_correct,
      //   xpEarned: data.xp_earned
      // } : 'No prediction found');

      this.currentGameState.userPrediction = data;
      this.notifySubscribers();
      return data;
    } catch (error) {
      // console.error('❌ getUserPrediction error:', error);
      return null;
    }
  }

  public subscribe(callback: (state: GameState) => void): () => void {
    this.gameStateSubscribers.add(callback);
    
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
        // Silent fail
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
      // Silent fail
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

export const gameLogicService = new GameLogicService();