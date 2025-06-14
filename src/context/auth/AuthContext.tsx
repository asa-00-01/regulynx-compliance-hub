
import React, { createContext, useContext, ReactNode } from 'react';
import { AuthContextType, User, UserRole } from './types';
import { useAuthState } from './useAuthState';
import { loginUser, signupUser, logoutUser } from './authOperations';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { user, setUser, session, setSession, loading, setLoading, authLoaded } = useAuthState();

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    
    try {
      const userProfile = await loginUser(email, password);
      setUser(userProfile);
      setSession(session);
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
      await signupUser(email, password, role, name);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setSession(null);
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
