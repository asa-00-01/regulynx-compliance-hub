
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

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
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  isAuthenticated: boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
  session: Session | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
        }

        if (isMounted) {
          if (initialSession) {
            await handleSession(initialSession);
          } else {
            setSession(null);
            setUser(null);
          }
          setLoading(false);
          setAuthLoaded(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (isMounted) {
          setLoading(false);
          setAuthLoaded(true);
        }
      }
    };

    const handleSession = async (session: Session | null) => {
      setSession(session);
      
      if (session?.user) {
        try {
          // Fetch user profile from the profiles table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile && !error) {
            const userWithProfile: User = {
              id: session.user.id,
              email: session.user.email || '',
              role: profile.role as UserRole,
              name: profile.name || session.user.email || '',
              avatarUrl: profile.avatar_url || undefined,
            };
            setUser(userWithProfile);
          } else {
            console.error('Error fetching profile:', error);
            // Create a basic user object if profile fetch fails
            const basicUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              role: 'support', // Default role
              name: session.user.email || '',
            };
            setUser(basicUser);
          }
        } catch (profileError) {
          console.error('Error handling user profile:', profileError);
          // Fallback user creation
          const basicUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            role: 'support',
            name: session.user.email || '',
          };
          setUser(basicUser);
        }
      } else {
        setUser(null);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        
        if (isMounted) {
          await handleSession(session);
          if (!authLoaded) {
            setLoading(false);
            setAuthLoaded(true);
          }
        }
      }
    );

    // Initialize auth
    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user returned from login');
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      throw new Error('Failed to fetch user profile');
    }

    const userWithProfile: User = {
      id: data.user.id,
      email: data.user.email || '',
      role: profile.role as UserRole,
      name: profile.name || data.user.email || '',
      avatarUrl: profile.avatar_url || undefined,
    };

    return userWithProfile;
  };

  const signup = async (email: string, password: string, role: UserRole): Promise<void> => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          name: email.split('@')[0],
          role: role,
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('No user returned from signup');
    }

    // The profile will be created automatically by the handle_new_user trigger
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
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
