import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useAuditLogging } from '@/hooks/useAuditLogging';
import { config } from '@/config/environment';

interface SubscriptionState {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  loading: boolean;
}

interface PricingPlan {
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

interface SubscriptionContextType {
  subscriptionState: SubscriptionState;
  checkSubscription: () => Promise<void>;
  createCheckout: (planId: string, billingType?: 'monthly' | 'yearly') => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  refreshing: boolean;
  plans: PricingPlan[];
  plansLoading: boolean;
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
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Fetch plans from database
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        console.log('🔄 Starting to fetch plans...');
        console.log('🔧 Config features.useMockData:', config.features.useMockData);
        setPlansLoading(true);
        
        // Always start with mock data as fallback
        const mockPlans: PricingPlan[] = [
          {
            id: '1',
            plan_id: 'starter',
            name: 'Starter Plan',
            description: 'Essential compliance tools for small teams',
            price_monthly: 29900,
            price_yearly: 299900,
            features: ['basic_aml_monitoring', 'kyc_verification', 'basic_reporting'],
            max_users: 10,
            max_transactions: 1000,
            max_cases: 100
          },
          {
            id: '2',
            plan_id: 'pro',
            name: 'Professional Plan',
            description: 'Full compliance suite for growing organizations',
            price_monthly: 99900,
            price_yearly: 999900,
            features: ['aml_monitoring', 'kyc_verification', 'sanctions_screening', 'case_management', 'advanced_analytics'],
            max_users: 50,
            max_transactions: 10000,
            max_cases: 1000
          },
          {
            id: '3',
            plan_id: 'enterprise',
            name: 'Enterprise Plan',
            description: 'Enterprise-grade compliance platform',
            price_monthly: 299900,
            price_yearly: 2999900,
            features: ['aml_monitoring', 'kyc_verification', 'sanctions_screening', 'case_management', 'advanced_analytics', 'custom_integrations', 'dedicated_support'],
            max_users: -1, // Unlimited
            max_transactions: -1, // Unlimited
            max_cases: -1 // Unlimited
          }
        ];
        
        if (config.features.useMockData) {
          console.log('🎭 Using mock subscription plans');
          console.log('✅ Mock plans set:', mockPlans);
          setPlans(mockPlans);
        } else {
          console.log('📊 Fetching subscription plans from database');
          try {
            const { data, error } = await supabase
              .from('subscription_plans')
              .select('*')
              .eq('is_active', true)
              .order('price_monthly', { ascending: true });

            if (error) {
              console.error('❌ Error fetching plans:', error);
              console.log('🔄 Using fallback plans:', mockPlans);
              setPlans(mockPlans);
            } else {
              console.log('✅ Plans fetched successfully from database:', data);
              if (data && data.length > 0) {
                // Transform database data to match PricingPlan interface
                const transformedPlans: PricingPlan[] = data.map(plan => ({
                  id: plan.id,
                  plan_id: plan.plan_id,
                  name: plan.name,
                  description: plan.description,
                  price_monthly: plan.price_monthly,
                  price_yearly: plan.price_yearly,
                  features: Array.isArray(plan.features) ? plan.features : [],
                  max_users: plan.max_users,
                  max_transactions: plan.max_transactions,
                  max_cases: plan.max_cases
                }));
                console.log('✅ Transformed plans:', transformedPlans);
                setPlans(transformedPlans);
              } else {
                console.log('📝 No plans found in database, using mock plans');
                setPlans(mockPlans);
              }
            }
          } catch (dbError) {
            console.error('❌ Database fetch error:', dbError);
            console.log('🔄 Using fallback plans due to database error:', mockPlans);
            setPlans(mockPlans);
          }
        }
      } catch (error) {
        console.error('❌ Error in fetchPlans:', error);
        // Fallback to mock data
        const fallbackPlans: PricingPlan[] = [
          {
            id: '1',
            plan_id: 'pro',
            name: 'Professional Plan',
            description: 'Full compliance suite',
            price_monthly: 99900,
            price_yearly: 999900,
            features: ['aml_monitoring', 'kyc_verification', 'sanctions_screening', 'case_management'],
            max_users: 50,
            max_transactions: 10000,
            max_cases: 1000
          }
        ];
        console.log('🔄 Using fallback plans due to error:', fallbackPlans);
        setPlans(fallbackPlans);
      } finally {
        console.log('🏁 Plans loading finished');
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const checkSubscription = async () => {
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
        plans,
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
