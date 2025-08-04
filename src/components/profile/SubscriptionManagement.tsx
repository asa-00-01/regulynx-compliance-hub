
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, CreditCard, Settings, TrendingUp } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { format } from 'date-fns';

const SubscriptionManagement = () => {
  const { subscriptionState, openCustomerPortal, checkSubscription, refreshing } = useSubscription();

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getStatusColor = (subscribed: boolean) => {
    return subscribed ? 'bg-green-500' : 'bg-gray-400';
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
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <CreditCard className="mr-2 h-5 w-5" />
              Subscription Status
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={checkSubscription}
              disabled={refreshing}
            >
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </Button>
          </CardTitle>
          <CardDescription>Manage your subscription and billing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <Badge 
                  className={getStatusColor(subscriptionState.subscribed)}
                >
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
                  <div className="flex items-center text-sm text-gray-600">
                    <Settings className="mr-2 h-4 w-4" />
                    Plan
                  </div>
                  <p className="font-medium">
                    {subscriptionState.subscription_tier || 'Unknown'} Plan
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={openCustomerPortal} className="flex-1">
                  Manage Subscription
                </Button>
                <Button variant="outline" onClick={() => window.open('/pricing', '_blank')}>
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
              <Button onClick={() => window.open('/pricing', '_blank')}>
                View Plans
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Overview (if subscribed) */}
      {subscriptionState.subscribed && (
        <Card>
          <CardHeader>
            <CardTitle>Usage Overview</CardTitle>
            <CardDescription>Your usage for the current billing period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>API Calls</span>
                <span>1,247 / 10,000</span>
              </div>
              <Progress value={12.47} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Document Processing</span>
                <span>89 / 500</span>
              </div>
              <Progress value={17.8} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Cases</span>
                <span>23 / 100</span>
              </div>
              <Progress value={23} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SubscriptionManagement;
