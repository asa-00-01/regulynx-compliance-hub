
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { StandardUser } from '@/types/user';
import { UserProfileService } from '@/services/auth/userProfileService';
import { toast } from 'sonner';

interface AuthState {
  user: StandardUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUserProfile: (updates: any) => Promise<void>;
}

export type AuthHook = AuthState & AuthActions;

export const useAuth = (): AuthHook => {
  const [user, setUser] = useState<StandardUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const handleAuthChange = async (event: string, session: Session | null) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (!isMounted) return;
      
      setSession(session);
      
      if (session?.user) {
        try {
          const enrichedUser = await UserProfileService.enrichUserWithProfile(session.user);
          if (isMounted) {
            setUser(enrichedUser);
            setLoading(false);
          }
        } catch (error) {
          console.error('Error enriching user profile:', error);
          if (isMounted) {
            // Create a fallback user if profile enrichment fails
            const fallbackUser: StandardUser = {
              ...session.user,
              name: session.user.email?.split('@')[0] || 'User',
              role: 'user',
              riskScore: 0,
              status: 'active',
              avatarUrl: null,
              email: session.user.email || '',
              title: null,
              department: null,
              phone: null,
              location: null,
              preferences: null,
            };
            setUser(fallbackUser);
            setLoading(false);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          if (isMounted) {
            setLoading(false);
          }
          return;
        }

        console.log('Initial session check:', session?.user?.email);
        await handleAuthChange('INITIAL_SESSION', session);
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Signing in user:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        toast.error(error.message);
        return { error };
      }

      console.log('Sign in successful:', data.user?.email);
      toast.success('Successfully signed in');
      return { error: null };
    } catch (error: any) {
      console.error('Sign in exception:', error);
      toast.error(error.message || 'Sign in failed');
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      console.log('Signing up user:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        console.error('Sign up error:', error);
        toast.error(error.message);
        return { error };
      }

      console.log('Sign up successful:', data.user?.email);
      toast.success('Account created successfully! Please check your email to verify your account.');
      return { error: null };
    } catch (error: any) {
      console.error('Sign up exception:', error);
      toast.error(error.message || 'Sign up failed');
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        toast.error(error.message);
        throw error;
      }

      console.log('Sign out successful');
      toast.success('Successfully signed out');
    } catch (error: any) {
      console.error('Sign out exception:', error);
      toast.error(error.message || 'Sign out failed');
      throw error;
    }
  };

  const refreshAuth = async () => {
    try {
      console.log('Refreshing auth session');
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Refresh session error:', error);
        throw error;
      }
      
      console.log('Session refreshed successfully');
    } catch (error: any) {
      console.error('Refresh session exception:', error);
      throw error;
    }
  };

  const updateUserProfile = async (updates: any) => {
    if (!user) throw new Error('No user logged in');
    await UserProfileService.updateUserProfile(user.id, updates);
  };

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshAuth,
    updateUserProfile,
  };
};
