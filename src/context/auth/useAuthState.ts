
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';
import { fetchUserProfile } from './userProfile';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    console.log('Initializing auth...');
    
    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, fetching profile...');
          try {
            const userProfile = await fetchUserProfile(session.user);
            if (userProfile) {
              setUser(userProfile);
              setSession(session);
              console.log('User profile set:', userProfile);
            } else {
              console.error('Failed to fetch user profile, but setting session anyway');
              setUser(null);
              setSession(session); // Still set session even if profile fails
            }
          } catch (error) {
            console.error('Error fetching profile:', error);
            setUser(null);
            setSession(session); // Still set session even if profile fails
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setSession(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed');
          setSession(session);
          // Keep existing user if available, or fetch if not
          if (!user) {
            try {
              const userProfile = await fetchUserProfile(session.user);
              if (userProfile) {
                setUser(userProfile);
              }
            } catch (error) {
              console.error('Error fetching profile on token refresh:', error);
            }
          }
        }
        
        // Always mark auth as loaded after processing any auth event
        setAuthLoaded(true);
      }
    );

    // Then get initial session
    const initializeSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthLoaded(true);
          return;
        }

        if (initialSession?.user) {
          console.log('Initial session found, fetching profile...');
          try {
            const userProfile = await fetchUserProfile(initialSession.user);
            if (userProfile) {
              setUser(userProfile);
              setSession(initialSession);
              console.log('Initial user profile set:', userProfile);
            } else {
              console.error('Failed to fetch initial profile, but setting session anyway');
              setUser(null);
              setSession(initialSession);
            }
          } catch (error) {
            console.error('Error fetching initial profile:', error);
            setUser(null);
            setSession(initialSession);
          }
        } else {
          console.log('No initial session found');
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        console.log('Setting authLoaded to true (initialization complete)');
        setAuthLoaded(true);
      }
    };

    initializeSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    authLoaded,
  };
};
