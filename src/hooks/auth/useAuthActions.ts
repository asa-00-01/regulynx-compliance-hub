
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export const useAuthActions = (): AuthActions => {
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

  return {
    signIn,
    signUp,
    signOut,
    refreshAuth,
  };
};
