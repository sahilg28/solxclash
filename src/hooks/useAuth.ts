import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Session fetch error:', error);
          setLoading(false);
          return;
        }
        
        setUser(data.session?.user ?? null);
        
        if (data.session?.user) {
          await fetchOrCreateProfile(data.session.user);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // console.log('🔄 Auth state change:', event, session?.user?.id);
      setUser(session?.user ?? null);
      
      setTimeout(async () => {
        try {
          if (session?.user) {
            await fetchOrCreateProfile(session.user);
          } else {
            setProfile(null);
            setLoading(false);
          }
        } catch (error) {
          console.error('❌ Auth state change error:', error);
          setLoading(false);
        }
      }, 0);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrCreateProfile = async (user: User) => {
    try {
      // console.log('🔍 Fetching profile for user:', user.id);
      
      // First, try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        // console.log('✅ Found existing profile:', existingProfile.username);
        setProfile(existingProfile);
        setLoading(false);
        return;
      }

      // If no profile found (PGRST116 = no rows returned), create one
      if (fetchError && fetchError.code === 'PGRST116') {
        // console.log('📝 Creating new profile for user:', user.id);
        
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        const email = user.email || null;

        // Generate username from available data
        let baseUsername = '';
        if (user.user_metadata?.name) {
          baseUsername = user.user_metadata.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        } else if (email) {
          baseUsername = email.split('@')[0]
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        } else {
          baseUsername = `user_${user.id.slice(0, 8)}`;
        }

        // Ensure minimum length
        if (baseUsername.length < 3) {
          baseUsername = `user_${baseUsername}_${user.id.slice(0, 4)}`;
        }

        // Ensure maximum length
        if (baseUsername.length > 30) {
          baseUsername = baseUsername.slice(0, 30);
        }

        // Check for username conflicts and generate unique username
        let username = baseUsername;
        let counter = 1;

        while (counter <= 10) {
          // console.log('🔍 Checking username availability:', username);
          
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

          if (!existingUser) {
            // console.log('✅ Username available:', username);
            break;
          }
          
          // console.log('❌ Username taken, trying next:', username);
          const suffix = `_${counter}`;
          const maxBaseLength = 30 - suffix.length;
          username = `${baseUsername.slice(0, maxBaseLength)}${suffix}`;
          counter++;
        }

        const newProfile = {
          user_id: user.id,
          full_name: fullName,
          username: username,
          avatar_url: avatarUrl,
          email: email,
          xp: 100,
          games_played: 0,
          wins: 0,
          streak: 0,
        };

        // console.log('📝 Creating profile with data:', newProfile);

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('❌ Profile creation error:', createError);
          
          // If creation fails due to unique constraint violation, try to fetch again
          if (createError.code === '23505') {
            // console.log('🔄 Unique constraint violation, fetching existing profile...');
            const { data: retryProfile, error: retryError } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
            
            if (retryProfile) {
              // console.log('✅ Found profile on retry:', retryProfile.username);
              setProfile(retryProfile);
              setLoading(false);
              return;
            }
          }
          
          // Create fallback profile if database operation fails
          const fallbackProfile: Profile = {
            id: `temp_${user.id}`,
            user_id: user.id,
            full_name: fullName,
            username: username,
            avatar_url: avatarUrl,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            xp: 100,
            games_played: 0,
            wins: 0,
            streak: 0,
            country: null,
            last_played_date: null,
            daily_play_streak: 0,
            last_seven_day_reward_date: null,
            twitter_username: null,
          };
          
          // console.log('⚠️ Using fallback profile');
          setProfile(fallbackProfile);
          setLoading(false);
          return;
        }

        // console.log('✅ Profile created successfully:', createdProfile.username);
        setProfile(createdProfile);
        setLoading(false);
      } else {
        console.error('❌ Unexpected profile fetch error:', fetchError);
        
        // Create fallback profile for any other error
        const fallbackProfile: Profile = {
          id: `temp_${user.id}`,
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          username: user.user_metadata?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || `user_${user.id.slice(0, 8)}`,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          email: user.email || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          xp: 100,
          games_played: 0,
          wins: 0,
          streak: 0,
          country: null,
          last_played_date: null,
          daily_play_streak: 0,
          last_seven_day_reward_date: null,
          twitter_username: null,
        };
        
        setProfile(fallbackProfile);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ fetchOrCreateProfile error:', error);
      
      // Create fallback profile for any unexpected error
      const fallbackProfile: Profile = {
        id: `temp_${user.id}`,
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        username: user.user_metadata?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || `user_${user.id.slice(0, 8)}`,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        email: user.email || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        xp: 100,
        games_played: 0,
        wins: 0,
        streak: 0,
        country: null,
        last_played_date: null,
        daily_play_streak: 0,
        last_seven_day_reward_date: null,
        twitter_username: null,
      };
      
      setProfile(fallbackProfile);
      setLoading(false);
    }
  };

  const refreshSessionAndProfile = async () => {
    setLoading(true);
    try {
      // console.log('🔄 Refreshing session and profile...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Session refresh error:', error);
        return;
      }

      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchOrCreateProfile(session.user);
      } else {
        setProfile(null);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Refresh error:', error);
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      // console.log('🔍 Fetching profile for userId:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Profile fetch error:', error);
        return;
      }

      if (data) {
        // console.log('✅ Profile fetched:', data.username);
        setProfile(data);
      }
    } catch (error) {
      console.error('❌ fetchProfile error:', error);
    }
  };

  const signOut = async () => {
    try {
      // console.log('🚪 Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setLoading(false);
      
      // console.log('✅ Signed out successfully');
    } catch (error) {
      console.error('❌ Sign out error:', error);
      throw error;
    }
  };

  return {
    user,
    profile,
    loading,
    signOut,
    fetchProfile,
    refreshSessionAndProfile
  };
};