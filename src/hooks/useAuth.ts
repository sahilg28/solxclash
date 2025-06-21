import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '../lib/supabase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 useAuth: Initializing Google OAuth authentication system...');
    
    // Get initial session on mount
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        console.log('🔄 INITIAL_SESSION:', {
          hasSession: !!data.session,
          hasUser: !!data.session?.user,
          userId: data.session?.user?.id,
          provider: data.session?.user?.app_metadata?.provider,
          error: error?.message,
          timestamp: new Date().toISOString()
        });
        
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
      console.log('🔄 AUTH_EVENT:', {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        provider: session?.user?.app_metadata?.provider,
        timestamp: new Date().toISOString()
      });
      
      setUser(session?.user ?? null);
      
      // Use setTimeout to avoid potential deadlocks in auth state changes
      setTimeout(async () => {
        try {
          if (session?.user) {
            console.log('🔄 Processing user after auth event:', session.user.id);
            await fetchOrCreateProfile(session.user);
          } else {
            console.log('🔄 No user in session, clearing profile');
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
      console.log('🔄 useAuth: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const fetchOrCreateProfile = async (user: User) => {
    try {
      console.log('👤 fetchOrCreateProfile: Starting for Google user:', {
        userId: user.id,
        userEmail: user.email,
        provider: user.app_metadata?.provider,
        userMetadata: user.user_metadata,
        timestamp: new Date().toISOString()
      });
      
      // First, try to fetch existing profile
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        console.log('✅ Found existing profile:', {
          profileId: existingProfile.id,
          username: existingProfile.username,
          fullName: existingProfile.full_name,
          avatarUrl: existingProfile.avatar_url,
          timestamp: new Date().toISOString()
        });
        setProfile(existingProfile);
        setLoading(false);
        return;
      }

      // If no profile exists, create one
      if (fetchError && fetchError.code === 'PGRST116') {
        console.log('🆕 No profile found, creating new one for Google user:', user.id);
        
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

        // Create new profile
        const newProfile = {
          user_id: user.id,
          full_name: fullName,
          username: username,
          avatar_url: avatarUrl,
          email: email,
          xp: 0,
          games_played: 0,
          wins: 0,
          streak: 0,
        };

        console.log('📝 Creating Google profile with data:', {
          userId: newProfile.user_id,
          username: newProfile.username,
          fullName: newProfile.full_name,
          avatarUrl: newProfile.avatar_url,
          email: newProfile.email,
          timestamp: new Date().toISOString()
        });

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
            xp: 0,
            games_played: 0,
            wins: 0,
            streak: 0,
          };
          console.log('🔄 Using fallback profile:', fallbackProfile);
          setProfile(fallbackProfile);
          setLoading(false);
          return;
        }

        console.log('✅ Google profile created successfully:', {
          profileId: createdProfile.id,
          username: createdProfile.username,
          fullName: createdProfile.full_name,
          avatarUrl: createdProfile.avatar_url,
          timestamp: new Date().toISOString()
        });
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
          xp: 0,
          games_played: 0,
          wins: 0,
          streak: 0,
        };
        console.log('🔄 Using fallback profile due to error:', fallbackProfile);
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
        xp: 0,
        games_played: 0,
        wins: 0,
        streak: 0,
      };
      console.log('🔄 Using fallback profile due to exception:', fallbackProfile);
      setProfile(fallbackProfile);
      setLoading(false);
    }
  };

  // Refresh function for external calls
  const refreshSessionAndProfile = async () => {
    setLoading(true);
    try {
      console.log('🔄 Refreshing session and profile...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error);
        return;
      }

      console.log('🔄 Refresh session result:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        provider: session?.user?.app_metadata?.provider,
        timestamp: new Date().toISOString()
      });

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
      console.log('🚪 Signing out from Google OAuth...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear states
      setUser(null);
      setProfile(null);
      setLoading(false);
      
      console.log('✅ Google OAuth sign out completed');
    } catch (error) {
      console.error('❌ Error signing out:', error);
      throw error;
    }
  };

  // Debug logging for useAuth state changes
  useEffect(() => {
    console.log('🏗️ useAuth state update:', {
      hasUser: !!user,
      hasProfile: !!profile,
      loading,
      userId: user?.id,
      provider: user?.app_metadata?.provider,
      username: profile?.username,
      profileId: profile?.id,
      fullName: profile?.full_name,
      avatarUrl: profile?.avatar_url,
      timestamp: new Date().toISOString()
    });
  }, [user, profile, loading]);

  return {
    user,
    profile,
    loading,
    signOut,
    fetchProfile,
    refreshSessionAndProfile
  };
};