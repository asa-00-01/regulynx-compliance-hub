
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
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

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseUser): Promise<User> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (profile && !error) {
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: profile.role as UserRole,
        name: profile.name || supabaseUser.email || '',
        avatarUrl: profile.avatar_url || undefined,
      };
    } else {
      console.error('Error fetching profile:', error);
      // Create a basic user object if profile fetch fails
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: 'support', // Default role
        name: supabaseUser.email || '',
      };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          try {
            const userWithProfile = await fetchUserProfile(session.user);
            if (mounted) {
              setUser(userWithProfile);
            }
          } catch (error) {
            console.error('Error processing user profile:', error);
            if (mounted) {
              setUser(null);
            }
          }
        } else {
          if (mounted) {
            setUser(null);
          }
        }
        
        if (mounted) {
          setLoading(false);
          setAuthLoaded(true);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      // The onAuthStateChange will handle setting the user
      if (!session && mounted) {
        setLoading(false);
        setAuthLoaded(true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchUserProfile]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
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

    return await fetchUserProfile(data.user);
  }, [fetchUserProfile]);

  const signup = useCallback(async (email: string, password: string, role: UserRole): Promise<void> => {
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
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    setUser(null);
    setSession(null);
  }, []);

  const canAccess = useCallback((requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  }, [user]);

  const isAuthenticated = useMemo(() => !!user && !!session, [user, session]);

  const contextValue = useMemo(() => ({
    user,
    loading,
    authLoaded,
    login,
    logout,
    signup,
    isAuthenticated,
    canAccess,
    session
  }), [user, loading, authLoaded, login, logout, signup, isAuthenticated, canAccess, session]);

  return (
    <AuthContext.Provider value={contextValue}>
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
