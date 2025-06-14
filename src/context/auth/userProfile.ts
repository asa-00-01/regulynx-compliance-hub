
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from './types';

export const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
  try {
    console.log('Fetching profile for user:', supabaseUser.id);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      
      // If profile doesn't exist, create a default one
      if (error.code === 'PGRST116') {
        console.log('Profile not found, creating default profile...');
        const defaultProfile = {
          id: supabaseUser.id,
          name: supabaseUser.email?.split('@')[0] || 'User',
          role: 'support' as UserRole,
          avatar_url: null
        };

        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert(defaultProfile)
          .select()
          .single();

        if (insertError) {
          console.error('Error creating default profile:', insertError);
          return null;
        }

        console.log('Default profile created:', newProfile);
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          role: newProfile.role as UserRole,
          name: newProfile.name,
          avatarUrl: newProfile.avatar_url || undefined,
        };
      }
      
      return null;
    }

    console.log('Profile fetched successfully:', profile);
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: profile.role as UserRole,
      name: profile.name,
      avatarUrl: profile.avatar_url || undefined,
    };
  } catch (error) {
    console.error('Error in fetchUserProfile:', error);
    return null;
  }
};
