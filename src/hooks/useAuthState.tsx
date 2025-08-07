
import { useState, useEffect, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { StandardUser } from '@/types/user';
import { useAuthContext } from '@/context/AuthContext';
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
  const authContext = useAuthContext();
  const rolePermissions = useRoleBasedPermissions();

  const fetchUserProfile = useCallback(async (currentSession: Session | null) => {
    setLoading(true);
    if (currentSession?.user) {
      try {
        const { data: profile, error } = await supabase
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
          // Convert Supabase profile data to StandardUser format
          const standardUser: StandardUser = {
            ...currentSession.user,
            name: profile.name,
            role: profile.role,
            status: profile.status,
            avatarUrl: profile.avatar_url || `https://i.pravatar.cc/150?u=${currentSession.user.email}`,
            riskScore: profile.risk_score || 0,
            email: currentSession.user.email || '',
            title: currentSession.user.user_metadata?.title,
            department: currentSession.user.user_metadata?.department,
            phone: currentSession.user.user_metadata?.phone,
            location: currentSession.user.user_metadata?.location,
            preferences: currentSession.user.user_metadata?.preferences,
          };
          setUser(standardUser);
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
  }, []);

  useEffect(() => {
    const currentSession = supabase.auth.getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await fetchUserProfile(session);
    });

    currentSession.then((resp) => {
      setSession(resp.data.session);
      fetchUserProfile(resp.data.session);
    });
  }, [fetchUserProfile]);

  const createMockUser = useCallback((email: string): StandardUser => {
    return createStandardUser({
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
  }, []);

  return { user, session, loading, authLoaded };
};
