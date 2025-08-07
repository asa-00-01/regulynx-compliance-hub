
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { StandardUser } from '@/types/user';
import { toast } from 'sonner';

export class UserProfileService {
  static async enrichUserWithProfile(user: User): Promise<StandardUser | null> {
    if (!user) return null;

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (profile) {
        const userMetadata = user.user_metadata;
        const standardUser: StandardUser = {
          ...user,
          name: profile.name,
          role: profile.role,
          riskScore: profile.risk_score,
          status: profile.status,
          avatarUrl: profile.avatar_url,
          email: user.email || '',
          title: userMetadata.title,
          department: userMetadata.department,
          phone: userMetadata.phone,
          location: userMetadata.location,
          preferences: userMetadata.preferences,
        };
        return standardUser;
      } else {
        console.error("CRITICAL: User is authenticated but no profile found in 'profiles' table.");
        toast.error("Your user profile is missing or corrupted. Please contact support.");
        await supabase.auth.signOut();
        return null;
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      toast.error("An error occurred while fetching your profile.");
      await supabase.auth.signOut();
      return null;
    }
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
