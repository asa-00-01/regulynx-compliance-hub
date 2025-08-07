
import { createContext, useContext, useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { StandardUser } from '@/types/user';
import { CustomerRole, PlatformRole } from '@/hooks/useRoleBasedPermissions';

export interface AuthContextType {
  // Core auth state
  user: StandardUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  authLoaded: boolean;
  
  // Role-based permissions
  customerRoles: CustomerRole[];
  platformRoles: PlatformRole[];
  isPlatformUser: boolean;
  isCustomerUser: boolean;
  
  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUserProfile: (updates: any) => Promise<void>;
  
  // Legacy compatibility
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  canAccess: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<StandardUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoaded, setAuthLoaded] = useState<boolean>(false);
  const [customerRoles, setCustomerRoles] = useState<CustomerRole[]>([]);
  const [platformRoles, setPlatformRoles] = useState<PlatformRole[]>([]);
  const isPlatformUser = platformRoles.length > 0;
  const isCustomerUser = customerRoles.length > 0;

  const signIn = async (email: string, password: string) => {
    return { error: null };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    return { error: null };
  };

  const signOut = async () => {};

  const refreshAuth = async () => {};

  const updateUserProfile = async (updates: any) => {};

  const login = async (email: string, password: string) => {
    return { error: null };
  };

  const logout = async () => {};

  const signup = async (email: string, password: string, userData?: any) => {
    return { error: null };
  };

  const canAccess = (roles: string[]) => {
    return false;
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    isAuthenticated,
    authLoaded,
    customerRoles,
    platformRoles,
    isPlatformUser,
    isCustomerUser,
    signIn,
    signUp,
    signOut,
    refreshAuth,
    updateUserProfile,
    login,
    logout,
    signup,
    canAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

// Export useAuth for backward compatibility
export const useAuth = useAuthContext;
