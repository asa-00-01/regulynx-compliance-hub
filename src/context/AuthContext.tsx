
import React, { createContext, useContext, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { UserRole } from '@/types';
import { ExtendedUser } from '@/types/auth';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthActions } from '@/hooks/useAuthActions';

interface AuthContextType {
  user: ExtendedUser | null;
  loading: boolean;
  authLoaded: boolean;
  login: (email: string, password: string) => Promise<ExtendedUser | null>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, role: UserRole, name?: string) => Promise<void>;
  isAuthenticated: boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
  session: Session | null;
  updateUserProfile: (updates: Partial<ExtendedUser>) => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, loading, authLoaded, setUser, refreshUserProfile } = useAuthState();
  const { login, logout, signup, updateUserProfile } = useAuthActions(user, session, setUser);

  const isAuthenticated = !!user && !!session;

  const canAccess = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    
    // Platform owners always have access
    if (user.isPlatformOwner) return true;
    
    // Check customer roles mapped to legacy roles
    const hasCustomerRole = user.customer_roles.some(customerRole => {
      switch (customerRole) {
        case 'customer_admin':
          return requiredRoles.includes('admin');
        case 'customer_compliance':
          return requiredRoles.includes('complianceOfficer');
        case 'customer_executive':
          return requiredRoles.includes('executive');
        case 'customer_support':
          return requiredRoles.includes('support');
        default:
          return false;
      }
    });
    
    return hasCustomerRole || requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        authLoaded,
        login, 
        logout, 
        signup,
        isAuthenticated,
        canAccess,
        session,
        updateUserProfile,
        refreshUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
