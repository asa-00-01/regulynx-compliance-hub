
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole } from '@/types';

export interface ExtendedUser extends User {
  name?: string;
  role?: UserRole;
  image?: string;
  platform_roles?: string[];
}

export interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        const extendedUser: ExtendedUser = {
          ...session.user,
          name: session.user.user_metadata?.full_name || session.user.email,
          role: 'admin', // Default role
          image: session.user.user_metadata?.avatar_url,
          platform_roles: ['platform_admin']
        };
        setUser(extendedUser);
      }
      
      setSession(session);
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const extendedUser: ExtendedUser = {
          ...session.user,
          name: session.user.user_metadata?.full_name || session.user.email,
          role: 'admin',
          image: session.user.user_metadata?.avatar_url,
          platform_roles: ['platform_admin']
        };
        setUser(extendedUser);
      } else {
        setUser(null);
      }
      
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = {
    user,
    session,
    loading,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
