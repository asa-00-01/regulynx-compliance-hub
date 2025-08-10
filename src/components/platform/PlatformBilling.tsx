
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DollarSign, TrendingUp, CreditCard, Download } from 'lucide-react';

const PlatformBilling: React.FC = () => {
  const revenueData = [
    { month: 'Jan', revenue: 45000, customers: 15 },
    { month: 'Feb', revenue: 52000, customers: 17 },
    { month: 'Mar', revenue: 48000, customers: 16 },
    { month: 'Apr', revenue: 61000, customers: 20 },
    { month: 'May', revenue: 67000, customers: 22 },
    { month: 'Jun', revenue: 74000, customers: 25 },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Billing & Revenue</h1>
          <p className="text-muted-foreground">
            Track platform revenue and customer billing metrics
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$74,000</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+10.4%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Revenue Per Customer</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$2,960</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+5.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">-0.3%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Subscription Tier */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Subscription Tier</CardTitle>
          <CardDescription>Monthly recurring revenue breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { tier: 'Enterprise', revenue: 45000, customers: 5, color: 'bg-blue-500' },
              { tier: 'Professional', revenue: 20000, customers: 12, color: 'bg-green-500' },
              { tier: 'Basic', revenue: 9000, customers: 8, color: 'bg-yellow-500' },
            ].map((tier) => (
              <div key={tier.tier} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded ${tier.color}`} />
                  <div>
                    <p className="font-medium">{tier.tier}</p>
                    <p className="text-sm text-muted-foreground">{tier.customers} customers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">${tier.revenue.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Monthly</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest customer payments and billing events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { customer: 'Acme Corp', amount: 999, date: '2024-01-15', status: 'paid' },
              { customer: 'TechStart Inc', amount: 299, date: '2024-01-14', status: 'paid' },
              { customer: 'Global Solutions', amount: 999, date: '2024-01-13', status: 'pending' },
              { customer: 'Innovation Labs', amount: 99, date: '2024-01-12', status: 'failed' },
            ].map((transaction, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{transaction.customer}</p>
                  <p className="text-sm text-muted-foreground">{transaction.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-medium">${transaction.amount}</p>
                  <Badge variant={
                    transaction.status === 'paid' ? 'secondary' :
                    transaction.status === 'pending' ? 'outline' : 'destructive'
                  }>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformBilling;
