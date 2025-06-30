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
          selected_coin: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'POL' | null
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
          selected_coin?: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'POL' | null
          start_time?: string | null
          prediction_end_time?: string | null
          end_time?: string | null
          start_price?: number | null
          end_price?: number | null
          price_direction?: 'up' | 'down' | 'unchanged' | null
        }
        Update: {
          status?: 'waiting' | 'predicting' | 'resolving' | 'completed' | 'cancelled'
          selected_coin?: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'POL' | null
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
          country: string | null
          last_played_date: string | null
          daily_play_streak: number
          last_seven_day_reward_date: string | null
        }
        Update: {
          xp?: number
          games_played?: number
          wins?: number
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
      // Get the latest round (highest round_number)
      const { data: latestRound, error: latestError } = await supabaseClient
        .from('game_rounds')
        .select('round_number, status')
        .order('round_number', { ascending: false })
        .limit(1)
        .single();

      if (latestError) throw latestError;

      // Only block if the latest round is 'waiting' or 'predicting'
      if (latestRound && (latestRound.status === 'waiting' || latestRound.status === 'predicting')) {
        return new Response(
          JSON.stringify({ error: 'A round is already in progress.' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Safe to create the next round (will be latestRound.round_number + 1)
      return await createNewRound(supabaseClient);
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

    // Background cleanup endpoint (to be called by a scheduler/cron every 30-60 min)
    if (path === '/game-management/cleanup-stuck-rounds' && req.method === 'POST') {
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000).toISOString();

      // Find rounds in 'waiting' or 'predicting' that are older than 30 min
      const { data: stuckRounds, error: stuckError } = await supabaseClient
        .from('game_rounds')
        .select('id')
        .in('status', ['waiting', 'predicting'])
        .lt('created_at', thirtyMinutesAgo);

      if (stuckError) {
        throw stuckError;
      }

      let cancelled = 0;
      if (stuckRounds && stuckRounds.length > 0) {
        for (const round of stuckRounds) {
          await cancelRound(supabaseClient, round.id);
          cancelled++;
        }
      }

      return new Response(
        JSON.stringify({ success: true, cancelled }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (path === '/game-management/cancel-stale-waiting-rounds' && req.method === 'POST') {
      const result = await cancelStaleWaitingRounds(supabaseClient);
      return new Response(
        JSON.stringify({ success: true, ...result }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Edge Function Error:', error)
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
    // console.log('🎮 Creating new round...')
    
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

    // console.log('✅ New round created:', newRound.id, 'Round #', newRound.round_number)

    return new Response(
      JSON.stringify({ success: true, round: newRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ createNewRound error:', error)
    throw error
  }
}

async function cancelRound(supabase: any, roundId: string) {
  try {
    // console.log('❌ Cancelling round:', roundId)
    
    const { data: cancelledRound, error: cancelError } = await supabase
      .from('game_rounds')
      .update({ status: 'cancelled' })
      .eq('id', roundId)
      .select()
      .single()

    if (cancelError) {
      throw cancelError
    }

    // console.log('✅ Round cancelled:', roundId)

    const response = { 
      success: true, 
      round: cancelledRound
    }

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ cancelRound error:', error)
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

async function makePrediction(supabase: any, roundId: string, userId: string, prediction: 'up' | 'down', chosenCoin: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'POL', predictedPrice: number, xpBet: number) {
  try {
    // console.log('🎯 Making prediction:', {
    //   roundId,
    //   userId,
    //   prediction,
    //   chosenCoin,
    //   predictedPrice,
    //   xpBet
    // })

    // Validate input parameters
    if (!roundId || !userId || !prediction || !chosenCoin || !predictedPrice || !xpBet) {
      // console.error('❌ Missing required parameters:', {
      //   roundId: !!roundId,
      //   userId: !!userId,
      //   prediction: !!prediction,
      //   chosenCoin: !!chosenCoin,
      //   predictedPrice: !!predictedPrice,
      //   xpBet: !!xpBet
      // })
      throw new Error('Missing required parameters for prediction')
    }

    if (!xpBet || xpBet < 10 || xpBet > 100 || xpBet % 10 !== 0) {
      // console.error('❌ Invalid XP bet amount:', xpBet)
      throw new Error('Invalid XP bet amount. Must be between 10-100 in increments of 10.')
    }
    
    // Fetch round information
    // console.log('🔍 Fetching round:', roundId)
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      // console.error('❌ Round fetch error:', roundError)
      throw new Error('Round not found')
    }

    // console.log('📊 Round status:', round.status)
    if (round.status !== 'waiting') {
      // console.error('❌ Invalid round status for prediction:', round.status)
      throw new Error('Predictions can only be made during the lobby phase')
    }

    // Check for existing prediction
    // console.log('🔍 Checking for existing prediction...')
    const { data: existingPrediction, error: existingError } = await supabase
      .from('predictions')
      .select('id')
      .eq('round_id', roundId)
      .eq('user_id', userId)
      .single()

    if (existingError && existingError.code !== 'PGRST116') {
      // console.error('❌ Error checking existing predictions:', existingError)
      throw new Error('Failed to check existing predictions')
    }

    if (existingPrediction) {
      // console.error('❌ User already has prediction for this round:', existingPrediction.id)
      throw new Error('You have already made a prediction for this round')
    }

    // Fetch user profile
    // console.log('🔍 Fetching user profile:', userId)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      // console.error('❌ Profile fetch error:', profileError)
      throw new Error('Failed to fetch user profile')
    }

    // console.log('💰 User XP check:', { currentXP: profile.xp, requiredXP: xpBet })
    if (profile.xp < xpBet) {
      // console.error('❌ Insufficient XP:', { currentXP: profile.xp, requiredXP: xpBet })
      throw new Error(`Insufficient XP! You need at least ${xpBet} XP to make this prediction.`)
    }

    // Update daily play streak
    // console.log('🔥 Updating daily play streak...')
    const { streakReward, newDailyPlayStreak, newLastSevenDayRewardDate } = await updateDailyPlayStreak(supabase, userId, profile)
    // console.log('🎁 Streak reward calculated:', { streakReward, newDailyPlayStreak })
    
    // Handle round coin locking
    let roundCoinLocked = false
    if (round.selected_coin === null) {
      // console.log('🔒 Locking round coin to:', chosenCoin)
      const { error: updateRoundError } = await supabase
        .from('game_rounds')
        .update({ selected_coin: chosenCoin })
        .eq('id', roundId)

      if (updateRoundError) {
        // console.error('❌ Failed to lock round coin:', updateRoundError)
        throw new Error('Failed to lock round coin')
      }
      
      roundCoinLocked = true
    } else if (round.selected_coin !== chosenCoin) {
      // console.error('❌ Round coin mismatch:', { roundCoin: round.selected_coin, chosenCoin })
      throw new Error(`This round is locked to ${round.selected_coin}. You cannot predict on ${chosenCoin}.`)
    }

    // Update user profile (deduct XP bet, add streak reward, update streak info)
    const newXp = profile.xp - xpBet + streakReward
    const today = new Date().toISOString().split('T')[0]
    
    // console.log('💾 Updating user profile:', {
    //   oldXP: profile.xp,
    //   newXP: newXp,
    //   xpBet,
    //   streakReward,
    //   newDailyPlayStreak
    // })

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
      // console.error('❌ Failed to update user profile:', updateProfileError)
      throw new Error('Failed to update user profile')
    }

    // Create the prediction
    // console.log('📝 Creating prediction...')
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
      // console.error('❌ Failed to create prediction:', predictionError)
      
      // Rollback profile changes if prediction creation fails
      // console.log('🔄 Rolling back profile changes...')
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

    // console.log('✅ Prediction created successfully:', newPrediction.id)

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
    console.error('❌ makePrediction error:', error)
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
    // console.log('🚀 Starting prediction phase for round:', roundId)
    
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
        POL: 0.4523
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

    // console.log('✅ Prediction phase started:', roundId, 'Start price:', finalStartPrice)

    return new Response(
      JSON.stringify({ success: true, round: updatedRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ startPredictionPhase error:', error)
    throw error
  }
}

async function startResolvingPhase(supabase: any, roundId: string, endPrice?: number) {
  try {
    // console.log('⏳ Starting resolving phase for round:', roundId)
    
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

    // console.log('✅ Resolving phase started:', roundId, 'End price:', finalEndPrice)

    return new Response(
      JSON.stringify({ success: true, round: updatedRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ startResolvingPhase error:', error)
    throw error
  }
}

async function completeRound(supabase: any, roundId: string) {
  try {
    // console.log('🏁 Completing round:', roundId)
    
    // Check if round has already been completed to prevent duplicate processing
    const { data: currentRound, error: currentRoundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (currentRoundError) {
      throw currentRoundError
    }

    if (currentRound.status === 'completed' || currentRound.status === 'cancelled') {
      // console.log('⚠️ Round already completed/cancelled:', roundId, currentRound.status)
      return new Response(
        JSON.stringify({ 
          success: true, 
          round: currentRound,
          hasPredictions: true,
          message: 'Round already processed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { data: predictions, error: predictionsCountError } = await supabase
      .from('predictions')
      .select('id')
      .eq('round_id', roundId)

    if (predictionsCountError) {
      throw predictionsCountError
    }

    const predictionCount = predictions ? predictions.length : 0
    // console.log('📊 Predictions count:', predictionCount)

    if (predictionCount === 0) {
      // console.log('❌ No predictions found, cancelling round')
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

    if (!currentRound.start_price || !currentRound.end_price) {
      throw new Error('Cannot complete round: missing price data')
    }

    // console.log('💰 Price analysis:', {
    //   startPrice: currentRound.start_price,
    //   endPrice: currentRound.end_price,
    //   difference: currentRound.end_price - currentRound.start_price
    // })

    // Simplified and more accurate price direction calculation
    const priceDifference = currentRound.end_price - currentRound.start_price
    const percentageChange = Math.abs(priceDifference / currentRound.start_price) * 100
    
    // Use a very small threshold for unchanged (0.001% = 0.00001)
    const UNCHANGED_THRESHOLD_PERCENT = 0.001
    
    let priceDirection: 'up' | 'down' | 'unchanged'
    
    if (percentageChange < UNCHANGED_THRESHOLD_PERCENT) {
      priceDirection = 'unchanged'
    } else if (priceDifference > 0) {
      priceDirection = 'up'
    } else {
      priceDirection = 'down'
    }

    // console.log('📈 Price direction determined:', {
    //   priceDirection,
    //   percentageChange: percentageChange.toFixed(8),
    //   threshold: UNCHANGED_THRESHOLD_PERCENT,
    //   priceDifference
    // })

    const { data: allPredictions, error: allPredictionsError } = await supabase
      .from('predictions')
      .select('*')
      .eq('round_id', roundId)

    if (allPredictionsError) {
      throw allPredictionsError
    }

    let correctPredictions = 0
    let totalPredictions = allPredictions.length

    // console.log('🔍 Processing', totalPredictions, 'predictions...')

    // Process all predictions in a transaction-like manner
    for (const prediction of allPredictions) {
      // console.log('🎯 Analyzing prediction:', {
      //   predictionId: prediction.id,
      //   userId: prediction.user_id,
      //   prediction: prediction.prediction,
      //   xpBet: prediction.xp_bet
      // })
      
      // Determine if prediction is correct based on price direction
      let isCorrect = false
      
      if (priceDirection === 'unchanged') {
        // If price is essentially unchanged, no one wins
        isCorrect = false
        // console.log('❌ Price unchanged - no winner')
      } else {
        // Check if prediction matches the actual price direction
        isCorrect = prediction.prediction === priceDirection
        // console.log(isCorrect ? '✅ Correct prediction' : '❌ Wrong prediction', {
        //   predicted: prediction.prediction,
        //   actual: priceDirection
        // })
      }
      
      if (isCorrect) correctPredictions++
      
      // Calculate XP earned: only give XP if correct, otherwise 0
      const xpEarned = isCorrect ? prediction.xp_bet * 2 : 0
      
      // console.log('💰 XP calculation:', {
      //   isCorrect,
      //   xpBet: prediction.xp_bet,
      //   xpEarned
      // })
      
      // Fetch user profile
      const { data: profile, error: profileFetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', prediction.user_id)
        .single()
      
      if (profileFetchError) {
        // console.error('❌ Failed to fetch profile for user:', prediction.user_id)
        continue
      }

      // Update prediction with results
      const { error: updatePredictionError } = await supabase
        .from('predictions')
        .update({
          is_correct: isCorrect,
          xp_earned: xpEarned
        })
        .eq('id', prediction.id)

      if (updatePredictionError) {
        // console.error('❌ Failed to update prediction:', prediction.id, updatePredictionError)
        continue
      }

      // Update user profile stats and XP
      const newGamesPlayed = profile.games_played + 1
      const newWins = isCorrect ? profile.wins + 1 : profile.wins
      const newXp = profile.xp + xpEarned

      // console.log('👤 Updating profile:', {
      //   userId: prediction.user_id,
      //   oldGamesPlayed: profile.games_played,
      //   newGamesPlayed,
      //   oldWins: profile.wins,
      //   newWins,
      //   oldXp: profile.xp,
      //   newXp,
      //   xpAdded: xpEarned
      // })

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          games_played: newGamesPlayed,
          wins: newWins,
          xp: newXp
        })
        .eq('user_id', prediction.user_id)

      if (updateProfileError) {
        // console.error('❌ Failed to update profile for user:', prediction.user_id, updateProfileError)
        continue
      }

      // console.log('✅ Successfully processed prediction:', prediction.id)
    }

    // Mark round as completed
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

    // console.log('🏆 Round completed successfully:', {
    //   roundId,
    //   priceDirection,
    //   correctPredictions,
    //   totalPredictions,
    //   winRate: totalPredictions > 0 ? (correctPredictions / totalPredictions * 100).toFixed(1) + '%' : '0%'
    // })

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
    console.error('❌ completeRound error:', error)
    throw error
  }
}

// Cancel all waiting rounds older than 1 hour
async function cancelStaleWaitingRounds(supabase: any) {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { data: staleRounds, error } = await supabase
    .from('game_rounds')
    .select('id')
    .eq('status', 'waiting')
    .lt('start_time', oneHourAgo);

  if (error) throw error;

  if (staleRounds && staleRounds.length > 0) {
    const ids = staleRounds.map(r => r.id);
    const { error: updateError } = await supabase
      .from('game_rounds')
      .update({ status: 'cancelled' })
      .in('id', ids);
    if (updateError) throw updateError;
    return { cancelled: ids.length };
  }
  return { cancelled: 0 };
}