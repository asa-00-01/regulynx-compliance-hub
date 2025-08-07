
import { useAuthSession } from './useAuthSession';
import { useAuthActions } from './useAuthActions';
import { useUserProfile } from './useUserProfile';
import { StandardUser } from '@/types/user';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  user: StandardUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  profileError: string | null;
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
  const { user: sessionUser, session, loading: sessionLoading } = useAuthSession();
  const { enrichedUser, profileLoading, profileError, updateUserProfile } = useUserProfile(sessionUser);
  const authActions = useAuthActions();

  // Overall loading state - true if session is loading OR if we have a user but profile is loading
  const loading = sessionLoading || (sessionUser && profileLoading && !enrichedUser);

  console.log('useAuth state:', {
    sessionUser: sessionUser?.email || 'null',
    enrichedUser: enrichedUser?.email || 'null',
    sessionLoading,
    profileLoading,
    loading,
    profileError
  });

  return {
    user: enrichedUser,
    session,
    loading,
    isAuthenticated: !!enrichedUser,
    profileError,
    ...authActions,
    updateUserProfile,
  };
};
