import React from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedUser } from '@/types/auth';
import { UserRole } from '@/types';
import { toast } from 'sonner';

export const useAuthActions = (
  user: ExtendedUser | null,
  session: Session | null,
  setUser: React.Dispatch<React.SetStateAction<ExtendedUser | null>>
) => {
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
          
          // Map database status to ExtendedUser status
          const mapStatus = (dbStatus: string): 'verified' | 'pending' | 'rejected' | 'information_requested' => {
            switch (dbStatus) {
              case 'active':
                return 'verified';
              case 'suspended':
              case 'banned':
                return 'rejected';
              case 'pending':
              default:
                return 'pending';
            }
          };

          const userData: ExtendedUser = {
            id: data.user.id,
            email: data.user.email || '',
            name: profile.name,
            role: profile.role,
            riskScore: profile.risk_score,
            status: mapStatus(profile.status),
            avatarUrl: profile.avatar_url,
            title: userMetadata.title,
            department: userMetadata.department,
            phone: userMetadata.phone,
            location: userMetadata.location,
            preferences: userMetadata.preferences,
            customer_id: profile.customer_id || undefined,
            platform_roles: [],
            customer_roles: [],
            isPlatformOwner: false,
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

  return { login, logout, signup, updateUserProfile };
};
