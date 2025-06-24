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
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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

      if (fetchError && fetchError.code === 'PGRST116') {
        const fullName = user.user_metadata?.full_name || user.user_metadata?.name || null;
        const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture || null;
        const email = user.email || null;

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

        if (baseUsername.length < 3) {
          baseUsername = `user_${baseUsername}_${user.id.slice(0, 4)}`;
        }

        if (baseUsername.length > 30) {
          baseUsername = baseUsername.slice(0, 30);
        }

        let username = baseUsername;
        let counter = 1;

        while (counter <= 10) {
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

        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();

        if (createError) {
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
          };
          setProfile(fallbackProfile);
          setLoading(false);
          return;
        }

        setProfile(createdProfile);
        setLoading(false);
      } else {
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
        };
        setProfile(fallbackProfile);
        setLoading(false);
      }
    } catch (error) {
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
      };
      setProfile(fallbackProfile);
      setLoading(false);
    }
  };

  const refreshSessionAndProfile = async () => {
    setLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
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
        return;
      }

      setProfile(data);
    } catch (error) {
      // Silent fail
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setProfile(null);
      setLoading(false);
    } catch (error) {
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