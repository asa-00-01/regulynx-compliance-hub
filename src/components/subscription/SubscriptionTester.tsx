
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSubscription } from '@/context/SubscriptionContext';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const SubscriptionTester = () => {
  const { subscriptionState, checkSubscription, refreshing } = useSubscription();
  const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState('');

  const runTest = async () => {
    setTestResult('testing');
    setTestMessage('Testing Stripe connection...');
    
    try {
      await checkSubscription();
      setTestResult('success');
      setTestMessage('Stripe integration is working correctly!');
    } catch (error) {
      setTestResult('error');
      setTestMessage(`Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusIcon = () => {
    switch (testResult) {
      case 'testing':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Stripe Integration Test
          {getStatusIcon()}
        </CardTitle>
        <CardDescription>
          Test your Stripe integration to ensure everything is working correctly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Subscription Status</p>
            <Badge variant={subscriptionState.subscribed ? 'default' : 'secondary'}>
              {subscriptionState.subscribed ? 'Active' : 'Inactive'}
            </Badge>
          </div>
          <div>
            <p className="text-sm font-medium">Plan</p>
            <p className="text-sm text-gray-600">
              {subscriptionState.subscription_tier || 'None'}
            </p>
          </div>
        </div>

        {testMessage && (
          <div className={`p-3 rounded-md ${
            testResult === 'success' ? 'bg-green-50 text-green-700' :
            testResult === 'error' ? 'bg-red-50 text-red-700' :
            'bg-blue-50 text-blue-700'
          }`}>
            {testMessage}
          </div>
        )}

        <div className="flex gap-2">
          <Button 
            onClick={runTest} 
            disabled={testResult === 'testing' || refreshing}
            variant="outline"
          >
            {testResult === 'testing' ? 'Testing...' : 'Test Connection'}
          </Button>
          <Button 
            onClick={() => window.open('/pricing', '_blank')}
            disabled={testResult === 'testing'}
          >
            View Pricing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionTester;
