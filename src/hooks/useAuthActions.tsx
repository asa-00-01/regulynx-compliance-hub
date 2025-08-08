
import React from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedUser } from '@/types/auth';
import { UserRole } from '@/types';
import { toast } from 'sonner';
import { SupabasePlatformRoleService } from '@/services/supabasePlatformRoleService';

export const useAuthActions = (
  user: ExtendedUser | null,
  session: Session | null,
  setUser: React.Dispatch<React.SetStateAction<ExtendedUser | null>>
) => {
  const login = async (email: string, password: string): Promise<ExtendedUser | null> => {
    try {
      console.log('🔐 Starting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email: email.toLowerCase().trim(), 
        password 
      });
      
      if (error) {
        console.error('❌ Sign in error:', error);
        throw error;
      }

      if (data.user && data.session) {
        console.log('✅ Authentication successful');
        
        try {
          // Try to get extended profile
          const extendedProfile = await SupabasePlatformRoleService.getExtendedUserProfile(data.user.id);
          
          if (extendedProfile) {
            const userData: ExtendedUser = {
              id: extendedProfile.id,
              email: extendedProfile.email,
              name: extendedProfile.name,
              role: extendedProfile.role as UserRole,
              riskScore: extendedProfile.risk_score || 0,
              status: extendedProfile.status,
              avatarUrl: extendedProfile.avatar_url,
              customer_id: extendedProfile.customer_id,
              platform_roles: extendedProfile.platform_roles,
              customer_roles: extendedProfile.customer_roles,
              customer: extendedProfile.customer,
              isPlatformOwner: extendedProfile.isPlatformOwner
            };
            
            console.log('✅ Extended profile loaded');
            return userData;
          }
        } catch (profileError) {
          console.warn('⚠️ Could not load extended profile, using basic profile:', profileError);
        }

        // Fallback to basic profile from auth
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          const userData: ExtendedUser = {
            id: data.user.id,
            email: data.user.email || '',
            name: profile?.name || data.user.email || '',
            role: (profile?.role || 'support') as UserRole,
            riskScore: profile?.risk_score || 0,
            status: profile?.status === 'active' ? 'verified' : 'pending',
            avatarUrl: profile?.avatar_url,
            customer_id: profile?.customer_id,
            platform_roles: [],
            customer_roles: [],
            isPlatformOwner: false,
          };
          
          console.log('✅ Basic profile loaded');
          return userData;
        } catch (basicProfileError) {
          console.warn('⚠️ Could not load basic profile, using minimal data:', basicProfileError);
          
          // Absolute fallback
          const minimalUser: ExtendedUser = {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.email || '',
            role: 'support',
            riskScore: 0,
            status: 'pending',
            platform_roles: [],
            customer_roles: [],
            isPlatformOwner: false,
          };
          
          return minimalUser;
        }
      }
      
      return null;
    } catch (error: any) {
      console.error('❌ Login error:', error);
      
      // More specific error messages
      let errorMessage = 'Login failed. Please try again.';
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please check your credentials.';
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = 'Please check your email and confirm your account before logging in.';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
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
        const errorMessage = `Failed to update profile: ${error.message}`;
        toast.error(errorMessage);
        throw new Error(errorMessage);
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
        const errorMessage = `Failed to update user details: ${error.message}`;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
    }
    
    setUser(prev => prev ? ({ ...prev, ...updates }) : null);
    toast.success("Profile updated successfully");
  };

  const signup = async (email: string, password: string, role: UserRole, name?: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            role,
            ...(name && { name }),
          }
        }
      });
      
      if (error) throw error;
      
      toast.success('Account created successfully! Please check your email to verify your account.');
    } catch (error: any) {
      console.error('Signup error:', error);
      
      let errorMessage = 'Signup failed. Please try again.';
      if (error.message?.includes('User already registered')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = 'Password should be at least 6 characters long.';
      }
      
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    console.log('🔐 Starting logout');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Logout error:', error);
        toast.error('Logout failed. Please try again.');
        throw error;
      } else {
        console.log('✅ Logout successful');
        toast.success('Logged out successfully');
      }
    } catch (error: any) {
      console.error('❌ Logout error:', error);
      throw error;
    }
  };

  return { login, logout, signup, updateUserProfile };
};
