import { useCallback } from 'react';
import { useAuthContext } from '@/context/AuthContext';
import { StandardUser, UserRole } from '@/types';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { supabase } from '@/integrations/supabase/client';
import { CreateUserData, createStandardUser } from '@/types/userHelpers';

export const useAuthActions = () => {
  const { setUser, setSession, setLoading, setAuthLoaded } = useAuthContext();
  const router = useRouter();

  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Sign-in error:', error);
        toast.error(`Sign-in failed: ${error.message}`);
        return { error };
      }

      if (data?.user) {
        setUser(data.user as StandardUser);
        setSession(data.session);
        toast.success(`Signed in as ${email}`);
        router.push('/dashboard');
      }
      return { error: null };
    } finally {
      setLoading(false);
      setAuthLoaded(true);
    }
  }, [setUser, setSession, setLoading, setAuthLoaded, router]);

  const signUp = useCallback(async (email: string, password: string, userData: CreateUserData) => {
    setLoading(true);
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
        setUser(data.user as StandardUser);
        setSession(data.session);
        toast.success(`Signed up as ${email}`);
        router.push('/dashboard');
      }
      return { error: null };
    } finally {
      setLoading(false);
      setAuthLoaded(true);
    }
  }, [setUser, setSession, setLoading, setAuthLoaded, router]);

  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Sign-out error:', error);
        toast.error(`Sign-out failed: ${error.message}`);
        return;
      }

      setUser(null);
      setSession(null);
      toast.success('Signed out successfully');
      router.push('/auth');
    } finally {
      setLoading(false);
      setAuthLoaded(true);
    }
  }, [setUser, setSession, setLoading, setAuthLoaded, router]);

  const updateUserProfile = useCallback(async (updates: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.updateUser({ data: updates });

      if (error) {
        console.error('Update user error:', error);
        toast.error(`Failed to update profile: ${error.message}`);
        return;
      }

      setUser(data.user as StandardUser);
      toast.success('Profile updated successfully');
    } finally {
      setLoading(false);
    }
  }, [setUser, setLoading]);

  const createMockUser = useCallback((email: string): StandardUser => {
    const userData = createStandardUser({
      email,
      name: email.split('@')[0],
      role: email.includes('admin') ? 'admin' : 'complianceOfficer',
      riskScore: Math.floor(Math.random() * 100),
      status: 'verified',
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
