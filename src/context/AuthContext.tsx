
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';

// Mock authentication service - would be replaced with Supabase Auth
const mockUsers: User[] = [
  {
    id: '1',
    email: 'compliance@regulynx.com',
    role: 'complianceOfficer',
    name: 'Alex Nordström',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
  },
  {
    id: '2',
    email: 'admin@regulynx.com',
    role: 'admin',
    name: 'Johan Berg',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
  },
  {
    id: '3',
    email: 'executive@regulynx.com',
    role: 'executive',
    name: 'Lena Wikström',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
  },
  {
    id: '4',
    email: 'support@regulynx.com',
    role: 'support',
    name: 'Astrid Lindqvist',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
  },
];

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authLoaded: boolean; // Added missing property
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  signup: (email: string, password: string, role: UserRole) => Promise<void>;
  isAuthenticated: boolean;
  canAccess: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false); // Added missing state

  useEffect(() => {
    // Check for saved user in localStorage (mock persistence)
    const savedUser = localStorage.getItem('regulynx-user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
    setAuthLoaded(true); // Set authLoaded to true when authentication check is complete
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    // This is a mock implementation - would be replaced with actual Supabase auth
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(u => u.email === email);
        if (user && password === 'password') { // Mock password check
          setUser(user);
          localStorage.setItem('regulynx-user', JSON.stringify(user));
          resolve(user);
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800); // Simulate network delay
    });
  };

  const signup = async (email: string, password: string, role: UserRole): Promise<void> => {
    // This would be replaced with actual Supabase auth signup
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const newUser: User = {
          id: `${mockUsers.length + 1}`,
          email,
          role,
          name: email.split('@')[0],
        };
        
        mockUsers.push(newUser);
        setUser(newUser);
        localStorage.setItem('regulynx-user', JSON.stringify(newUser));
        resolve();
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('regulynx-user');
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
        authLoaded, // Added missing property
        login, 
        logout, 
        signup,
        isAuthenticated: !!user,
        canAccess
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
