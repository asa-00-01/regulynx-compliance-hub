
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedUser, UserRole } from '@/types/auth';
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
        // Convert ExtendedUserProfile to ExtendedUser
        const convertedUser: ExtendedUser = {
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
        setUser(convertedUser);
        console.log('✅ User profile refreshed with roles:', convertedUser.platform_roles);
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
            // Convert ExtendedUserProfile to ExtendedUser
            const convertedUser: ExtendedUser = {
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
            setUser(convertedUser);
            console.log('✅ Extended user profile loaded:', {
              email: convertedUser.email,
              platformRoles: convertedUser.platform_roles,
              customerRoles: convertedUser.customer_roles,
              isPlatformOwner: convertedUser.isPlatformOwner
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
