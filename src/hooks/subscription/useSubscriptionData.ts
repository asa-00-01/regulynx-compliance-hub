
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/auth/AuthContext';
import { toast } from 'sonner';
import { useAuditLogging } from '@/hooks/useAuditLogging';

interface SubscriptionState {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  loading: boolean;
}

export const useSubscriptionData = () => {
  const { user, session, isAuthenticated } = useAuth();
  const { logDataAccess, logError } = useAuditLogging();
  
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    loading: true,
  });
  const [refreshing, setRefreshing] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!isAuthenticated || !session) {
      setSubscriptionState({ 
        subscribed: false, 
        subscription_tier: null, 
        subscription_end: null, 
        loading: false 
      });
      return;
    }

    try {
      await logDataAccess('subscription_check', 'subscription', user?.id);
      
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        await logError(new Error(error.message || 'Subscription check failed'), 'subscription_check', {
          user_id: user?.id
        });
        throw error;
      }

      await logDataAccess('subscription_check_success', 'subscription', user?.id, {
        subscribed: data.subscribed,
        tier: data.subscription_tier
      });

      setSubscriptionState({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier || null,
        subscription_end: data.subscription_end || null,
        loading: false,
      });
    } catch (error: any) {
      await logError(error, 'subscription_check', { user_id: user?.id });
      setSubscriptionState({ 
        subscribed: false, 
        subscription_tier: null, 
        subscription_end: null, 
        loading: false 
      });
      toast.error('Failed to check subscription status');
    } finally {
      setRefreshing(false);
    }
  }, [isAuthenticated, session, user, logDataAccess, logError]);

  useEffect(() => {
    if (isAuthenticated && session) {
      checkSubscription();
    } else {
      setSubscriptionState({ subscribed: false, loading: false, subscription_tier: null, subscription_end: null });
    }
  }, [isAuthenticated, session, checkSubscription]);

  return {
    subscriptionState,
    refreshing,
    checkSubscription
  };
};
