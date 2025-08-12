
import { useState, useEffect, useCallback, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { ExtendedUser, UserRole } from '@/types/auth';
import { SupabasePlatformRoleService } from '@/services/supabasePlatformRoleService';
import { authManager } from '@/services/authManager';

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

  // Handle auth changes from the singleton manager
  const handleAuthChange = useCallback(async (currentSession: Session | null, currentUser: User | null) => {
    if (!isMountedRef.current) return;
    
    console.log('🔐 useAuthState received auth change:', currentUser?.email);
    
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
  }, []);

  useEffect(() => {
    isMountedRef.current = true;

    // Initialize the singleton auth manager and subscribe to changes
    authManager.initialize().then(() => {
      console.log('🔐 useAuthState subscribing to auth manager');
    });

    const unsubscribe = authManager.subscribe(handleAuthChange);

    return () => {
      isMountedRef.current = false;
      if (profileFetchTimeoutRef.current) {
        clearTimeout(profileFetchTimeoutRef.current);
      }
      unsubscribe();
      console.log('🔐 useAuthState unsubscribed from auth manager');
    };
  }, []); // Empty dependency array is safe now since we're using a singleton

  return { 
    user, 
    session, 
    loading, 
    authLoaded, 
    setUser, 
    refreshUserProfile 
  };
};
