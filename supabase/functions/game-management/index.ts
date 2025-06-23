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
          selected_coin: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP'
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
          selected_coin: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP'
          start_time?: string | null
          prediction_end_time?: string | null
          end_time?: string | null
          start_price?: number | null
          end_price?: number | null
          price_direction?: 'up' | 'down' | 'unchanged' | null
        }
        Update: {
          status?: 'waiting' | 'predicting' | 'resolving' | 'completed' | 'cancelled'
          selected_coin?: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP'
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

    console.log(`🎮 Game Management API called: ${req.method} ${path}`)

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
    console.error('❌ Game management error:', error)
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
    console.log('🆕 Creating new game round...')
    
    const { data: rounds, error: roundsError } = await supabase
      .from('game_rounds')
      .select('round_number')
      .order('round_number', { ascending: false })
      .limit(1)

    if (roundsError) {
      console.error('❌ Error fetching rounds:', roundsError)
      throw roundsError
    }

    const nextRoundNumber = (rounds && rounds.length > 0) ? rounds[0].round_number + 1 : 1
    
    const defaultCoin = 'BTC'
    
    const now = new Date()
    const startTime = new Date(now.getTime() + 240 * 1000)
    const predictionEndTime = new Date(startTime.getTime() + 60 * 1000)
    const endTime = new Date(predictionEndTime.getTime() + 10 * 1000)

    console.log(`📅 Round ${nextRoundNumber} schedule:`)
    console.log(`   Lobby phase: ${now.toISOString()} -> ${startTime.toISOString()}`)
    console.log(`   Prediction phase: ${startTime.toISOString()} -> ${predictionEndTime.toISOString()}`)
    console.log(`   Resolution: ${predictionEndTime.toISOString()} -> ${endTime.toISOString()}`)

    const { data: newRound, error } = await supabase
      .from('game_rounds')
      .insert([{
        round_number: nextRoundNumber,
        status: 'waiting',
        selected_coin: defaultCoin,
        start_time: startTime.toISOString(),
        prediction_end_time: predictionEndTime.toISOString(),
        end_time: endTime.toISOString()
      }])
      .select()
      .single()

    if (error) {
      console.error('❌ Error inserting new round:', error)
      throw error
    }

    console.log(`✅ New round created: #${nextRoundNumber} with default coin ${defaultCoin}`)

    return new Response(
      JSON.stringify({ success: true, round: newRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error creating new round:', error)
    throw error
  }
}

async function cancelRound(supabase: any, roundId: string) {
  try {
    console.log('❌ [DEBUG] Starting cancelRound function...')
    console.log(`❌ [DEBUG] Received roundId: ${roundId}`)
    
    // Update round status to cancelled
    console.log('❌ [DEBUG] Updating round status to cancelled...')
    const { data: cancelledRound, error: cancelError } = await supabase
      .from('game_rounds')
      .update({ status: 'cancelled' })
      .eq('id', roundId)
      .select()
      .single()

    if (cancelError) {
      console.error('❌ [DEBUG] Error cancelling round:', cancelError)
      throw cancelError
    }

    console.log('❌ [DEBUG] Round cancelled successfully:', {
      id: cancelledRound.id,
      round_number: cancelledRound.round_number,
      status: cancelledRound.status
    })

    console.log('✅ [DEBUG] Round cancelled successfully - returning response')

    const response = { 
      success: true, 
      round: cancelledRound
    }
    console.log('❌ [DEBUG] Final response object:', response)

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ [DEBUG] Error in cancelRound function:', error)
    console.error('❌ [DEBUG] Error stack:', error.stack)
    throw error
  }
}

async function updateDailyPlayStreak(supabase: any, userId: string, profile: any) {
  try {
    const today = new Date().toISOString().split('T')[0]
    const lastPlayedDate = profile.last_played_date
    
    console.log(`🔥 [STREAK] Processing daily streak for user ${userId}:`)
    console.log(`   Today: ${today}`)
    console.log(`   Last played: ${lastPlayedDate}`)
    console.log(`   Current streak: ${profile.daily_play_streak}`)
    
    let newDailyPlayStreak = profile.daily_play_streak
    let streakReward = 0
    let newLastSevenDayRewardDate = profile.last_seven_day_reward_date
    
    if (!lastPlayedDate) {
      newDailyPlayStreak = 1
      console.log(`   [STREAK] First time playing - streak set to 1`)
    } else if (lastPlayedDate === today) {
      console.log(`   [STREAK] Already played today - no streak change`)
      return { streakReward: 0, newDailyPlayStreak, newLastSevenDayRewardDate }
    } else {
      const lastDate = new Date(lastPlayedDate)
      const todayDate = new Date(today)
      const daysDifference = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
      
      console.log(`   [STREAK] Days since last play: ${daysDifference}`)
      
      if (daysDifference === 1) {
        newDailyPlayStreak = profile.daily_play_streak + 1
        console.log(`   [STREAK] Consecutive day - streak incremented to ${newDailyPlayStreak}`)
        
        if (newDailyPlayStreak === 7) {
          const lastRewardDate = profile.last_seven_day_reward_date
          
          if (!lastRewardDate || 
              Math.floor((todayDate.getTime() - new Date(lastRewardDate).getTime()) / (1000 * 60 * 60 * 24)) >= 7) {
            streakReward = 300
            newLastSevenDayRewardDate = today
            newDailyPlayStreak = 0
            console.log(`   [STREAK] 🎉 7-day streak achieved! Awarding 300 XP and resetting streak`)
          } else {
            console.log(`   [STREAK] 7-day streak achieved but reward already given recently`)
          }
        }
      } else {
        newDailyPlayStreak = 1
        console.log(`   [STREAK] Streak broken (${daysDifference} days gap) - reset to 1`)
      }
    }
    
    return { streakReward, newDailyPlayStreak, newLastSevenDayRewardDate }
  } catch (error) {
    console.error('❌ [STREAK] Error calculating daily play streak:', error)
    return { streakReward: 0, newDailyPlayStreak: profile.daily_play_streak, newLastSevenDayRewardDate: profile.last_seven_day_reward_date }
  }
}

async function makePrediction(supabase: any, roundId: string, userId: string, prediction: 'up' | 'down', chosenCoin: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP', predictedPrice: number, xpBet: number) {
  try {
    console.log(`🎯 Making prediction: ${prediction} for ${chosenCoin} by user ${userId} with ${xpBet} XP bet`)
    
    if (!xpBet || xpBet < 10 || xpBet > 100 || xpBet % 10 !== 0) {
      throw new Error('Invalid XP bet amount. Must be between 10-100 in increments of 10.')
    }
    
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      console.error('❌ Error fetching round:', roundError)
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
      console.error('❌ Error checking existing prediction:', existingError)
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
      console.error('❌ Error fetching user profile:', profileError)
      throw new Error('Failed to fetch user profile')
    }

    if (profile.xp < xpBet) {
      throw new Error(`Insufficient XP! You need at least ${xpBet} XP to make this prediction.`)
    }

    const { streakReward, newDailyPlayStreak, newLastSevenDayRewardDate } = await updateDailyPlayStreak(supabase, userId, profile)
    
    let roundCoinLocked = false
    if (round.selected_coin === 'BTC' && chosenCoin !== 'BTC') {
      console.log(`🔒 Locking round coin to ${chosenCoin}`)
      
      const { error: updateRoundError } = await supabase
        .from('game_rounds')
        .update({ selected_coin: chosenCoin })
        .eq('id', roundId)

      if (updateRoundError) {
        console.error('❌ Error updating round coin:', updateRoundError)
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
      console.error('❌ Error updating user profile:', updateProfileError)
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
      console.error('❌ Error creating prediction:', predictionError)
      
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

    console.log(`✅ Prediction created successfully with locked price: ${predictedPrice} and XP bet: ${xpBet}`)
    if (streakReward > 0) {
      console.log(`🎉 Daily streak reward: +${streakReward} XP`)
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
    console.error('❌ Error making prediction:', error)
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
    console.log('🎯 Starting prediction phase...')
    
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      console.error('❌ Error fetching round:', roundError)
      throw roundError
    }

    let finalStartPrice = startPrice
    if (!finalStartPrice) {
      const fallbackPrices = {
        BTC: 67234.50,
        ETH: 3456.78,
        SOL: 145.23,
        BNB: 312.45,
        XRP: 0.6234
      }
      finalStartPrice = fallbackPrices[round.selected_coin]
    }

    console.log(`📊 Setting start price for ${round.selected_coin}: ${finalStartPrice}`)

    const { data: updatedRound, error } = await supabase
      .from('game_rounds')
      .update({ 
        status: 'predicting',
        start_price: finalStartPrice
      })
      .eq('id', roundId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating round to predicting:', error)
      throw error
    }

    console.log('✅ Prediction phase started successfully')

    return new Response(
      JSON.stringify({ success: true, round: updatedRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error starting prediction phase:', error)
    throw error
  }
}

async function startResolvingPhase(supabase: any, roundId: string, endPrice?: number) {
  try {
    console.log('⚖️ Starting resolving phase...')
    
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      console.error('❌ Error fetching round:', roundError)
      throw roundError
    }

    let finalEndPrice = endPrice
    if (!finalEndPrice) {
      const startPrice = round.start_price || 100
      const changePercent = (Math.random() - 0.5) * 4
      finalEndPrice = startPrice * (1 + changePercent / 100)
    }

    console.log(`📊 Setting end price for ${round.selected_coin}: ${finalEndPrice}`)

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
      console.error('❌ Error updating round to resolving:', error)
      throw error
    }

    console.log('✅ Resolving phase started successfully')

    return new Response(
      JSON.stringify({ success: true, round: updatedRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error starting resolving phase:', error)
    throw error
  }
}

async function completeRound(supabase: any, roundId: string) {
  try {
    console.log('🏁 [DEBUG] Starting completeRound function...')
    console.log(`🏁 [DEBUG] Received roundId: ${roundId}`)
    
    console.log('🏁 [DEBUG] Checking for predictions in this round...')
    const { data: predictions, error: predictionsCountError } = await supabase
      .from('predictions')
      .select('id')
      .eq('round_id', roundId)

    if (predictionsCountError) {
      console.error('❌ [DEBUG] Error counting predictions:', predictionsCountError)
      throw predictionsCountError
    }

    const predictionCount = predictions ? predictions.length : 0
    console.log(`🏁 [DEBUG] Found ${predictionCount} predictions for this round`)

    if (predictionCount === 0) {
      console.log('🏁 [DEBUG] No predictions found, marking round as cancelled...')
      
      const { data: cancelledRound, error: cancelError } = await supabase
        .from('game_rounds')
        .update({ status: 'cancelled' })
        .eq('id', roundId)
        .select()
        .single()

      if (cancelError) {
        console.error('❌ [DEBUG] Error cancelling round:', cancelError)
        throw cancelError
      }

      console.log('✅ [DEBUG] Round cancelled successfully - no new round will be created')
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          round: cancelledRound,
          hasPredictions: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('🏁 [DEBUG] Predictions found, proceeding with normal completion...')
    
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      console.error('❌ [DEBUG] Error fetching round for completion:', roundError)
      throw roundError
    }

    console.log('🏁 [DEBUG] Round fetched successfully:', {
      id: round.id,
      round_number: round.round_number,
      status: round.status,
      selected_coin: round.selected_coin,
      start_price: round.start_price,
      end_price: round.end_price,
      price_direction: round.price_direction
    })

    if (!round.start_price || !round.end_price) {
      console.error('❌ [DEBUG] Cannot complete round: missing price data', { 
        start_price: round.start_price, 
        end_price: round.end_price 
      })
      throw new Error('Cannot complete round: missing price data')
    }

    console.log(`📊 [DEBUG] Round ${round.round_number} price data:`)
    console.log(`   Start: ${round.start_price}`)
    console.log(`   End: ${round.end_price}`)
    console.log(`   Coin: ${round.selected_coin}`)

    const priceDifference = round.end_price - round.start_price
    let priceDirection: 'up' | 'down' | 'unchanged'
    
    if (Math.abs(priceDifference) < 0.01) {
      priceDirection = 'unchanged'
    } else if (priceDifference > 0) {
      priceDirection = 'up'
    } else {
      priceDirection = 'down'
    }

    console.log(`📈 [DEBUG] Price direction calculated: ${priceDirection} (difference: ${priceDifference > 0 ? '+' : ''}${priceDifference.toFixed(8)})`)

    console.log('🏁 [DEBUG] Fetching predictions for this round...')
    const { data: allPredictions, error: allPredictionsError } = await supabase
      .from('predictions')
      .select('*')
      .eq('round_id', roundId)

    if (allPredictionsError) {
      console.error('❌ [DEBUG] Error fetching predictions:', allPredictionsError)
      throw allPredictionsError
    }

    console.log(`📊 [DEBUG] Found ${allPredictions.length} predictions for round ${round.round_number}`)
    console.log('📊 [DEBUG] Predictions details:', allPredictions.map(p => ({
      id: p.id,
      user_id: p.user_id,
      prediction: p.prediction,
      predicted_price: p.predicted_price,
      xp_bet: p.xp_bet,
      predicted_at: p.predicted_at
    })))

    let correctPredictions = 0
    let totalPredictions = allPredictions.length

    console.log('🏁 [DEBUG] Starting to process individual predictions...')

    for (const prediction of allPredictions) {
      console.log(`🔍 [DEBUG] Processing prediction ${prediction.id} by user ${prediction.user_id}:`)
      console.log(`   Prediction: ${prediction.prediction}`)
      console.log(`   Predicted Price: ${prediction.predicted_price}`)
      console.log(`   XP Bet: ${prediction.xp_bet}`)
      
      let isCorrect = false
      
      if (prediction.predicted_price !== null && round.end_price !== null) {
        const individualPriceDifference = round.end_price - prediction.predicted_price
        
        console.log(`   [DEBUG] Individual price difference: ${individualPriceDifference.toFixed(8)}`)
        console.log(`   [DEBUG] Checking UP condition: ${individualPriceDifference > 0} && ${prediction.prediction === 'up'} = ${individualPriceDifference > 0 && prediction.prediction === 'up'}`)
        console.log(`   [DEBUG] Checking DOWN condition: ${individualPriceDifference < 0} && ${prediction.prediction === 'down'} = ${individualPriceDifference < 0 && prediction.prediction === 'down'}`)
        
        if (individualPriceDifference > 0 && prediction.prediction === 'up') {
          isCorrect = true
          console.log(`   [DEBUG] Result: CORRECT (predicted UP, price went UP by ${individualPriceDifference.toFixed(8)})`)
        } else if (individualPriceDifference < 0 && prediction.prediction === 'down') {
          isCorrect = true
          console.log(`   [DEBUG] Result: CORRECT (predicted DOWN, price went DOWN by ${Math.abs(individualPriceDifference).toFixed(8)})`)
        } else if (individualPriceDifference === 0) {
          isCorrect = false
          console.log(`   [DEBUG] Result: WRONG (price unchanged, no winners)`)
        } else {
          console.log(`   [DEBUG] Result: WRONG (predicted ${prediction.prediction.toUpperCase()}, price went ${individualPriceDifference > 0 ? 'UP' : 'DOWN'})`)
        }
      } else {
        isCorrect = prediction.prediction === priceDirection
        console.log(`   [DEBUG] Result: ${isCorrect ? 'CORRECT' : 'WRONG'} (fallback to round-level comparison)`)
      }
      
      if (isCorrect) correctPredictions++
      
      const baseXp = isCorrect ? prediction.xp_bet * 2 : 0
      
      console.log(`   [DEBUG] Fetching user profile for stats update...`)
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', prediction.user_id)
        .single()
      
      if (profileFetchError) {
        console.error(`❌ [DEBUG] Error fetching profile for user ${prediction.user_id}:`, profileFetchError)
        continue
      }
      
      console.log(`   [DEBUG] User profile fetched:`, {
        user_id: profile.user_id,
        username: profile.username,
        current_xp: profile.xp,
        current_games_played: profile.games_played,
        current_wins: profile.wins
      })
      
      const totalXpEarned = baseXp

      console.log(`   [DEBUG] XP Calculation: ${baseXp} base (${prediction.xp_bet} bet × 2) = ${totalXpEarned} total`)

      console.log(`   [DEBUG] Updating prediction with results...`)
      const { error: updatePredictionError } = await supabase
        .from('predictions')
        .update({
          is_correct: isCorrect,
          xp_earned: totalXpEarned
        })
        .eq('id', prediction.id)

      if (updatePredictionError) {
        console.error('❌ [DEBUG] Error updating prediction:', updatePredictionError)
        continue
      }

      console.log(`   [DEBUG] Prediction updated successfully`)

      const newGamesPlayed = profile.games_played + 1
      const newWins = isCorrect ? profile.wins + 1 : profile.wins
      const newXp = profile.xp + totalXpEarned

      console.log(`   [DEBUG] New profile values calculated:`, {
        newGamesPlayed,
        newWins,
        newXp
      })

      console.log(`   [DEBUG] Updating user profile...`)
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          games_played: newGamesPlayed,
          wins: newWins,
          xp: newXp
        })
        .eq('user_id', prediction.user_id)

      if (updateProfileError) {
        console.error('❌ [DEBUG] Error updating user profile:', updateProfileError)
        continue
      }

      console.log(`✅ [DEBUG] Updated user ${prediction.user_id}: ${isCorrect ? 'WIN' : 'LOSS'}, +${totalXpEarned} XP (bet: ${prediction.xp_bet})`)
    }

    console.log(`📊 [DEBUG] Round completion summary: ${correctPredictions}/${totalPredictions} correct predictions`)

    console.log('🏁 [DEBUG] Updating round status to completed...')
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
      console.error('❌ [DEBUG] Error marking round as completed:', completeError)
      throw completeError
    }

    console.log('🏁 [DEBUG] Round status updated successfully:', {
      id: completedRound.id,
      round_number: completedRound.round_number,
      status: completedRound.status,
      price_direction: completedRound.price_direction,
      start_price: completedRound.start_price,
      end_price: completedRound.end_price
    })

    console.log('✅ [DEBUG] Round completed successfully - returning response')

    const response = { 
      success: true, 
      round: completedRound,
      hasPredictions: true
    }
    console.log('🏁 [DEBUG] Final response object:', response)

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ [DEBUG] Error in completeRound function:', error)
    console.error('❌ [DEBUG] Error stack:', error.stack)
    throw error
  }
}