
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PricingPlan {
  id: string;
  plan_id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: string[];
  max_users: number;
  max_transactions: number;
  max_cases: number;
}

interface Subscription {
  id: string;
  customer_id: string;
  plan_id: string;
  status: 'active' | 'inactive' | 'cancelled' | 'past_due';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
}

interface SubscriptionState {
  subscribed: boolean;
  subscription_tier: string | null;
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  subscriptionState: SubscriptionState;
  plans: PricingPlan[];
  loading: boolean;
  refreshing: boolean;
  plansLoading: boolean;
  error: string | null;
  fetchSubscription: () => Promise<void>;
  fetchPlans: () => Promise<void>;
  checkSubscription: () => Promise<void>;
  createCheckout: (planId: string, interval: 'monthly' | 'yearly') => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionState, setSubscriptionState] = useState<SubscriptionState>({
    subscribed: false,
    subscription_tier: null
  });
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
        setSubscriptionState({ subscribed: false, subscription_tier: null });
        return;
      }

      // Mock subscription data
      const mockSubscription: Subscription = {
        id: 'sub_1',
        customer_id: user.id,
        plan_id: 'plan_pro',
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancel_at_period_end: false
      };

      setSubscription(mockSubscription);
      setSubscriptionState({
        subscribed: true,
        subscription_tier: 'Professional'
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      setSubscriptionState({ subscribed: false, subscription_tier: null });
    } finally {
      setLoading(false);
    }
  };

  const checkSubscription = async () => {
    setRefreshing(true);
    await fetchSubscription();
    setRefreshing(false);
  };

  const fetchPlans = async () => {
    setPlansLoading(true);
    setError(null);
    
    try {
      // Use fallback to mock data since pricing_plans table doesn't exist
      const mockPlans: PricingPlan[] = [
        {
          id: 'plan_starter',
          plan_id: 'starter',
          name: 'Starter',
          description: 'Perfect for small teams',
          price_monthly: 2900,
          price_yearly: 29000,
          features: ['Up to 5 users', 'Basic compliance', '1,000 transactions/month'],
          max_users: 5,
          max_transactions: 1000,
          max_cases: 50
        },
        {
          id: 'plan_pro',
          plan_id: 'pro',
          name: 'Professional',
          description: 'For growing businesses',
          price_monthly: 9900,
          price_yearly: 99000,
          features: ['Up to 25 users', 'Advanced compliance', '10,000 transactions/month'],
          max_users: 25,
          max_transactions: 10000,
          max_cases: 500
        }
      ];
      
      setPlans(mockPlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch plans');
    } finally {
      setPlansLoading(false);
    }
  };

  const createCheckout = (planId: string, interval: 'monthly' | 'yearly') => {
    console.log('Creating checkout session for:', planId, interval);
    // Mock implementation - would integrate with Stripe in production
  };

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        subscriptionState,
        plans,
        loading,
        refreshing,
        plansLoading,
        error,
        fetchSubscription,
        fetchPlans,
        checkSubscription,
        createCheckout
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
