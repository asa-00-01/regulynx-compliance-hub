
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';

export type { User, UserRole };

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authLoaded: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, role: UserRole, name?: string) => Promise<void>;
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
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile.name,
            role: profile.role,
            riskScore: profile.risk_score,
            status: profile.status,
            avatarUrl: profile.avatar_url,
          };
          setUser(userData);
        } else {
           setUser({
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.email || 'New User',
            role: 'support',
            riskScore: 0,
            status: 'pending'
          });
          console.warn("User is logged in but profile data not found.");
        }
        setSession(session);
      } else {
        setUser(null);
        setSession(null);
      }
      setLoading(false);
      setAuthLoaded(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;

      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          const userData: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: profile.name,
            role: profile.role,
            riskScore: profile.risk_score,
            status: profile.status,
            avatarUrl: profile.avatar_url,
          };
          return userData;
        }
      }
      return null;
    } catch (error: any) {
      toast.error(error.message);
      console.error('Login error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, role: UserRole, name?: string): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            ...(name && { name }),
          }
        }
      });
      if (error) throw error;
      toast.success('Signup successful! Please check your email to verify your account.');
    } catch (error: any) {
      toast.error(error.message);
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      console.error('Logout error:', error);
    }
    // onAuthStateChange will handle setting user/session to null
    setLoading(false);
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
