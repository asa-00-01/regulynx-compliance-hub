import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { StandardUser } from '@/types/user';
import { toast } from 'sonner';

export class UserProfileService {
  static async enrichUserWithProfile(user: User): Promise<StandardUser | null> {
    if (!user) return null;

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
          
          const basicProfile = {
            id: user.id,
            name: user.email?.split('@')[0] || 'User',
            email: user.email || '', // Add required email field
            role: 'support' as const, // Use proper enum type
            risk_score: 0,
            status: 'active' as const, // Use proper enum type
            avatar_url: null
          };

          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert(basicProfile);
            
            if (insertError) {
              console.error('Failed to create profile:', insertError);
              throw insertError;
            }
            
            return this.createStandardUser(user, basicProfile);
          } catch (insertError) {
            console.error('Profile creation failed, using fallback');
            throw insertError;
          }
        }
        
        throw error;
      }

      console.log('Profile found:', profile);
      return this.createStandardUser(user, profile);
      
    } catch (error) {
      console.error("Error in enrichUserWithProfile:", error);
      throw error; // Let the caller handle this
    }
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
        toast.error(`Failed to update user details: ${error.message}`);
        throw error;
      }
    }

    toast.success("Profile updated successfully");
  }
}
