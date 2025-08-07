
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { StandardUser } from '@/types/user';
import { toast } from 'sonner';

export class UserProfileService {
  static async enrichUserWithProfile(user: User): Promise<StandardUser> {
    if (!user) {
      throw new Error('No user provided for profile enrichment');
    }

    try {
      console.log('Enriching user profile for:', user.email);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Profile lookup error:', error);
        
        // If profile doesn't exist (PGRST116), create a basic profile
        if (error.code === 'PGRST116') {
          console.log('No profile found, creating basic profile');
          return await this.createBasicProfile(user);
        }
        
        throw new Error(`Profile lookup failed: ${error.message}`);
      }

      console.log('Profile found:', profile);
      return this.createStandardUser(user, profile);
      
    } catch (error) {
      console.error("Error in enrichUserWithProfile:", error);
      
      // If it's a creation error, try once more to create a basic profile
      if (error instanceof Error && error.message.includes('Profile lookup failed')) {
        try {
          return await this.createBasicProfile(user);
        } catch (createError) {
          console.error('Failed to create fallback profile:', createError);
          throw new Error('Unable to create user profile. Please try signing in again.');
        }
      }
      
      throw error;
    }
  }

  private static async createBasicProfile(user: User): Promise<StandardUser> {
    const basicProfile = {
      id: user.id,
      name: user.email?.split('@')[0] || 'User',
      email: user.email || '',
      role: 'support' as const,
      risk_score: 0,
      status: 'active' as const,
      avatar_url: null
    };

    const { data, error: insertError } = await supabase
      .from('profiles')
      .insert(basicProfile)
      .select()
      .single();
    
    if (insertError) {
      console.error('Failed to create profile:', insertError);
      throw new Error(`Profile creation failed: ${insertError.message}`);
    }
    
    console.log('Basic profile created:', data);
    return this.createStandardUser(user, data);
  }

  private static createStandardUser(user: User, profile: any): StandardUser {
    const userMetadata = user.user_metadata || {};
    
    return {
      ...user,
      name: profile.name || user.email?.split('@')[0] || 'User',
      role: profile.role || 'support',
      riskScore: profile.risk_score || 0,
      status: profile.status || 'active',
      avatarUrl: profile.avatar_url,
      email: user.email || '',
      title: userMetadata.title || null,
      department: userMetadata.department || null,
      phone: userMetadata.phone || null,
      location: userMetadata.location || null,
      preferences: userMetadata.preferences || null,
    };
  }

  static async updateUserProfile(userId: string, updates: any): Promise<void> {
    const { name, avatarUrl, title, department, phone, location, preferences } = updates;
    
    // Update profiles table
    const profileUpdates: { name?: string, avatar_url?: string } = {};
    if (name !== undefined) profileUpdates.name = name;
    if (avatarUrl !== undefined) profileUpdates.avatar_url = avatarUrl;

    if (Object.keys(profileUpdates).length > 0) {
      const { error } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('id', userId);

      if (error) {
        console.error('Profile update error:', error);
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
        data: userMetadataUpdates,
      });

      if (error) {
        console.error('User metadata update error:', error);
        toast.error(`Failed to update user details: ${error.message}`);
        throw error;
      }
    }

    toast.success("Profile updated successfully");
  }
}
