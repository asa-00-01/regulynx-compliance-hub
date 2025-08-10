
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Activity,
  TrendingUp,
  AlertTriangle 
} from 'lucide-react';
import { usePlatformRoles } from '@/hooks/usePlatformRoles';

const PlatformDashboard: React.FC = () => {
  const { customers, customersLoading } = usePlatformRoles();

  const totalCustomers = customers?.length || 0;
  const activeCustomers = customers?.filter(c => c.subscription_tier !== 'inactive').length || 0;
  const totalUsers = customers?.reduce((acc, customer) => acc + (customer.settings?.userCount || 0), 0) || 0;
  const monthlyRevenue = customers?.reduce((acc, customer) => {
    const tierRevenue = {
      'basic': 99,
      'professional': 299,
      'enterprise': 999
    };
    return acc + (tierRevenue[customer.subscription_tier as keyof typeof tierRevenue] || 0);
  }, 0) || 0;

  const stats = [
    {
      title: 'Total Customers',
      value: totalCustomers,
      description: `${activeCustomers} active`,
      icon: Building2,
      trend: '+12%',
    },
    {
      title: 'Total Users',
      value: totalUsers,
      description: 'Across all customers',
      icon: Users,
      trend: '+8%',
    },
    {
      title: 'Monthly Revenue',
      value: `$${monthlyRevenue.toLocaleString()}`,
      description: 'Recurring revenue',
      icon: DollarSign,
      trend: '+15%',
    },
    {
      title: 'System Health',
      value: '99.9%',
      description: 'Uptime this month',
      icon: Activity,
      trend: 'Stable',
    },
  ];

  const alerts = [
    { type: 'warning', message: 'Customer XYZ Corp approaching user limit', time: '2 hours ago' },
    { type: 'info', message: 'System maintenance scheduled for tonight', time: '4 hours ago' },
    { type: 'success', message: 'New enterprise customer onboarded', time: '1 day ago' },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground">
          Monitor your SaaS platform performance and customer metrics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground">{stat.description}</p>
                <span className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Alerts</CardTitle>
            <CardDescription>System notifications and customer updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div key={index} className="flex items-start gap-3">
                  <AlertTriangle className={`h-4 w-4 mt-1 ${
                    alert.type === 'warning' ? 'text-yellow-500' :
                    alert.type === 'info' ? 'text-blue-500' : 'text-green-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.message}</p>
                    <p className="text-xs text-muted-foreground">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customer Growth */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Growth</CardTitle>
            <CardDescription>Monthly customer acquisition trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">This Month</span>
                <Badge variant="secondary">+3 customers</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Month</span>
                <Badge variant="secondary">+5 customers</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Average Monthly Growth</span>
                <Badge variant="secondary">+4.2 customers</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlatformDashboard;
