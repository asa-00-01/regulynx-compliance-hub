import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useRoleBasedPermissions, CustomerRole, PlatformRole } from '@/hooks/useRoleBasedPermissions';
import { UserRole } from '@/types/index';

// Extended user type that includes profile data
interface ExtendedUser extends SupabaseUser {
  name: string;
  avatarUrl: string;
  status: 'verified' | 'pending' | 'flagged';
  riskScore: number;
  email: string; // Make email required for compatibility
  role: UserRole; // Use proper UserRole type
}

interface AuthContextType {
  user: ExtendedUser | null;
  session: Session | null;
  customerRoles: CustomerRole[];
  platformRoles: PlatformRole[];
  loading: boolean;
  isPlatformUser: boolean;
  isCustomerUser: boolean;
  isAuthenticated: boolean;
  authLoaded: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  updateUserProfile: (updates: any) => Promise<void>;
  // Legacy method aliases for compatibility
  login: (email: string, password: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<{ error: any }>;
  canAccess: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    customerRoles,
    platformRoles,
    isPlatformUser,
    isCustomerUser,
    refreshRoles,
    loading: rolesLoading,
  } = useRoleBasedPermissions();

  const enrichUserWithProfile = async (supabaseUser: SupabaseUser): Promise<ExtendedUser> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url, status, risk_score')
        .eq('id', supabaseUser.id)
        .single();

      return {
        ...supabaseUser,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.email || '',
        avatarUrl: profile?.avatar_url || '',
        status: (profile?.status as 'verified' | 'pending' | 'flagged') || 'pending',
        riskScore: profile?.risk_score || 0,
        role: 'admin' as UserRole, // Legacy role support
      };
    } catch (error) {
      // Return basic user info if profile fetch fails
      return {
        ...supabaseUser,
        email: supabaseUser.email || '',
        name: supabaseUser.email || '',
        avatarUrl: '',
        status: 'pending' as const,
        riskScore: 0,
        role: 'admin' as UserRole, // Legacy role support
      };
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          const enrichedUser = await enrichUserWithProfile(session.user);
          setUser(enrichedUser);
        } else {
          setUser(null);
        }
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          // Defer role refresh to avoid blocking auth state update
          setTimeout(() => {
            refreshRoles();
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        const enrichedUser = await enrichUserWithProfile(session.user);
        setUser(enrichedUser);
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [refreshRoles]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: userData || {}
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refreshAuth = async () => {
    await supabase.auth.refreshSession();
    await refreshRoles();
  };

  const updateUserProfile = async (updates: any) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      const { error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  // Legacy method aliases for compatibility
  const canAccess = (roles: string[]) => {
    if (!user) return false;
    return roles.includes(user.role || 'admin');
  };

  const value = {
    user,
    session,
    customerRoles,
    platformRoles,
    loading: loading || rolesLoading,
    isPlatformUser,
    isCustomerUser,
    isAuthenticated: !!user,
    authLoaded: !loading,
    signIn,
    signUp,
    signOut,
    refreshAuth,
    updateUserProfile,
    // Legacy method aliases
    login: signIn,
    logout: signOut,
    signup: signUp,
    canAccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};