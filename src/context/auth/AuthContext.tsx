
import React, { createContext, useContext } from 'react';
import { StandardUser } from '@/types/user';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { AuthService } from '@/services/auth/authService';
import { UserProfileService } from '@/services/auth/userProfileService';
import { AuthContextType } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authState = useAuthState();
  const {
    customerRoles,
    platformRoles,
    isPlatformUser,
    isCustomerUser,
    refreshRoles,
    loading: rolesLoading,
  } = useRoleBasedPermissions();

  const signIn = async (email: string, password: string) => {
    return AuthService.signIn(email, password);
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    return AuthService.signUp(email, password, userData);
  };

  const signOut = async () => {
    await AuthService.signOut();
  };

  const refreshAuth = async () => {
    await AuthService.refreshSession();
    await refreshRoles();
  };

  const updateUserProfile = async (updates: any) => {
    if (!authState.user) throw new Error('No user logged in');
    await UserProfileService.updateUserProfile(authState.user.id, updates);
  };

  // Legacy compatibility
  const canAccess = (roles: string[]) => {
    if (!authState.user) return false;
    return roles.includes(authState.user.role || 'user');
  };

  const value: AuthContextType = {
    ...authState,
    customerRoles,
    platformRoles,
    loading: authState.loading || rolesLoading,
    isPlatformUser,
    isCustomerUser,
    signIn,
    signUp,
    signOut,
    refreshAuth,
    updateUserProfile,
    // Legacy aliases
    login: signIn,
    logout: signOut,
    signup: signUp,
    canAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export type { AuthContextType };
