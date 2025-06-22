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
          is_correct: boolean | null
          xp_earned: number
          created_at: string
        }
        Insert: {
          round_id: string
          user_id: string
          prediction: 'up' | 'down'
          predicted_at?: string
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

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Game management error:', error)
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
    // Get the next round number
    const { data: rounds, error: roundsError } = await supabase
      .from('game_rounds')
      .select('round_number')
      .order('round_number', { ascending: false })
      .limit(1)

    if (roundsError) {
      throw roundsError
    }

    const nextRoundNumber = (rounds && rounds.length > 0) ? rounds[0].round_number + 1 : 1
    
    // Select a random coin for this round
    const coins = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP']
    const selectedCoin = coins[Math.floor(Math.random() * coins.length)]
    
    // Calculate times for 5-minute cycle:
    // - 4 minutes (240 seconds) waiting/lobby phase
    // - 1 minute (60 seconds) prediction phase  
    // - 10 seconds resolving phase
    const now = new Date()
    const startTime = new Date(now.getTime() + 240 * 1000) // Start prediction in 4 minutes
    const predictionEndTime = new Date(startTime.getTime() + 60 * 1000) // 60 seconds for predictions
    const endTime = new Date(predictionEndTime.getTime() + 10 * 1000) // 10 seconds for resolution

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
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, round: newRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating new round:', error)
    throw error
  }
}

async function startPredictionPhase(supabase: any, roundId: string, startPrice?: number) {
  try {
    // Get current round details
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) throw roundError

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

    const { data: updatedRound, error } = await supabase
      .from('game_rounds')
      .update({ 
        status: 'predicting',
        start_price: finalStartPrice
      })
      .eq('id', roundId)
      .select()
      .single()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, round: updatedRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error starting prediction phase:', error)
    throw error
  }
}

async function startResolvingPhase(supabase: any, roundId: string, endPrice?: number) {
  try {
    // Get current round details
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) throw roundError

    // Use provided end price or simulate
    let finalEndPrice = endPrice
    if (!finalEndPrice) {
      // Simulate price movement based on start price
      const startPrice = round.start_price || 100
      const changePercent = (Math.random() - 0.5) * 4 // -2% to +2%
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

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, round: updatedRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error starting resolving phase:', error)
    throw error
  }
}

async function completeRound(supabase: any, roundId: string) {
  try {
    // Get round details with start and end prices
    const { data: round, error: roundError } = await supabase
      .from('game_rounds')
      .select('*')
      .eq('id', roundId)
      .single()

    if (roundError) throw roundError

    if (!round.start_price || !round.end_price) {
      throw new Error('Cannot complete round: missing price data')
    }

    // Calculate price direction
    const priceDifference = round.end_price - round.start_price
    let priceDirection: 'up' | 'down' | 'unchanged'
    
    if (Math.abs(priceDifference) < 0.01) {
      priceDirection = 'unchanged'
    } else if (priceDifference > 0) {
      priceDirection = 'up'
    } else {
      priceDirection = 'down'
    }

    // Get all predictions for this round
    const { data: predictions, error: predictionsError } = await supabase
      .from('predictions')
      .select('*')
      .eq('round_id', roundId)

    if (predictionsError) throw predictionsError

    // Process each prediction
    for (const prediction of predictions) {
      const isCorrect = prediction.prediction === priceDirection
      const baseXp = isCorrect ? 20 : 0 // 20 XP for correct prediction (double the 10 XP cost)
      
      // Get user's current streak for bonus calculation
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak')
        .eq('user_id', prediction.user_id)
        .single()
      
      const streakBonus = isCorrect && profile ? profile.streak * 10 : 0
      const totalXpEarned = baseXp + streakBonus

      // Update prediction with result
      const { error: updatePredictionError } = await supabase
        .from('predictions')
        .update({
          is_correct: isCorrect,
          xp_earned: totalXpEarned
        })
        .eq('id', prediction.id)

      if (updatePredictionError) {
        console.error('Error updating prediction:', updatePredictionError)
        continue
      }

      // Update user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', prediction.user_id)
        .single()

      if (profileError) {
        console.error('Error fetching user profile:', profileError)
        continue
      }

      const newGamesPlayed = userProfile.games_played + 1
      const newWins = isCorrect ? userProfile.wins + 1 : userProfile.wins
      const newXp = userProfile.xp + totalXpEarned
      const newStreak = isCorrect ? userProfile.streak + 1 : 0

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
        console.error('Error updating user profile:', updateProfileError)
        continue
      }
    }

    // Update round status to completed
    const { data: completedRound, error: completeError } = await supabase
      .from('game_rounds')
      .update({ 
        status: 'completed',
        price_direction: priceDirection
      })
      .eq('id', roundId)
      .select()
      .single()

    if (completeError) throw completeError

    return new Response(
      JSON.stringify({ success: true, round: completedRound }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error completing round:', error)
    throw error
  }
}