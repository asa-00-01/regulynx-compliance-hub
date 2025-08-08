
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedUser } from '@/types/auth';
import { SupabasePlatformRoleService } from '@/services/supabasePlatformRoleService';

export const useAuthState = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);

  const refreshUserProfile = async () => {
    if (!session?.user) return;
    
    try {
      const extendedProfile = await SupabasePlatformRoleService.getExtendedUserProfile(session.user.id);
      if (extendedProfile) {
        setUser(extendedProfile);
        console.log('✅ User profile refreshed with roles:', extendedProfile.platform_roles);
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const handleAuthChange = async (event: string, currentSession: Session | null) => {
      console.log('🔐 Auth state change:', event, currentSession?.user?.email);
      
      if (!mounted) return;

      setSession(currentSession);
      setLoading(false);
      
      if (currentSession?.user) {
        try {
          // Get extended user profile with roles
          const extendedProfile = await SupabasePlatformRoleService.getExtendedUserProfile(currentSession.user.id);
          if (extendedProfile && mounted) {
            setUser(extendedProfile);
            console.log('✅ Extended user profile loaded:', {
              email: extendedProfile.email,
              platformRoles: extendedProfile.platform_roles,
              customerRoles: extendedProfile.customer_roles,
              isPlatformOwner: extendedProfile.isPlatformOwner
            });
          }
        } catch (error) {
          console.error('❌ Failed to load extended user profile:', error);
          // Fallback to basic user data
          if (mounted) {
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email || '',
              name: currentSession.user.user_metadata?.name || currentSession.user.email || '',
              role: 'support',
              riskScore: 0,
              status: 'pending',
              platform_roles: [],
              customer_roles: [],
              isPlatformOwner: false
            } as ExtendedUser);
          }
        }
      } else {
        if (mounted) {
          setUser(null);
        }
      }
      
      if (mounted) {
        setAuthLoaded(true);
      }
    };

    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error getting initial session:', error);
        }
        if (mounted) {
          await handleAuthChange('INITIAL_SESSION', initialSession);
        }
      } catch (error) {
        console.error('❌ Failed to get initial session:', error);
        if (mounted) {
          setLoading(false);
          setAuthLoaded(true);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { 
    user, 
    session, 
    loading, 
    authLoaded, 
    setUser, 
    refreshUserProfile 
  };
};
