
import { useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { StandardUser, UserRole } from '@/types/user';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CreateUserData, createStandardUser } from '@/types/userHelpers';

export const useAuthActions = () => {
  const { user, session, loading, authLoaded } = useAuthContext();

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Sign-in error:', error);
        toast.error(`Sign-in failed: ${error.message}`);
        return { error };
      }

      if (data?.user) {
        toast.success(`Signed in as ${email}`);
      }
      return { error: null };
    } catch (error: any) {
      console.error('Sign-in error:', error);
      return { error };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, userData: CreateUserData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: userData.name,
            role: userData.role,
            riskScore: 0,
            status: 'pending',
            avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
            ...userData,
          }
        }
      });

      if (error) {
        console.error('Sign-up error:', error);
        toast.error(`Sign-up failed: ${error.message}`);
        return { error };
      }

      if (data?.user) {
        toast.success(`Signed up as ${email}`);
      }
      return { error: null };
    } catch (error: any) {
      console.error('Sign-up error:', error);
      return { error };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign-out error:', error);
        toast.error(`Sign-out failed: ${error.message}`);
        return;
      }

      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Sign-out error:', error);
    }
  }, []);

  const updateUserProfile = useCallback(async (updates: any) => {
    try {
      const { data, error } = await supabase.auth.updateUser({ data: updates });

      if (error) {
        console.error('Update user error:', error);
        toast.error(`Failed to update profile: ${error.message}`);
        return;
      }

      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Update user error:', error);
    }
  }, []);

  const createMockUser = useCallback((email: string): StandardUser => {
    const userData = createStandardUser({
      email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'complianceOfficer',
      riskScore: Math.floor(Math.random() * 100),
      status: 'active',
      title: 'Mock User',
      department: 'Compliance',
      phone: '+1234567890',
      location: 'Stockholm',
      preferences: {
        notifications: {
          email: true,
          browser: true,
          weekly: false,
          newCase: true,
          riskAlerts: true,
        },
        theme: 'light',
        language: 'en',
      },
    });

    return userData;
  }, []);

  return {
    signIn,
    signUp,
    signOut,
    updateUserProfile,
    createMockUser,
  };
};
