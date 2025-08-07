
import { useState, useCallback } from 'react';
import { secureAuth } from '@/lib/secureAuth';
import { useAuthState } from './useAuthState';
import { toast } from 'sonner';

export const useSecureAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user, session } = useAuthState();

  const signIn = useCallback(async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    try {
      const result = await secureAuth.signIn(email, password, rememberMe);
      toast.success('Successfully signed in');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Sign in failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, userData?: any) => {
    setIsLoading(true);
    try {
      const result = await secureAuth.signUp(email, password, userData);
      toast.success('Account created successfully');
      return result;
    } catch (error: any) {
      toast.error(error.message || 'Sign up failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await secureAuth.signOut();
      toast.success('Successfully signed out');
    } catch (error: any) {
      toast.error(error.message || 'Sign out failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      await secureAuth.resetPassword(email);
      toast.success('Password reset email sent');
    } catch (error: any) {
      toast.error(error.message || 'Password reset failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAuthenticated: !!user,
  };
};

export default useSecureAuth;
