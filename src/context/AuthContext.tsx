import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/supabase';

// Define the user role type to match your existing types
export type UserRole = 'complianceOfficer' | 'admin' | 'executive' | 'support';

// Extended user interface that includes profile data
export interface User {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatarUrl?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authLoaded: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (email: string, password: string, role: UserRole, name?: string) => Promise<void>;
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
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(false);
  const [authLoaded, setAuthLoaded] = useState(false);

  // Function to fetch user profile and create User object
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    try {
      console.log('Fetching profile for user:', supabaseUser.id);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }

      console.log('Profile fetched successfully:', profile);
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: profile.role as UserRole,
        name: profile.name,
        avatarUrl: profile.avatar_url || undefined,
      };
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Initialize authentication state
  useEffect(() => {
    console.log('Initializing auth...');
    
    // Listen for auth changes first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('User signed in, fetching profile...');
          const userProfile = await fetchUserProfile(session.user);
          if (userProfile) {
            setUser(userProfile);
            setSession(session);
            console.log('User profile set:', userProfile);
          } else {
            console.error('Failed to fetch user profile');
            setUser(null);
            setSession(null);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setSession(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('Token refreshed');
          setSession(session);
          // Keep existing user if available, or fetch if not
          if (!user) {
            const userProfile = await fetchUserProfile(session.user);
            if (userProfile) {
              setUser(userProfile);
            }
          }
        }
        
        // Always mark auth as loaded after processing any auth event
        if (!authLoaded) {
          console.log('Setting authLoaded to true');
          setAuthLoaded(true);
        }
      }
    );

    // Then get initial session
    const initializeSession = async () => {
      try {
        console.log('Getting initial session...');
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthLoaded(true);
          return;
        }

        if (initialSession?.user) {
          console.log('Initial session found, fetching profile...');
          const userProfile = await fetchUserProfile(initialSession.user);
          if (userProfile) {
            setUser(userProfile);
            setSession(initialSession);
            console.log('Initial user profile set:', userProfile);
          }
        } else {
          console.log('No initial session found');
        }
      } catch (error) {
        console.error('Error initializing session:', error);
      } finally {
        console.log('Setting authLoaded to true (initialization complete)');
        setAuthLoaded(true);
      }
    };

    initializeSession();

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    
    try {
      console.log('Attempting login for:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from login');
      }

      const userProfile = await fetchUserProfile(data.user);
      if (!userProfile) {
        throw new Error('Failed to fetch user profile');
      }

      setUser(userProfile);
      setSession(data.session);
      
      return userProfile;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: UserRole, name?: string): Promise<void> => {
    setLoading(true);
    
    try {
      console.log('Attempting signup for:', email, 'with role:', role);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            name: name || email.split('@')[0],
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.user) {
        throw new Error('No user returned from signup');
      }

      console.log('Signup successful for:', email);
      // Note: The user profile will be created automatically by the trigger
      // The user will need to confirm their email before they can log in
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log('Attempting logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      console.log('Logout successful');
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if there's an error, clear the local state
      setUser(null);
      setSession(null);
    }
  };

  const canAccess = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  console.log('AuthProvider render - authLoaded:', authLoaded, 'user:', !!user, 'session:', !!session);

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
