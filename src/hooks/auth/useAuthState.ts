
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { StandardUser } from '@/types/user';
import { UserProfileService } from '@/services/auth/userProfileService';

export interface AuthState {
  user: StandardUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  authLoaded: boolean;
}

export const useAuthState = (): AuthState => {
  const [user, setUser] = useState<StandardUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const enrichedUser = await UserProfileService.enrichUserWithProfile(session.user);
          setUser(enrichedUser);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const enrichedUser = await UserProfileService.enrichUserWithProfile(session.user);
        setUser(enrichedUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    authLoaded: !loading,
  };
};
