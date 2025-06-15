import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types';
import { toast } from 'sonner';

export type { User, UserRole };

interface UserPreferences {
  notifications: {
    email: boolean;
    browser: boolean;
    weekly: boolean;
    newCase: boolean;
    riskAlerts: boolean;
  };
  theme: string;
}

export interface ExtendedUser extends User {
  title?: string;
  department?: string;
  phone?: string;
  location?: string;
  preferences?: UserPreferences;
}

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
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setAuthLoaded(true);
      if (!initialSession) {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (session: Session | null) => {
    if (session?.user) {
      setLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (profile) {
          const userMetadata = session.user.user_metadata;
          const userData: ExtendedUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile.name,
            role: profile.role,
            riskScore: profile.risk_score,
            status: profile.status,
            avatarUrl: profile.avatar_url,
            title: userMetadata.title,
            department: userMetadata.department,
            phone: userMetadata.phone,
            location: userMetadata.location,
            preferences: userMetadata.preferences,
          };
          setUser(userData);
        } else {
          console.error("CRITICAL: User is authenticated but no profile found in 'profiles' table. Forcing logout.");
          toast.error("Your user profile is missing or corrupted. Please contact support. You will be logged out.");
          await supabase.auth.signOut();
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("An error occurred while fetching your profile. Logging out.");
        await supabase.auth.signOut();
        setUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!authLoaded) return;
    fetchUserProfile(session);
  }, [session, authLoaded]);

  const login = async (email: string, password: string): Promise<ExtendedUser | null> => {
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
          const userMetadata = data.user.user_metadata;
          const userData: ExtendedUser = {
            id: data.user.id,
            email: data.user.email || '',
            name: profile.name,
            role: profile.role,
            riskScore: profile.risk_score,
            status: profile.status,
            avatarUrl: profile.avatar_url,
            title: userMetadata.title,
            department: userMetadata.department,
            phone: userMetadata.phone,
            location: userMetadata.location,
            preferences: userMetadata.preferences,
          };
          return userData;
        }
      }
      return null;
    } catch (error: any) {
      toast.error(error.message);
      console.error('Login error:', error);
      return null;
    }
  };

  const updateUserProfile = async (updates: Partial<ExtendedUser>) => {
    if (!user || !session) throw new Error("No user logged in");
  
    const { name, avatarUrl, title, department, phone, location, preferences } = updates;
  
    // Update profiles table
    const profileUpdates: { name?: string, avatar_url?: string } = {};
    if (name !== undefined) profileUpdates.name = name;
    if (avatarUrl !== undefined) profileUpdates.avatar_url = avatarUrl;
  
    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', user.id);
  
      if (error) {
        toast.error(`Failed to update profile: ${error.message}`);
        throw error;
      }
    }
  
    // Update user metadata
    const userMetadataUpdates: any = {};
    if (title !== undefined) userMetadataUpdates.title = title;
    if (department !== undefined) userMetadataUpdates.department = department;
    if (phone !== undefined) userMetadataUpdates.phone = phone;
    if (location !== undefined) userMetadataUpdates.location = location;
    if (preferences !== undefined) userMetadataUpdates.preferences = preferences;
    
    if (Object.keys(userMetadataUpdates).length > 0) {
      const { error } = await supabase.auth.updateUser({
        data: { ...session.user.user_metadata, ...userMetadataUpdates },
      });
  
      if (error) {
        toast.error(`Failed to update user details: ${error.message}`);
        throw error;
      }
    }
    
    // The onAuthStateChange listener will handle updating the user state
    // but we can give optimistic update for instant feedback
    setUser(prev => prev ? ({ ...prev, ...updates }) : null);

    toast.success("Profile updated successfully");
  };

  const signup = async (email: string, password: string, role: UserRole, name?: string): Promise<void> => {
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
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      console.error('Logout error:', error);
    }
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
        session,
        updateUserProfile,
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
