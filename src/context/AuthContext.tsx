
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';

export type { User, UserRole };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authLoaded: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  isAuthenticated: boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock user for testing
const MOCK_USER: User = {
  id: 'mock-user-123',
  email: 'compliance@regulynx.com',
  role: 'complianceOfficer',
  name: 'Mock Compliance Officer',
  avatarUrl: undefined,
  riskScore: 25,
  status: 'verified',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    // Simulate authentication initialization with mock user
    const initializeMockAuth = () => {
      console.log('Initializing mock authentication...');
      
      // Set mock user as authenticated
      setUser(MOCK_USER);
      
      // Create a mock session object
      const mockSession = {
        access_token: 'mock-access-token',
        refresh_token: 'mock-refresh-token',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: MOCK_USER.id,
          email: MOCK_USER.email,
          aud: 'authenticated',
          role: 'authenticated',
          app_metadata: {},
          user_metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      } as Session;
      
      setSession(mockSession);
      setLoading(false);
      setAuthLoaded(true);
      
      console.log('Mock authentication initialized with user:', MOCK_USER);
    };

    // Initialize after a short delay to simulate real auth
    const timer = setTimeout(initializeMockAuth, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    console.log('Mock login attempt for:', email);
    
    // Simulate login delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Always return the mock user for any login attempt
    setUser(MOCK_USER);
    
    const mockSession = {
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      expires_in: 3600,
      expires_at: Date.now() + 3600000,
      token_type: 'bearer',
      user: {
        id: MOCK_USER.id,
        email: MOCK_USER.email,
        aud: 'authenticated',
        role: 'authenticated',
        app_metadata: {},
        user_metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    } as Session;
    
    setSession(mockSession);
    
    return MOCK_USER;
  };

  const signup = async (email: string, password: string, role: UserRole): Promise<void> => {
    console.log('Mock signup attempt for:', email, 'with role:', role);
    
    // Simulate signup delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For mock, just simulate successful signup
    // In real implementation, this would create a new user
  };

  const logout = async () => {
    console.log('Mock logout');
    setUser(null);
    setSession(null);
  };

  const canAccess = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
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
        isAuthenticated: !!user && !!session,
        canAccess,
        session
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

