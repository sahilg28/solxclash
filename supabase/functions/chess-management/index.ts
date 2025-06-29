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
      chess_games: {
        Row: {
          id: string
          player_id: string
          difficulty: 'easy' | 'medium' | 'hard'
          player_color: 'white' | 'black'
          status: 'active' | 'completed' | 'resigned'
          result: 'win' | 'lose' | 'draw' | null
          xp_cost: number
          xp_earned: number
          current_fen: string
          move_count: number
          time_remaining: number
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          player_id: string
          difficulty: 'easy' | 'medium' | 'hard'
          player_color: 'white' | 'black'
          xp_cost: number
          current_fen?: string
          time_remaining?: number
        }
        Update: {
          status?: 'active' | 'completed' | 'resigned'
          result?: 'win' | 'lose' | 'draw' | null
          xp_earned?: number
          current_fen?: string
          move_count?: number
          time_remaining?: number
          completed_at?: string | null
        }
      }
      profiles: {
        Row: {
          id: string
          user_id: string
          xp: number
          games_played: number
          wins: number
        }
        Update: {
          xp?: number
          games_played?: number
          wins?: number
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

    if (path === '/chess-management/create-game' && req.method === 'POST') {
      const { playerId, difficulty, playerColor, xpCost } = await req.json()
      return await createChessGame(supabaseClient, playerId, difficulty, playerColor, xpCost)
    }
    
    if (path === '/chess-management/complete-game' && req.method === 'POST') {
      const { gameId, result, xpEarned } = await req.json()
      return await completeGame(supabaseClient, gameId, result, xpEarned)
    }

    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('❌ Chess Management Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

async function createChessGame(supabase: any, playerId: string, difficulty: string, playerColor: string, xpCost: number) {
  try {
    // Check if player has enough XP
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp')
      .eq('user_id', playerId)
      .single()

    if (profileError) {
      throw new Error('Failed to fetch player profile')
    }

    if (profile.xp < xpCost) {
      throw new Error('Insufficient XP to start game')
    }

    // Deduct XP cost
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ xp: profile.xp - xpCost })
      .eq('user_id', playerId)

    if (updateError) {
      throw new Error('Failed to deduct XP cost')
    }

    // Create new chess game
    const { data: newGame, error: gameError } = await supabase
      .from('chess_games')
      .insert([{
        player_id: playerId,
        difficulty,
        player_color: playerColor,
        xp_cost: xpCost
      }])
      .select()
      .single()

    if (gameError) {
      // Rollback XP deduction
      await supabase
        .from('profiles')
        .update({ xp: profile.xp })
        .eq('user_id', playerId)
      
      throw new Error('Failed to create chess game')
    }

    return new Response(
      JSON.stringify({ success: true, game: newGame }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ createChessGame error:', error)
    throw error
  }
}

async function completeGame(supabase: any, gameId: string, result: string, xpEarned: number) {
  try {
    // Get game details
    const { data: game, error: gameError } = await supabase
      .from('chess_games')
      .select('player_id, status')
      .eq('id', gameId)
      .single()

    if (gameError || !game) {
      throw new Error('Game not found')
    }

    if (game.status !== 'active') {
      throw new Error('Game is not active')
    }

    // Update game status
    const { error: updateGameError } = await supabase
      .from('chess_games')
      .update({
        status: 'completed',
        result,
        xp_earned: xpEarned,
        completed_at: new Date().toISOString()
      })
      .eq('id', gameId)

    if (updateGameError) {
      throw new Error('Failed to update game status')
    }

    // Update player profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('xp, games_played, wins')
      .eq('user_id', game.player_id)
      .single()

    if (profileError) {
      throw new Error('Failed to fetch player profile')
    }

    const newWins = result === 'win' ? profile.wins + 1 : profile.wins
    const { error: updateProfileError } = await supabase
      .from('profiles')
      .update({
        xp: profile.xp + xpEarned,
        games_played: profile.games_played + 1,
        wins: newWins
      })
      .eq('user_id', game.player_id)

    if (updateProfileError) {
      throw new Error('Failed to update player profile')
    }

    return new Response(
      JSON.stringify({ success: true, xpEarned, newWins }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ completeGame error:', error)
    throw error
  }
}