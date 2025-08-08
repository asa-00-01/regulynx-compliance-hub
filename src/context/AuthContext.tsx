
import React, { createContext, useContext, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { ExtendedUser, UserRole } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';

export interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  authLoaded: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<ExtendedUser | null>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, role: UserRole, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<ExtendedUser>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  canAccess: (requiredRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session, loading, authLoaded, setUser, refreshUserProfile } = useAuthState();
  const { login, logout, signup, updateUserProfile } = useAuthActions(user, session, setUser);

  const isAuthenticated = !!user && !!session;

  const signOut = async () => {
    await logout();
  };

  // Memoize canAccess function to prevent unnecessary re-renders
  const canAccess = useCallback((requiredRoles: string[]): boolean => {
    if (!user || !requiredRoles.length) return true;
    return requiredRoles.includes(user.role);
  }, [user?.role]); // Only depend on user.role, not the entire user object

  const value: AuthContextType = React.useMemo(() => ({
    user,
    session,
    loading,
    authLoaded,
    isAuthenticated,
    login,
    logout,
    signup,
    signOut,
    updateUserProfile,
    refreshUserProfile,
    canAccess
  }), [
    user, 
    session, 
    loading, 
    authLoaded, 
    isAuthenticated, 
    login, 
    logout, 
    signup, 
    updateUserProfile, 
    refreshUserProfile, 
    canAccess
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
