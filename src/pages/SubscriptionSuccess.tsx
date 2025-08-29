
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { toast } from 'sonner';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { checkSubscription, subscriptionState } = useSubscription();
  const [hasRefreshed, setHasRefreshed] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Refresh subscription status after successful payment
    const refreshSubscription = async () => {
      if (sessionId && !hasRefreshed) {
        setHasRefreshed(true);
        setIsRefreshing(true);
        
        try {
          // Wait a moment for Stripe to process
          setTimeout(async () => {
            try {
              console.log('🔄 Refreshing subscription status after successful payment...');
              await checkSubscription();
              toast.success('Subscription activated successfully!');
            } catch (error) {
              console.warn('⚠️ Subscription refresh failed, but continuing:', error);
              toast.error('Subscription refresh failed, but your payment was successful');
            } finally {
              setIsRefreshing(false);
            }
          }, 2000);
        } catch (error) {
          console.warn('⚠️ Error in subscription refresh:', error);
          setIsRefreshing(false);
        }
      }
    };

    refreshSubscription();
  }, [sessionId, checkSubscription, hasRefreshed]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await checkSubscription();
      toast.success('Subscription status refreshed!');
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      toast.error('Failed to refresh subscription status');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-green-700">
            Subscription Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Thank you for subscribing to Regulynx! Your account has been upgraded and you now have access to all premium features.
          </p>
          
          {/* Subscription Status Display */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Subscription Status:</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="h-6 px-2"
              >
                {isRefreshing ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            </div>
            <div className="text-left">
              <p className="text-sm text-gray-600">
                Status: <span className={`font-medium ${subscriptionState.subscribed ? 'text-green-600' : 'text-gray-500'}`}>
                  {subscriptionState.subscribed ? 'Active' : 'Checking...'}
                </span>
              </p>
              {subscriptionState.subscription_tier && (
                <p className="text-sm text-gray-600">
                  Plan: <span className="font-medium">{subscriptionState.subscription_tier}</span>
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">
              📧 A confirmation email has been sent to your inbox with your subscription details.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Button 
              onClick={() => navigate('/')} 
              className="w-full"
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/profile?tab=subscription')} 
              className="w-full"
            >
              View Subscription Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionSuccess;
