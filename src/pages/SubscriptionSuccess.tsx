
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { toast } from 'sonner';

const SubscriptionSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { checkSubscription } = useSubscription();

  useEffect(() => {
    // Refresh subscription status after successful payment
    const refreshSubscription = async () => {
      if (sessionId) {
        // Wait a moment for Stripe to process
        setTimeout(async () => {
          await checkSubscription();
          toast.success('Subscription activated successfully!');
        }, 2000);
      }
    };

    refreshSubscription();
  }, [sessionId, checkSubscription]);

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
              onClick={() => navigate('/profile')} 
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
