
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Zap, Crown, Building } from 'lucide-react';
import { useSubscription } from '@/context/SubscriptionContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Pricing = () => {
  const [isYearly, setIsYearly] = useState(false);
  const { plans, createCheckout, subscriptionState, plansLoading } = useSubscription();
  const { user } = useAuth();

  const handleSubscribe = (planId: string) => {
    if (!user) {
      toast.error('Please login to subscribe');
      return;
    }
    createCheckout(planId, isYearly ? 'yearly' : 'monthly');
  };

  const formatPrice = (priceInCents: number) => {
    return (priceInCents / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  };

  const getPlanIcon = (planId: string) => {
    switch (planId.toLowerCase()) {
      case 'starter':
        return <Zap className="h-6 w-6 text-blue-500" />;
      case 'professional':
      case 'pro':
        return <Crown className="h-6 w-6 text-purple-500" />;
      case 'enterprise':
        return <Building className="h-6 w-6 text-orange-500" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const isCurrentPlan = (planName: string) => {
    return subscriptionState.subscribed && 
           subscriptionState.subscription_tier?.toLowerCase() === planName.toLowerCase();
  };

  // Debug logging
  console.log('Pricing page - plans:', plans);
  console.log('Pricing page - plansLoading:', plansLoading);
  console.log('Pricing page - subscriptionState:', subscriptionState);

  // Fallback plans if no plans are available
  const fallbackPlans = [
    {
      id: 'fallback-1',
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
      id: 'fallback-2',
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
      id: 'fallback-3',
      plan_id: 'enterprise',
      name: 'Enterprise Plan',
      description: 'Enterprise-grade compliance platform',
      price_monthly: 299900,
      price_yearly: 2999900,
      features: ['aml_monitoring', 'kyc_verification', 'sanctions_screening', 'case_management', 'advanced_analytics', 'custom_integrations', 'dedicated_support'],
      max_users: -1,
      max_transactions: -1,
      max_cases: -1
    }
  ];

  const displayPlans = plans && plans.length > 0 ? plans : fallbackPlans;

  if (plansLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading pricing plans...</div>
      </div>
    );
  }

  if (!plans || plans.length === 0) {
    console.log('⚠️ No plans available, using fallback plan');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Compliance Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Scale your compliance operations with our flexible pricing
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Label htmlFor="billing-toggle" className="text-sm">Monthly</Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="billing-toggle" className="text-sm">
              Yearly
              <Badge variant="secondary" className="ml-2">Save 20%</Badge>
            </Label>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {displayPlans.map((plan) => {
            const price = isYearly ? plan.price_yearly : plan.price_monthly;
            const displayPrice = isYearly ? price / 12 : price;
            
            return (
                             <Card 
                 key={plan.id} 
                 className={`relative ${
                   plan.plan_id.toLowerCase() === 'professional' || plan.plan_id.toLowerCase() === 'pro'
                     ? 'border-2 border-purple-500 shadow-xl scale-105' 
                     : plan.plan_id.toLowerCase() === 'enterprise'
                     ? 'border-2 border-orange-500 shadow-xl'
                     : 'border border-gray-200'
                 }`}
               >
                 {(plan.plan_id.toLowerCase() === 'professional' || plan.plan_id.toLowerCase() === 'pro') && (
                   <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                     <Badge className="bg-purple-500 text-white px-4 py-1">
                       Most Popular
                     </Badge>
                   </div>
                 )}
                 {plan.plan_id.toLowerCase() === 'enterprise' && (
                   <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                     <Badge className="bg-orange-500 text-white px-4 py-1">
                       Enterprise
                     </Badge>
                   </div>
                 )}

                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    {getPlanIcon(plan.plan_id)}
                  </div>
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                    {isCurrentPlan(plan.name) && (
                      <Badge variant="secondary" className="ml-2">Current</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">
                      {formatPrice(displayPrice)}
                    </span>
                    <span className="text-gray-500 text-sm">/month</span>
                    {isYearly && (
                      <div className="text-sm text-green-600">
                        Billed annually ({formatPrice(price)}/year)
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                    
                    <li className="flex items-start pt-2 border-t">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        {plan.max_users === -1 ? 'Unlimited users' : `Up to ${plan.max_users} users`}
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        {plan.max_transactions === -1 
                          ? 'Unlimited transactions' 
                          : `${plan.max_transactions?.toLocaleString()} transactions/month`
                        }
                      </span>
                    </li>
                    
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        {plan.max_cases === -1 
                          ? 'Unlimited cases' 
                          : `${plan.max_cases} cases/month`
                        }
                      </span>
                    </li>
                  </ul>
                </CardContent>

                <CardFooter>
                                     <Button 
                     onClick={() => handleSubscribe(plan.plan_id)}
                     className="w-full"
                     variant={
                       (plan.plan_id.toLowerCase() === 'professional' || plan.plan_id.toLowerCase() === 'pro') 
                         ? 'default' 
                         : plan.plan_id.toLowerCase() === 'enterprise'
                         ? 'default'
                         : 'outline'
                     }
                     disabled={isCurrentPlan(plan.name)}
                   >
                    {isCurrentPlan(plan.name) ? 'Current Plan' : `Get ${plan.name}`}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* FAQ or Additional Info */}
        <div className="text-center">
          <p className="text-gray-600">
            Need a custom solution? <Button variant="link" className="p-0">Contact our sales team</Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
