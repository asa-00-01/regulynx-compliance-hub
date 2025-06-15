
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { ExtendedUser } from '@/types/auth';
import { toast } from 'sonner';

export const useAuthState = () => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoaded, setAuthLoaded] = useState(false);

  useEffect(() => {
    setLoading(true);
    
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      setAuthLoaded(true);
      if (!initialSession) {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (session: Session | null) => {
    if (session?.user) {
      setLoading(true);
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (profile) {
          const userMetadata = session.user.user_metadata;
          const userData: ExtendedUser = {
            id: session.user.id,
            email: session.user.email || '',
            name: profile.name,
            role: profile.role,
            riskScore: profile.risk_score,
            status: profile.status,
            avatarUrl: profile.avatar_url,
            title: userMetadata.title,
            department: userMetadata.department,
            phone: userMetadata.phone,
            location: userMetadata.location,
            preferences: userMetadata.preferences,
          };
          setUser(userData);
        } else {
          console.error("CRITICAL: User is authenticated but no profile found in 'profiles' table. Forcing logout.");
          toast.error("Your user profile is missing or corrupted. Please contact support. You will be logged out.");
          await supabase.auth.signOut();
          setUser(null);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        toast.error("An error occurred while fetching your profile. Logging out.");
        await supabase.auth.signOut();
        setUser(null);
      } finally {
        setLoading(false);
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (!authLoaded) return;
    fetchUserProfile(session);
  }, [session, authLoaded]);

  return { user, session, loading, authLoaded, setUser };
};
