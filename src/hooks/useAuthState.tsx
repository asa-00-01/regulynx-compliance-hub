
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedUser, UserRole } from '@/types/auth';
import { SupabasePlatformRoleService } from '@/services/supabasePlatformRoleService';

// Global singleton to prevent multiple listeners
let globalAuthListener: any = null;
let globalInitialized = false;

export const useAuthState = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);
  
  const profileFetchTimeoutRef = useRef<NodeJS.Timeout>();
  const isMountedRef = useRef(true);

  const refreshUserProfile = useCallback(async () => {
    if (!session?.user || !isMountedRef.current) return;
    
    try {
      const extendedProfile = await SupabasePlatformRoleService.getExtendedUserProfile(session.user.id);
      if (extendedProfile && isMountedRef.current) {
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

  // Stable auth handler that manages state
  const handleAuthChange = useCallback(async (event: string, currentSession: Session | null) => {
    if (!isMountedRef.current) return;
    
    console.log('🔐 Auth state change:', event, currentSession?.user?.email);
    
    // Prevent multiple initial session events globally
    if (event === 'INITIAL_SESSION' && globalInitialized) {
      console.log('🔐 Ignoring duplicate INITIAL_SESSION');
      return;
    }
    
    if (event === 'INITIAL_SESSION') {
      globalInitialized = true;
    }

    // Clear any existing timeout
    if (profileFetchTimeoutRef.current) {
      clearTimeout(profileFetchTimeoutRef.current);
      profileFetchTimeoutRef.current = undefined;
    }

    // Immediately update session and loading state
    if (isMountedRef.current) {
      setSession(currentSession);
      setLoading(false);
      setAuthLoaded(true);
    }
    
    if (currentSession?.user && isMountedRef.current) {
      // Defer profile fetching to prevent auth state deadlock
      profileFetchTimeoutRef.current = setTimeout(async () => {
        if (!isMountedRef.current) return;
        
        try {
          const extendedProfile = await SupabasePlatformRoleService.getExtendedUserProfile(currentSession.user.id);
          if (extendedProfile && isMountedRef.current) {
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
          if (isMountedRef.current) {
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
        }
      }, 100);
    } else if (isMountedRef.current) {
      setUser(null);
    }
  }, []); // Empty dependency array - this function should never recreate

  useEffect(() => {
    isMountedRef.current = true;

    // Set up the auth state listener only if one doesn't exist globally
    if (!globalAuthListener) {
      console.log('🔐 Setting up global auth listener');
      const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
      globalAuthListener = subscription;
    }

    // Get initial session only if not already initialized
    const getInitialSession = async () => {
      if (globalInitialized) {
        console.log('🔐 Auth already initialized, skipping initial session check');
        return;
      }
      
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('❌ Error getting initial session:', error);
        }
        if (isMountedRef.current && initialSession) {
          handleAuthChange('INITIAL_SESSION', initialSession);
        } else if (isMountedRef.current && !initialSession) {
          setLoading(false);
          setAuthLoaded(true);
        }
      } catch (error) {
        console.error('❌ Failed to get initial session:', error);
        if (isMountedRef.current) {
          setLoading(false);
          setAuthLoaded(true);
        }
      }
    };

    getInitialSession();

    return () => {
      isMountedRef.current = false;
      if (profileFetchTimeoutRef.current) {
        clearTimeout(profileFetchTimeoutRef.current);
      }
      // Don't unsubscribe the global listener here as other components might need it
    };
  }, []); // Empty dependency array - effect should only run once

  // Cleanup global listener when the app unmounts (not just this hook)
  useEffect(() => {
    return () => {
      // This will only run when the component unmounts permanently
      if (globalAuthListener && !isMountedRef.current) {
        console.log('🔐 Cleaning up global auth listener');
        globalAuthListener.unsubscribe();
        globalAuthListener = null;
        globalInitialized = false;
      }
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
