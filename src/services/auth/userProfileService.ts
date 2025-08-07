
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { StandardUser, UserRole } from '@/types/user';

export class UserProfileService {
  static async enrichUserWithProfile(supabaseUser: SupabaseUser): Promise<StandardUser> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, avatar_url, status, risk_score, role')
        .eq('id', supabaseUser.id)
        .single();

      const userMetadata = supabaseUser.user_metadata || {};

      return {
        ...supabaseUser,
        email: supabaseUser.email || '',
        name: profile?.name || supabaseUser.email || '',
        avatarUrl: profile?.avatar_url || '',
        status: (profile?.status as 'verified' | 'pending' | 'flagged') || 'pending',
        riskScore: profile?.risk_score || 0,
        role: (profile?.role as UserRole) || 'user',
        title: userMetadata.title,
        department: userMetadata.department,
        phone: userMetadata.phone,
        location: userMetadata.location,
        preferences: userMetadata.preferences,
      };
    } catch (error) {
      console.warn('Failed to fetch user profile:', error);
      
      // Return basic user info if profile fetch fails
      return {
        ...supabaseUser,
        email: supabaseUser.email || '',
        name: supabaseUser.email || '',
        avatarUrl: '',
        status: 'pending' as const,
        riskScore: 0,
        role: 'user' as UserRole,
      };
    }
  }

  static async updateUserProfile(userId: string, updates: any): Promise<void> {
    try {
      const { name, avatarUrl, ...otherUpdates } = updates;

      // Update profiles table
      const profileUpdates: { name?: string, avatar_url?: string } = {};
      if (name !== undefined) profileUpdates.name = name;
      if (avatarUrl !== undefined) profileUpdates.avatar_url = avatarUrl;

      if (Object.keys(profileUpdates).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(profileUpdates)
          .eq('id', userId);

        if (error) throw error;
      }

      // Update user metadata
      if (Object.keys(otherUpdates).length > 0) {
        const { error } = await supabase.auth.updateUser({
          data: otherUpdates,
        });

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
}
