
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
