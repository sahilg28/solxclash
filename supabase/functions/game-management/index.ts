import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE',
}

interface Database {
  public: {
    Tables: {
      game_rounds: {
        Row: {
          id: string
          round_number: number
          status: 'waiting' | 'predicting' | 'resolving' | 'completed' | 'cancelled'
          selected_coin: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP' | null
          start_time: string | null
          prediction_end_time: string | null
          end_time: string | null
          start_price: number | null
          end_price: number | null
          price_direction: 'up' | 'down' | 'unchanged' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          round_number: number
          status?: 'waiting' | 'predicting' | 'resolving' | 'completed' | 'cancelled'
          selected_coin?: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP' | null
          start_time?: string | null
          prediction_end_time?: string | null
          end_time?: string | null
          start_price?: number | null
          end_price?: number | null
          price_direction?: 'up' | 'down' | 'unchanged' | null
        }
        Update: {
          status?: 'waiting' | 'predicting' | 'resolving' | 'completed' | 'cancelled'
          selected_coin?: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP' | null
          start_price?: number | null
          end_price?: number | null
          price_direction?: 'up' | 'down' | 'unchanged' | null
        }
      }
      predictions: {
        Row: {
          id: string
          round_id: string
          user_id: string
          prediction: 'up' | 'down'
          predicted_at: string
          predicted_price: number | null
          is_correct: boolean | null
          xp_earned: number
          xp_bet: number
          created_at: string
        }
        Insert: {
          round_id: string
          user_id: string
          prediction: 'up' | 'down'
          predicted_at?: string
          predicted_price?: number | null
          is_correct?: boolean | null
          xp_earned?: number
          xp_bet?: number
        }
        Update: {
          is_correct?: boolean | null
          xp_earned?: number
          xp_bet?: number
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          full_name: string | null
          username: string
          avatar_url: string | null
          email: string | null
          created_at: string
          updated_at: string
          xp: number
          games_played: number
          wins: number
          streak: number
          country: string | null
          last_played_date: string | null
          daily_play_streak: number
          last_seven_day_reward_date: string | null
        }
        Update: {
          xp?: number
          games_played?: number
          wins?: number
          streak?: number
          country?: string | null
          last_played_date?: string | null
          daily_play_streak?: number
          last_seven_day_reward_date?: string | null
        }
      }
    }
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const url = new URL(req.url)
    const path = url.pathname

    if (path === '/game-management/create-round' && req.method === 'POST') {
      return await createNewRound(supabaseClient)
    }
    
    if (path === '/game-management/start-prediction' && req.method === 'POST') {
      const { roundId, startPrice } = await req.json()
      return await startPredictionPhase(supabaseClient, roundId, startPrice)
    }
    
    if (path === '/game-management/start-resolving' && req.method === 'POST') {
      const { roundId, endPrice } = await req.json()
      return await startResolvingPhase(supabaseClient, roundId, endPrice)
    }
    
    if (path === '/game-management/complete-round' && req.method === 'POST') {
      const { roundId } = await req.json()
      return await completeRound(supabaseClient, roundId)
    }

    if (path === '/game-management/cancel-round' && req.method === 'POST') {
      const { roundId } = await req.json()
      return await cancelRound(supabaseClient, roundId)
    }

    if (path === '/game-management/make-prediction' && req.method === 'POST') {
      const { roundId, userId, prediction, chosenCoin, predictedPrice, xpBet } = await req.json()
      return await makePrediction(supabaseClient, roundId, userId, prediction, chosenCoin, predictedPrice, xpBet)
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function createNewRound(supabase: any) {
  try {
    const { data: rounds, error: roundsError } = await supabase
      .from('game_rounds')
      .select('round_number')
      .order('round_number', { ascending: false })
      .limit(1)

    if (roundsError) {
      throw roundsError
    }

    const nextRoundNumber = (rounds && rounds.length > 0) ? rounds[0].round_number + 1 : 1
    
    const now = new Date()
    const startTime = new Date(now.getTime() + 240 * 1000)
    const predictionEndTime = new Date(startTime.getTime() + 60 * 1000)
    const endTime = new Date(predictionEndTime.getTime() + 10 * 1000)

    const { data: newRound, error } = await supabase
      .from('game_rounds')
      .insert([{
        round_number: nextRoundNumber,
        status: 'waiting',
        selected_coin: null,
        start_time: startTime.toISOString(),
        prediction_end_time: predictionEndTime.toISOString(),
        end_time: endTime.toISOString()
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, round: newRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    throw error
  }
}

async function cancelRound(supabase: any, roundId: string) {
  try {
    const { data: cancelledRound, error: cancelError } = await supabase
      .from('game_rounds')
      .update({ status: 'cancelled' })
      .eq('id', roundId)
      .select()
      .single()

    if (cancelError) {
      throw cancelError
    }

    const response = { 
      success: true, 
      round: cancelledRound
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    throw error
  }
}

async function updateDailyPlayStreak(supabase: any, userId: string, profile: any) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const lastPlayedDate = profile.last_played_date
    
    let newDailyPlayStreak = profile.daily_play_streak
    let streakReward = 0
    let newLastSevenDayRewardDate = profile.last_seven_day_reward_date
    
    if (!lastPlayedDate) {
      newDailyPlayStreak = 1
    } else if (lastPlayedDate === today) {
      return { streakReward: 0, newDailyPlayStreak, newLastSevenDayRewardDate }
    } else {
      const lastDate = new Date(lastPlayedDate)
      const todayDate = new Date(today)
      const daysDifference = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDifference === 1) {
        newDailyPlayStreak = profile.daily_play_streak + 1
        
        if (newDailyPlayStreak === 7) {
          const lastRewardDate = profile.last_seven_day_reward_date
          
          if (!lastRewardDate || 
              Math.floor((todayDate.getTime() - new Date(lastRewardDate).getTime()) / (1000 * 60 * 60 * 24)) >= 7) {
            streakReward = 300
            newLastSevenDayRewardDate = today
            newDailyPlayStreak = 0
          }
        }
      } else {
        newDailyPlayStreak = 1
      }
    }
    
    return { streakReward, newDailyPlayStreak, newLastSevenDayRewardDate }
  } catch (error) {
    return { streakReward: 0, newDailyPlayStreak: profile.daily_play_streak, newLastSevenDayRewardDate: profile.last_seven_day_reward_date }
  }
}

async function makePrediction(supabase: any, roundId: string, userId: string, prediction: 'up' | 'down', chosenCoin: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP', predictedPrice: number, xpBet: number) {
  try {
    if (!xpBet || xpBet < 10 || xpBet > 100 || xpBet % 10 !== 0) {
      throw new Error('Invalid XP bet amount. Must be between 10-100 in increments of 10.')
    }
    
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      throw new Error('Round not found')
    }

    if (round.status !== 'waiting') {
      throw new Error('Predictions can only be made during the lobby phase')
    }

    const { data: existingPrediction, error: existingError } = await supabase
      .from('predictions')
      .select('id')
      .eq('round_id', roundId)
      .eq('user_id', userId)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      throw new Error('Failed to check existing predictions')
    }

    if (existingPrediction) {
      throw new Error('You have already made a prediction for this round')
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      throw new Error('Failed to fetch user profile')
    }

    if (profile.xp < xpBet) {
      throw new Error(`Insufficient XP! You need at least ${xpBet} XP to make this prediction.`)
    }

    const { streakReward, newDailyPlayStreak, newLastSevenDayRewardDate } = await updateDailyPlayStreak(supabase, userId, profile)
    
    let roundCoinLocked = false
    if (round.selected_coin === null) {
      const { error: updateRoundError } = await supabase
        .from('game_rounds')
        .update({ selected_coin: chosenCoin })
        .eq('id', roundId)

      if (updateRoundError) {
        throw new Error('Failed to lock round coin')
      }
      
      roundCoinLocked = true
    } else if (round.selected_coin !== chosenCoin) {
      throw new Error(`This round is locked to ${round.selected_coin}. You cannot predict on ${chosenCoin}.`)
    }

    const newXp = profile.xp - xpBet + streakReward
    const today = new Date().toISOString().split('T')[0]
    
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({ 
        xp: newXp,
        last_played_date: today,
        daily_play_streak: newDailyPlayStreak,
        last_seven_day_reward_date: newLastSevenDayRewardDate
      })
      .eq('user_id', userId)

    if (updateProfileError) {
      throw new Error('Failed to update user profile')
    }

    const { data: newPrediction, error: predictionError } = await supabase
      .from('predictions')
      .insert([{
        round_id: roundId,
        user_id: userId,
        prediction: prediction,
        predicted_price: predictedPrice,
        xp_bet: xpBet
      }])
      .select()
      .single()

    if (predictionError) {
      await supabase
        .from('profiles')
        .update({ 
          xp: profile.xp,
          last_played_date: profile.last_played_date,
          daily_play_streak: profile.daily_play_streak,
          last_seven_day_reward_date: profile.last_seven_day_reward_date
        })
        .eq('user_id', userId)
      
      throw new Error('Failed to create prediction')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        prediction: newPrediction,
        roundCoinLocked,
        lockedCoin: chosenCoin,
        streakReward,
        newDailyPlayStreak
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}

async function startPredictionPhase(supabase: any, roundId: string, startPrice?: number) {
  try {
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      throw roundError
    }

    const coinToUse = round.selected_coin || 'BTC'

    let finalStartPrice = startPrice
    if (!finalStartPrice) {
      const fallbackPrices = {
        BTC: 67234.50,
        ETH: 3456.78,
        SOL: 145.23,
        BNB: 312.45,
        XRP: 0.6234
      }
      finalStartPrice = fallbackPrices[coinToUse]
    }

    const updateData: any = { 
      status: 'predicting',
      start_price: finalStartPrice
    }

    if (round.selected_coin === null) {
      updateData.selected_coin = 'BTC'
    }

    const { data: updatedRound, error } = await supabase
      .from('game_rounds')
      .update(updateData)
      .eq('id', roundId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, round: updatedRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    throw error
  }
}

async function startResolvingPhase(supabase: any, roundId: string, endPrice?: number) {
  try {
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      throw roundError
    }

    const coinToUse = round.selected_coin || 'BTC'

    let finalEndPrice = endPrice
    if (!finalEndPrice) {
      const startPrice = round.start_price || 100
      const changePercent = (Math.random() - 0.5) * 4
      finalEndPrice = startPrice * (1 + changePercent / 100)
    }

    const { data: updatedRound, error } = await supabase
      .from('game_rounds')
      .update({ 
        status: 'resolving',
        end_price: finalEndPrice
      })
      .eq('id', roundId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ success: true, round: updatedRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    throw error
  }
}

async function completeRound(supabase: any, roundId: string) {
  try {
    const { data: predictions, error: predictionsCountError } = await supabase
      .from('predictions')
      .select('id')
      .eq('round_id', roundId)

    if (predictionsCountError) {
      throw predictionsCountError
    }

    const predictionCount = predictions ? predictions.length : 0

    if (predictionCount === 0) {
      const { data: cancelledRound, error: cancelError } = await supabase
        .from('game_rounds')
        .update({ status: 'cancelled' })
        .eq('id', roundId)
        .select()
        .single()

      if (cancelError) {
        throw cancelError
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          round: cancelledRound,
          hasPredictions: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      throw roundError
    }

    if (!round.start_price || !round.end_price) {
      throw new Error('Cannot complete round: missing price data')
    }

    const priceDifference = round.end_price - round.start_price
    let priceDirection: 'up' | 'down' | 'unchanged'
    
    if (Math.abs(priceDifference) < 0.01) {
      priceDirection = 'unchanged'
    } else if (priceDifference > 0) {
      priceDirection = 'up'
    } else {
      priceDirection = 'down'
    }

    const { data: allPredictions, error: allPredictionsError } = await supabase
      .from('predictions')
      .select('*')
      .eq('round_id', roundId)

    if (allPredictionsError) {
      throw allPredictionsError
    }

    let correctPredictions = 0
    let totalPredictions = allPredictions.length

    for (const prediction of allPredictions) {
      let isCorrect = false
      
      if (prediction.predicted_price !== null && round.end_price !== null) {
        const individualPriceDifference = round.end_price - prediction.predicted_price
        
        if (individualPriceDifference > 0 && prediction.prediction === 'up') {
          isCorrect = true
        } else if (individualPriceDifference < 0 && prediction.prediction === 'down') {
          isCorrect = true
        } else if (individualPriceDifference === 0) {
          isCorrect = false
        }
      } else {
        isCorrect = prediction.prediction === priceDirection
      }
      
      if (isCorrect) correctPredictions++
      
      const baseXp = isCorrect ? prediction.xp_bet * 2 : 0
      
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', prediction.user_id)
        .single()
      
      if (profileFetchError) {
        continue
      }
      
      const totalXpEarned = baseXp

      const { error: updatePredictionError } = await supabase
        .from('predictions')
        .update({
          is_correct: isCorrect,
          xp_earned: totalXpEarned
        })
        .eq('id', prediction.id)

      if (updatePredictionError) {
        continue
      }

      const newGamesPlayed = profile.games_played + 1
      const newWins = isCorrect ? profile.wins + 1 : profile.wins
      const newXp = profile.xp + totalXpEarned

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          games_played: newGamesPlayed,
          wins: newWins,
          xp: newXp
        })
        .eq('user_id', prediction.user_id)

      if (updateProfileError) {
        continue
      }
    }

    const { data: completedRound, error: completeError } = await supabase
      .from('game_rounds')
      .update({ 
        status: 'completed',
        price_direction: priceDirection
      })
      .eq('id', roundId)
      .select()
      .single()

    if (completeError) {
      throw completeError
    }

    const response = { 
      success: true, 
      round: completedRound,
      hasPredictions: true
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    throw error
  }
}