
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

interface SubscriptionContextType {
  subscription: Subscription | null;
  plans: PricingPlan[];
  loading: boolean;
  error: string | null;
  fetchSubscription: () => Promise<void>;
  fetchPlans: () => Promise<void>;
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
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscription = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setSubscription(null);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.from('pricing_plans').select('*');
      
      if (error) throw error;
      
      // Convert Json[] to string[] for features
      const processedPlans: PricingPlan[] = (data || []).map(plan => ({
        ...plan,
        features: Array.isArray(plan.features) 
          ? plan.features.map(f => typeof f === 'string' ? f : JSON.stringify(f))
          : []
      }));
      
      setPlans(processedPlans);
    } catch (err) {
      // Fallback to mock data if table doesn't exist
      const mockPlans: PricingPlan[] = [
        {
          id: 'plan_starter',
          plan_id: 'starter',
          name: 'Starter',
          description: 'Perfect for small teams',
          price_monthly: 29,
          price_yearly: 290,
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
          price_monthly: 99,
          price_yearly: 990,
          features: ['Up to 25 users', 'Advanced compliance', '10,000 transactions/month'],
          max_users: 25,
          max_transactions: 10000,
          max_cases: 500
        }
      ];
      
      setPlans(mockPlans);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    fetchPlans();
  }, []);

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        plans,
        loading,
        error,
        fetchSubscription,
        fetchPlans
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};
