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
          status: 'waiting' | 'predicting' | 'resolving' | 'completed'
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
          status?: 'waiting' | 'predicting' | 'resolving' | 'completed'
          selected_coin: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP'
          start_time?: string | null
          prediction_end_time?: string | null
          end_time?: string | null
          start_price?: number | null
          end_price?: number | null
          price_direction?: 'up' | 'down' | 'unchanged' | null
        }
        Update: {
          status?: 'waiting' | 'predicting' | 'resolving' | 'completed'
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
        }
        Update: {
          is_correct?: boolean | null
          xp_earned?: number
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
        }
        Update: {
          xp?: number
          games_played?: number
          wins?: number
          streak?: number
        }
      }
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key
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

    // Route handling
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

    if (path === '/game-management/make-prediction' && req.method === 'POST') {
      const { roundId, userId, prediction, chosenCoin, predictedPrice } = await req.json()
      return await makePrediction(supabaseClient, roundId, userId, prediction, chosenCoin, predictedPrice)
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
    
    // Get the next round number
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
    
    // Use BTC as default coin - will be updated when first prediction is made
    const defaultCoin = 'BTC'
    
    // Calculate times for 5-minute cycle:
    // - 4 minutes (240 seconds) waiting/lobby phase
    // - 1 minute (60 seconds) prediction phase  
    // - 10 seconds resolving phase
    const now = new Date()
    const startTime = new Date(now.getTime() + 240 * 1000) // Start prediction in 4 minutes
    const predictionEndTime = new Date(startTime.getTime() + 60 * 1000) // 60 seconds for predictions
    const endTime = new Date(predictionEndTime.getTime() + 10 * 1000) // 10 seconds for resolution

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

async function makePrediction(supabase: any, roundId: string, userId: string, prediction: 'up' | 'down', chosenCoin: 'BTC' | 'ETH' | 'SOL' | 'BNB' | 'XRP', predictedPrice: number) {
  try {
    console.log(`🎯 Making prediction: ${prediction} for ${chosenCoin} by user ${userId}`)
    
    // Get current round details
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      console.error('❌ Error fetching round:', roundError)
      throw new Error('Round not found')
    }

    // Check if round allows predictions
    if (round.status !== 'waiting' && round.status !== 'predicting') {
      throw new Error('Predictions are not allowed in the current round phase')
    }

    // Check if user already has a prediction for this round
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

    // Get user profile and check XP
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp')
      .eq('user_id', userId)
      .single()

    if (profileError) {
      console.error('❌ Error fetching user profile:', profileError)
      throw new Error('Failed to fetch user profile')
    }

    if (profile.xp < 10) {
      throw new Error('Insufficient XP! You need at least 10 XP to make a prediction.')
    }

    // Lock the coin for this round if it's still the default
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

    // Deduct XP from user
    const { error: deductError } = await supabase
      .from('profiles')
      .update({ xp: profile.xp - 10 })
      .eq('user_id', userId)

    if (deductError) {
      console.error('❌ Error deducting XP:', deductError)
      throw new Error('Failed to deduct XP from your account')
    }

    // Create the prediction
    const { data: newPrediction, error: predictionError } = await supabase
      .from('predictions')
      .insert([{
        round_id: roundId,
        user_id: userId,
        prediction: prediction,
        predicted_price: predictedPrice
      }])
      .select()
      .single()

    if (predictionError) {
      console.error('❌ Error creating prediction:', predictionError)
      
      // Rollback XP deduction
      await supabase
        .from('profiles')
        .update({ xp: profile.xp })
        .eq('user_id', userId)
      
      throw new Error('Failed to create prediction')
    }

    console.log(`✅ Prediction created successfully with locked price: ${predictedPrice}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        prediction: newPrediction,
        roundCoinLocked,
        lockedCoin: chosenCoin
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
    
    // Get current round details
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      console.error('❌ Error fetching round:', roundError)
      throw roundError
    }

    // Use provided start price or fallback
    let finalStartPrice = startPrice
    if (!finalStartPrice) {
      // Fallback prices for demo
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
    
    // Get current round details
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) {
      console.error('❌ Error fetching round:', roundError)
      throw roundError
    }

    // Use provided end price or simulate
    let finalEndPrice = endPrice
    if (!finalEndPrice) {
      // Simulate price movement based on start price
      const startPrice = round.start_price || 100
      const changePercent = (Math.random() - 0.5) * 4 // -2% to +2%
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
    
    // Get round details with start and end prices
    console.log('🏁 [DEBUG] Fetching round details from database...')
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

    // Calculate price direction based on round start/end prices
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

    // Get all predictions for this round (including predicted_price)
    console.log('🏁 [DEBUG] Fetching predictions for this round...')
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('*')
      .eq('round_id', roundId)

    if (predictionsError) {
      console.error('❌ [DEBUG] Error fetching predictions:', predictionsError)
      throw predictionsError
    }

    console.log(`📊 [DEBUG] Found ${predictions.length} predictions for round ${round.round_number}`)
    console.log('📊 [DEBUG] Predictions details:', predictions.map(p => ({
      id: p.id,
      user_id: p.user_id,
      prediction: p.prediction,
      predicted_price: p.predicted_price,
      predicted_at: p.predicted_at
    })))

    // Process each prediction
    let correctPredictions = 0
    let totalPredictions = predictions.length

    console.log('🏁 [DEBUG] Starting to process individual predictions...')

    for (const prediction of predictions) {
      console.log(`🔍 [DEBUG] Processing prediction ${prediction.id} by user ${prediction.user_id}:`)
      console.log(`   Prediction: ${prediction.prediction}`)
      console.log(`   Predicted Price: ${prediction.predicted_price}`)
      
      // Compare individual predicted_price with round end_price
      let isCorrect = false
      
      if (prediction.predicted_price && round.end_price) {
        const individualPriceDifference = round.end_price - prediction.predicted_price
        
        console.log(`   [DEBUG] Individual price difference: ${individualPriceDifference.toFixed(8)}`)
        
        if (Math.abs(individualPriceDifference) < 0.01) {
          // Price unchanged - both predictions are wrong for simplicity
          isCorrect = false
          console.log(`   [DEBUG] Result: WRONG (price unchanged)`)
        } else if (individualPriceDifference > 0 && prediction.prediction === 'up') {
          isCorrect = true
          console.log(`   [DEBUG] Result: CORRECT (predicted UP, price went UP)`)
        } else if (individualPriceDifference < 0 && prediction.prediction === 'down') {
          isCorrect = true
          console.log(`   [DEBUG] Result: CORRECT (predicted DOWN, price went DOWN)`)
        } else {
          console.log(`   [DEBUG] Result: WRONG (predicted ${prediction.prediction.toUpperCase()}, price went ${individualPriceDifference > 0 ? 'UP' : 'DOWN'})`)
        }
      } else {
        // Fallback to round-level comparison if no predicted_price
        isCorrect = prediction.prediction === priceDirection
        console.log(`   [DEBUG] Result: ${isCorrect ? 'CORRECT' : 'WRONG'} (fallback to round-level comparison)`)
      }
      
      if (isCorrect) correctPredictions++
      
      const baseXp = isCorrect ? 20 : 0 // 20 XP for correct prediction (double the 10 XP cost)
      
      // Get user's current streak for bonus calculation
      console.log(`   [DEBUG] Fetching user profile for streak calculation...`)
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
        current_wins: profile.wins,
        current_streak: profile.streak
      })
      
      const streakBonus = isCorrect && profile ? profile.streak * 10 : 0
      const totalXpEarned = baseXp + streakBonus

      console.log(`   [DEBUG] XP Calculation: ${baseXp} base + ${streakBonus} streak bonus = ${totalXpEarned} total`)

      // Update prediction with result
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

      // Calculate new profile values
      const newGamesPlayed = profile.games_played + 1
      const newWins = isCorrect ? profile.wins + 1 : profile.wins
      const newXp = profile.xp + totalXpEarned
      const newStreak = isCorrect ? profile.streak + 1 : 0

      console.log(`   [DEBUG] New profile values calculated:`, {
        newGamesPlayed,
        newWins,
        newXp,
        newStreak
      })

      // Update user profile
      console.log(`   [DEBUG] Updating user profile...`)
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          games_played: newGamesPlayed,
          wins: newWins,
          xp: newXp,
          streak: newStreak
        })
        .eq('user_id', prediction.user_id)

      if (updateProfileError) {
        console.error('❌ [DEBUG] Error updating user profile:', updateProfileError)
        continue
      }

      console.log(`✅ [DEBUG] Updated user ${prediction.user_id}: ${isCorrect ? 'WIN' : 'LOSS'}, +${totalXpEarned} XP, streak: ${newStreak}`)
    }

    console.log(`📊 [DEBUG] Round completion summary: ${correctPredictions}/${totalPredictions} correct predictions`)

    // Update round status to completed
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

    const response = { success: true, round: completedRound }
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