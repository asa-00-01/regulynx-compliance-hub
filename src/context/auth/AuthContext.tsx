
import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook, AuthHook } from '@/hooks/auth/useAuth';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';

// Extend the AuthHook with role-based permissions
interface AuthContextType extends AuthHook {
  customerRoles: any[];
  platformRoles: any[];
  isPlatformUser: boolean;
  isCustomerUser: boolean;
  profileError: string | null;
  
  // Legacy compatibility aliases
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  canAccess: (roles: string[]) => boolean;
  authLoaded: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProviderInner: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const authHook = useAuthHook();
  const {
    customerRoles,
    platformRoles,
    isPlatformUser,
    isCustomerUser,
    loading: rolesLoading,
  } = useRoleBasedPermissions();

  // Legacy compatibility function
  const canAccess = (roles: string[]) => {
    if (!authHook.user) return false;
    return roles.includes(authHook.user.role || 'support');
  };

  // The loading should be false if auth hook loading is false, regardless of roles loading
  const isLoading = authHook.loading;

  const value: AuthContextType = {
    ...authHook,
    customerRoles,
    platformRoles,
    isPlatformUser,
    isCustomerUser,
    loading: isLoading,
    authLoaded: !isLoading,
    
    // Legacy aliases
    login: authHook.signIn,
    logout: authHook.signOut,
    signup: authHook.signUp,
    canAccess,
  };

  console.log('AuthContext value:', {
    user: value.user?.email || 'null',
    isAuthenticated: value.isAuthenticated,
    loading: value.loading,
    authLoaded: value.authLoaded,
    profileError: value.profileError
  });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <AuthErrorBoundary>
      <AuthProviderInner>{children}</AuthProviderInner>
    </AuthErrorBoundary>
  );
};

export type { AuthContextType };
