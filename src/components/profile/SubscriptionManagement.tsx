
import React from 'react';
import { CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSubscription } from '@/context/SubscriptionContext';
import SubscriptionStatusCard from '@/components/subscription/SubscriptionStatusCard';
import UsageOverviewCard from '@/components/subscription/UsageOverviewCard';

const SubscriptionManagement = () => {
  const { subscriptionState, refreshing, checkSubscription, createCheckout, openCustomerPortal } = useSubscription();

  const handleUpgradePlan = () => {
    window.open('/pricing', '_blank');
  };

  if (subscriptionState.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CreditCard className="mr-2 h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SubscriptionStatusCard
        subscriptionState={subscriptionState}
        refreshing={refreshing}
        onRefresh={checkSubscription}
        onManageSubscription={openCustomerPortal}
        onUpgradePlan={handleUpgradePlan}
      />
      
      <UsageOverviewCard isSubscribed={subscriptionState.subscribed} />
    </div>
  );
};

export default SubscriptionManagement;
