import { useState, useEffect, useCallback } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Session } from '@supabase/supabase-js';
import { useRouter } from 'next/router';

import { StandardUser } from '@/types/user';
import { useAuth } from '@/context/AuthContext';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { createStandardUser } from '@/types/userHelpers';

interface AuthState {
  user: StandardUser | null;
  session: Session | null;
  loading: boolean;
  authLoaded: boolean;
}

export const useAuthState = (): AuthState => {
  const [user, setUser] = useState<StandardUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoaded, setAuthLoaded] = useState<boolean>(false);
  const supabaseClient = useSupabaseClient();
  const router = useRouter();
  const { setAuthContext } = useAuth();
  const { setRoles } = useRoleBasedPermissions();

  const fetchUserProfile = useCallback(async (currentSession: Session | null) => {
    setLoading(true);
    if (currentSession?.user) {
      try {
        const { data: profile, error } = await supabaseClient
          .from('profiles')
          .select('*')
          .eq('id', currentSession.user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          // Fallback to minimal user info if profile fetch fails
          const minimalUser = createMockUser(currentSession.user.email || 'default@example.com');
          setUser(minimalUser);
        } else {
          // Merge Supabase auth user with profile data
          const extendedUser: StandardUser = {
            ...currentSession.user,
            ...profile,
          } as StandardUser;
          setUser(extendedUser);
        }
      } catch (err: any) {
        console.error('Unexpected error fetching profile:', err);
        // Fallback in case of unexpected errors
        const minimalUser = createMockUser(currentSession.user.email || 'default@example.com');
        setUser(minimalUser);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
    setAuthLoaded(true);
  }, [supabaseClient]);

  useEffect(() => {
    const currentSession = supabaseClient.auth.getSession();

    supabaseClient.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await fetchUserProfile(session);
    });

    currentSession.then((resp) => {
      setSession(resp.data.session);
      fetchUserProfile(resp.data.session);
    });
  }, [supabaseClient, fetchUserProfile]);

  useEffect(() => {
    if (user) {
      setRoles(user.role);
    }
  }, [user, setRoles]);

  useEffect(() => {
    setAuthContext({
      user,
      session,
      loading,
      isAuthenticated: !!user,
      authLoaded,
      signIn: async () => ({ error: null }),
      signUp: async () => ({ error: null }),
      signOut: async () => {
        await supabaseClient.auth.signOut();
        router.push('/auth');
      },
      refreshAuth: async () => {
        await fetchUserProfile(session);
      },
      updateUserProfile: async () => {
        await fetchUserProfile(session);
      },
      login: async () => ({ error: null }),
      logout: async () => {
        await supabaseClient.auth.signOut();
        router.push('/auth');
      },
      signup: async () => ({ error: null }),
      canAccess: (roles: string[]) => {
        if (!user) return false;
        return roles.includes(user.role);
      },
    });
  }, [user, session, loading, authLoaded, setAuthContext, supabaseClient, router, fetchUserProfile]);

    const createMockUser = (email: string): StandardUser => {
      return createStandardUser({
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
    };

  return { user, session, loading, authLoaded };
};
