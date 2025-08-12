
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedUser, UserRole } from '@/types/auth';
import { SupabasePlatformRoleService } from '@/services/supabasePlatformRoleService';

export const useAuthState = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);
  
  // Use refs to prevent infinite loops
  const profileFetchTimeoutRef = useRef<NodeJS.Timeout>();
  const isInitializedRef = useRef(false);

  const refreshUserProfile = useCallback(async () => {
    if (!session?.user) return;
    
    try {
      const extendedProfile = await SupabasePlatformRoleService.getExtendedUserProfile(session.user.id);
      if (extendedProfile) {
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
        console.log('✅ User profile refreshed successfully');
      }
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  }, [session?.user?.id]);

  // Stable auth handler that doesn't recreate on every render
  const handleAuthChange = useCallback(async (event: string, currentSession: Session | null) => {
    console.log('🔐 Auth state change:', event, currentSession?.user?.email);
    
    // Prevent multiple initial session events
    if (event === 'INITIAL_SESSION' && isInitializedRef.current) {
      return;
    }
    
    if (event === 'INITIAL_SESSION') {
      isInitializedRef.current = true;
    }

    // Clear any existing timeout
    if (profileFetchTimeoutRef.current) {
      clearTimeout(profileFetchTimeoutRef.current);
      profileFetchTimeoutRef.current = undefined;
    }

    // Immediately update session and loading state
    setSession(currentSession);
    setLoading(false);
    setAuthLoaded(true);
    
    if (currentSession?.user) {
      // Defer profile fetching to prevent auth state deadlock
      profileFetchTimeoutRef.current = setTimeout(async () => {
        try {
          const extendedProfile = await SupabasePlatformRoleService.getExtendedUserProfile(currentSession.user.id);
          if (extendedProfile) {
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
          }
        } catch (error) {
          console.error('❌ Failed to load extended user profile:', error);
          // Create fallback user data
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
      }, 100);
    } else {
      setUser(null);
    }
  }, []); // Empty dependency array - this function should never recreate

  useEffect(() => {
    let mounted = true;

    // Set up the auth state listener with stable callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);

    // Get initial session only once
    const getInitialSession = async () => {
      if (isInitializedRef.current) return;
      
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error getting initial session:', error);
        }
        if (mounted && initialSession) {
          handleAuthChange('INITIAL_SESSION', initialSession);
        } else if (mounted && !initialSession) {
          setLoading(false);
          setAuthLoaded(true);
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
      if (profileFetchTimeoutRef.current) {
        clearTimeout(profileFetchTimeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - effect should only run once

  return { 
    user, 
    session, 
    loading, 
    authLoaded, 
    setUser, 
    refreshUserProfile 
  };
};
