
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useAuditLogging } from '@/hooks/useAuditLogging';

export const useSubscriptionActions = () => {
  const { user, session, isAuthenticated } = useAuth();
  const { logPayment, logError } = useAuditLogging();

  const createCheckout = useCallback(async (planId: string, billingType: 'monthly' | 'yearly' = 'monthly') => {
    if (!isAuthenticated || !user || !session?.access_token) {
      await logPayment('checkout_authentication_failed', {
        plan_id: planId,
        billing_type: billingType,
        reason: 'not_authenticated'
      }, false);
      toast.error('Please login to subscribe');
      return;
    }

    try {
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
        await logPayment('checkout_failed', {
          plan_id: planId,
          billing_type: billingType,
          user_id: user.id,
          error: error.message
        }, false);
        throw error;
      }

      await logPayment('checkout_session_created', {
        plan_id: planId,
        billing_type: billingType,
        user_id: user.id,
        checkout_url: data.url
      });

      window.open(data.url, '_blank');
    } catch (error: any) {
      await logError(error, 'checkout_creation', {
        plan_id: planId,
        billing_type: billingType,
        user_id: user?.id
      });
      toast.error(`Failed to create checkout session: ${error.message}`);
    }
  }, [isAuthenticated, user, session, logPayment, logError]);

  const openCustomerPortal = useCallback(async () => {
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

      window.open(data.url, '_blank');
    } catch (error: any) {
      await logError(error, 'customer_portal', { user_id: user?.id });
      toast.error(`Failed to open customer portal: ${error.message}`);
    }
  }, [isAuthenticated, user, session, logPayment, logError]);

  return {
    createCheckout,
    openCustomerPortal
  };
};
