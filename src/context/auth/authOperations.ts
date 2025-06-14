
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from './types';
import { fetchUserProfile } from './userProfile';

export const loginUser = async (email: string, password: string): Promise<User> => {
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

  return userProfile;
};

export const signupUser = async (email: string, password: string, role: UserRole, name?: string): Promise<void> => {
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
};

export const logoutUser = async (): Promise<void> => {
  console.log('Attempting logout...');
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Logout error:', error);
    throw error;
  }
  console.log('Logout successful');
};
