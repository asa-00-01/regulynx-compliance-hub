import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useAuditLogging } from '@/hooks/useAuditLogging';

interface SubscriptionState {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  loading: boolean;
}

interface SubscriptionContextType {
  subscriptionState: SubscriptionState;
  checkSubscription: () => Promise<void>;
  createCheckout: (planId: string, billingType?: 'monthly' | 'yearly') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  refreshing: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, isAuthenticated } = useAuth();
  const { logPayment, logError, logDataAccess } = useAuditLogging();
  
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    subscribed: false,
    subscription_tier: null,
    subscription_end: null,
    loading: true,
  });
  const [refreshing, setRefreshing] = useState(false);

  const checkSubscription = async () => {
    if (!isAuthenticated || !session) {
      setSubscriptionState({ subscribed: false, loading: false });
      return;
    }

    try {
      console.log('🔍 Checking subscription status...');
      await logDataAccess('subscription_check', 'subscription', user?.id);
      
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ Subscription check failed:', error);
        await logError(new Error(error.message || 'Subscription check failed'), 'subscription_check', {
          user_id: user?.id
        });
        throw error;
      }

      console.log('✅ Subscription check successful:', data);
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
      console.error('🚨 Error checking subscription:', error);
      await logError(error, 'subscription_check', { user_id: user?.id });
      setSubscriptionState({ subscribed: false, loading: false });
      toast.error('Failed to check subscription status');
    } finally {
      setRefreshing(false);
    }
  };

  const createCheckout = async (planId: string, billingType: 'monthly' | 'yearly' = 'monthly') => {
    console.log('🔍 Debug - createCheckout called', { 
      isAuthenticated, 
      hasUser: !!user, 
      hasSession: !!session,
      sessionAccessToken: !!session?.access_token 
    });

    if (!isAuthenticated || !user || !session?.access_token) {
      console.error('❌ Authentication check failed:', { isAuthenticated, user: !!user, session: !!session });
      await logPayment('checkout_authentication_failed', {
        plan_id: planId,
        billing_type: billingType,
        reason: 'not_authenticated'
      }, false);
      toast.error('Please login to subscribe');
      return;
    }

    try {
      console.log('✅ Authentication successful, creating checkout...');
      await logPayment('checkout_attempt', {
        plan_id: planId,
        billing_type: billingType,
        user_id: user.id
      });

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, billingType },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        await logPayment('checkout_failed', {
          plan_id: planId,
          billing_type: billingType,
          user_id: user.id,
          error: error.message
        }, false);
        throw error;
      }

      console.log('✅ Checkout session created successfully');
      await logPayment('checkout_session_created', {
        plan_id: planId,
        billing_type: billingType,
        user_id: user.id,
        checkout_url: data.url
      });

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('🚨 Checkout creation failed:', error);
      await logError(error, 'checkout_creation', {
        plan_id: planId,
        billing_type: billingType,
        user_id: user?.id
      });
      toast.error(`Failed to create checkout session: ${error.message}`);
    }
  };

  const openCustomerPortal = async () => {
    if (!isAuthenticated || !user || !session?.access_token) {
      await logPayment('portal_access_denied', {
        reason: 'not_authenticated'
      }, false);
      toast.error('Please login to manage your subscription');
      return;
    }

    try {
      await logPayment('customer_portal_attempt', {
        user_id: user.id
      });

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        await logPayment('customer_portal_failed', {
          user_id: user.id,
          error: error.message
        }, false);
        throw error;
      }

      await logPayment('customer_portal_opened', {
        user_id: user.id,
        portal_url: data.url
      });

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error: any) {
      console.error('🚨 Customer portal error:', error);
      await logError(error, 'customer_portal', { user_id: user?.id });
      toast.error(`Failed to open customer portal: ${error.message}`);
    }
  };

  useEffect(() => {
    if (isAuthenticated && session) {
      checkSubscription();
    } else {
      setSubscriptionState({ subscribed: false, loading: false, subscription_tier: null, subscription_end: null });
    }
  }, [isAuthenticated, session]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionState,
        checkSubscription,
        createCheckout,
        openCustomerPortal,
        refreshing,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
