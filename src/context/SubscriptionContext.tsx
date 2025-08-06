
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface SubscriptionPlan {
  id: string;
  plan_id: string;
  name: string;
  description?: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_users?: number;
  max_transactions?: number;
  max_cases?: number;
  is_active: boolean;
}

interface SubscriptionState {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  loading: boolean;
}

interface SubscriptionContextType {
  subscriptionState: SubscriptionState;
  plans: SubscriptionPlan[];
  checkSubscription: () => Promise<void>;
  createCheckout: (planId: string, billingType?: 'monthly' | 'yearly') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  trackUsage: (metricType: string) => Promise<void>;
  refreshing: boolean;
  plansLoading: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | null>(null);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, session, isAuthenticated } = useAuth();
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    subscribed: false,
    loading: true,
  });
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [plansLoading, setPlansLoading] = useState(true);

  // Load subscription plans
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_plans')
          .select('*')
          .eq('is_active', true)
          .order('price_monthly', { ascending: true });

        if (error) throw error;
        
        // Transform the data to match our SubscriptionPlan interface
        const transformedPlans: SubscriptionPlan[] = (data || []).map(plan => ({
          id: plan.id,
          plan_id: plan.plan_id,
          name: plan.name,
          description: plan.description,
          price_monthly: plan.price_monthly,
          price_yearly: plan.price_yearly,
          features: Array.isArray(plan.features) ? plan.features as string[] : [],
          max_users: plan.max_users,
          max_transactions: plan.max_transactions,
          max_cases: plan.max_cases,
          is_active: plan.is_active,
        }));

        setPlans(transformedPlans);
      } catch (error) {
        console.error('Error loading plans:', error);
        toast.error('Failed to load subscription plans');
      } finally {
        setPlansLoading(false);
      }
    };

    loadPlans();
  }, []);

  const checkSubscription = async () => {
    if (!isAuthenticated || !session) {
      setSubscriptionState({ subscribed: false, loading: false });
      return;
    }

    try {
      setRefreshing(true);
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscriptionState({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        loading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscriptionState({ subscribed: false, loading: false });
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
      toast.error('Please login to subscribe');
      return;
    }

    try {
      console.log('✅ Authentication successful, creating checkout...');
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId, billingType },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        throw error;
      }

      console.log('✅ Checkout session created successfully');
      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast.error('Failed to create checkout session');
    }
  };

  const openCustomerPortal = async () => {
    if (!isAuthenticated || !user || !session?.access_token) {
      toast.error('Please login to manage your subscription');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      // Open customer portal in a new tab
      window.open(data.url, '_blank');
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast.error('Failed to open customer portal');
    }
  };

  const trackUsage = async (metricType: string) => {
    if (!user) return;

    try {
      const { error } = await supabase.rpc('track_usage', {
        metric_type: metricType
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error tracking usage:', error);
    }
  };

  // Check subscription on user change
  useEffect(() => {
    if (isAuthenticated && user && session) {
      checkSubscription();
    } else {
      setSubscriptionState({ subscribed: false, loading: false });
    }
  }, [isAuthenticated, user, session]);

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionState,
        plans,
        checkSubscription,
        createCheckout,
        openCustomerPortal,
        trackUsage,
        refreshing,
        plansLoading,
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
