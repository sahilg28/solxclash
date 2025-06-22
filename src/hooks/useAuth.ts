import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session on mount
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error);
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
        console.error('❌ Error initializing auth:', error);
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Use setTimeout to avoid potential deadlocks in auth state changes
      setTimeout(async () => {
        try {
          if (session?.user) {
            await fetchOrCreateProfile(session.user);
          } else {
            setProfile(null);
            setLoading(false);
          }
        } catch (error) {
          console.error('❌ Error in auth state change handler:', error);
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
      // First, try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        setProfile(existingProfile);
        setLoading(false);
        return;
      }

      // If no profile exists, create one with 100 XP signup bonus
      if (fetchError && fetchError.code === 'PGRST116') {
        // Extract user data from Google OAuth response
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        const email = user.email || null;

        // Generate a unique username based on email or name
        let baseUsername = '';
        if (user.user_metadata?.name) {
          // Use name and sanitize it
          baseUsername = user.user_metadata.name
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        } else if (email) {
          // Use email prefix
          baseUsername = email.split('@')[0]
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '_')
            .replace(/_+/g, '_')
            .replace(/^_|_$/g, '');
        } else {
          // Fallback to user ID
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

        let username = baseUsername;
        let counter = 1;

        // Check if username is unique, if not, append a number
        while (counter <= 10) { // Prevent infinite loop
          const { data: existingUser } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();

          if (!existingUser) break;
          
          const suffix = `_${counter}`;
          const maxBaseLength = 30 - suffix.length;
          username = `${baseUsername.slice(0, maxBaseLength)}${suffix}`;
          counter++;
        }

        // Create new profile with 100 XP signup bonus
        const newProfile = {
          user_id: user.id,
          full_name: fullName,
          username: username,
          avatar_url: avatarUrl,
          email: email,
          xp: 100, // 🎁 100 XP signup bonus!
          games_played: 0,
          wins: 0,
          streak: 0,
        };

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
          console.error('❌ Error creating profile:', createError);
          // Create a fallback profile for UI purposes
          const fallbackProfile: Profile = {
            id: `temp_${user.id}`,
            user_id: user.id,
            full_name: fullName,
            username: username,
            avatar_url: avatarUrl,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            xp: 100, // 🎁 100 XP signup bonus!
            games_played: 0,
            wins: 0,
            streak: 0,
          };
          setProfile(fallbackProfile);
          setLoading(false);
          return;
        }

        setProfile(createdProfile);
        setLoading(false);
      } else {
        console.error('❌ Error fetching profile:', fetchError);
        // Create a fallback profile even on other errors
        const fallbackProfile: Profile = {
          id: `temp_${user.id}`,
          user_id: user.id,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
          username: user.user_metadata?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || `user_${user.id.slice(0, 8)}`,
          avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
          email: user.email || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          xp: 100, // 🎁 100 XP signup bonus!
          games_played: 0,
          wins: 0,
          streak: 0,
        };
        setProfile(fallbackProfile);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error in fetchOrCreateProfile:', error);
      // Always provide a fallback profile to ensure UI works
      const fallbackProfile: Profile = {
        id: `temp_${user.id}`,
        user_id: user.id,
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        username: user.user_metadata?.name?.toLowerCase().replace(/[^a-z0-9]/g, '_') || `user_${user.id.slice(0, 8)}`,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
        email: user.email || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        xp: 100, // 🎁 100 XP signup bonus!
        games_played: 0,
        wins: 0,
        streak: 0,
      };
      setProfile(fallbackProfile);
      setLoading(false);
    }
  };

  // Refresh function for external calls
  const refreshSessionAndProfile = async () => {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
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
      console.error('❌ Error refreshing session:', error);
      setLoading(false);
    }
  };

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear states
      setUser(null);
      setProfile(null);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error signing out:', error);
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