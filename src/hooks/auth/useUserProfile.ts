
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { StandardUser } from '@/types/user';
import { UserProfileService } from '@/services/auth/userProfileService';

export const useUserProfile = (user: User | null) => {
  const [enrichedUser, setEnrichedUser] = useState<StandardUser | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setEnrichedUser(null);
      setProfileLoading(false);
      setProfileError(null);
      return;
    }

    const enrichUser = async () => {
      setProfileLoading(true);
      setProfileError(null);
      
      try {
        console.log('Enriching user profile for:', user.email);
        const enriched = await UserProfileService.enrichUserWithProfile(user);
        setEnrichedUser(enriched);
      } catch (error) {
        console.error('Profile enrichment failed:', error);
        setProfileError('Failed to load user profile');
        
        // Create fallback user to prevent infinite loading
        const fallbackUser: StandardUser = {
          ...user,
          name: user.email?.split('@')[0] || 'User',
          role: 'support',
          riskScore: 0,
          status: 'active',
          avatarUrl: null,
          email: user.email || '',
          title: null,
          department: null,
          phone: null,
          location: null,
          preferences: null,
        };
        
        setEnrichedUser(fallbackUser);
      } finally {
        setProfileLoading(false);
      }
    };

    enrichUser();
  }, [user]);

  const updateUserProfile = async (updates: any) => {
    if (!enrichedUser) throw new Error('No user logged in');
    await UserProfileService.updateUserProfile(enrichedUser.id, updates);
  };

  return {
    enrichedUser,
    profileLoading,
    profileError,
    updateUserProfile,
  };
};
