import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Single Supabase client instance - ensure this is the only one used throughout the app
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  username: string;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  xp: number;
  games_played: number;
  wins: number;
  streak: number;
  country: string | null;
  last_played_date: string | null;
  daily_play_streak: number;
  last_seven_day_reward_date: string | null;
};