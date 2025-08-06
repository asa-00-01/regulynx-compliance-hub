
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface SubscriptionState {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
  loading: boolean;
}

interface SubscriptionStatusCardProps {
  subscriptionState: SubscriptionState;
  refreshing: boolean;
  onRefresh: () => void;
  onManageSubscription: () => void;
  onUpgradePlan: () => void;
}

const SubscriptionStatusCard = ({
  subscriptionState,
  refreshing,
  onRefresh,
  onManageSubscription,
  onUpgradePlan
}: SubscriptionStatusCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusColor = (subscribed: boolean) => {
    return subscribed ? 'bg-green-500' : 'bg-gray-400';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Subscription Status</span>
          <Button 
            variant="outline" 
            size="sm"
            onClick={onRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Badge className={getStatusColor(subscriptionState.subscribed)}>
                {subscriptionState.subscribed ? 'Active' : 'Inactive'}
              </Badge>
              {subscriptionState.subscription_tier && (
                <Badge variant="secondary">
                  {subscriptionState.subscription_tier} Plan
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              {subscriptionState.subscribed 
                ? `Your subscription is active${subscriptionState.subscription_end 
                    ? ` until ${formatDate(subscriptionState.subscription_end)}` 
                    : ''}`
                : 'No active subscription'
              }
            </p>
          </div>
          <TrendingUp className={`h-8 w-8 ${
            subscriptionState.subscribed ? 'text-green-500' : 'text-gray-400'
          }`} />
        </div>

        {subscriptionState.subscribed && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="mr-2 h-4 w-4" />
                  Next billing date
                </div>
                <p className="font-medium">
                  {formatDate(subscriptionState.subscription_end)}
                </p>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Plan</p>
                <p className="font-medium">
                  {subscriptionState.subscription_tier || 'Unknown'} Plan
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={onManageSubscription} className="flex-1">
                Manage Subscription
              </Button>
              <Button variant="outline" onClick={onUpgradePlan}>
                Upgrade Plan
              </Button>
            </div>
          </>
        )}

        {!subscriptionState.subscribed && (
          <div className="text-center py-4">
            <p className="text-gray-600 mb-4">
              Subscribe to unlock premium features and full access to Regulynx.
            </p>
            <Button onClick={onUpgradePlan}>
              View Plans
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionStatusCard;
