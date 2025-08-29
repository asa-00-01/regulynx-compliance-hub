import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { config } from '@/config/environment';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  CreditCard,
  Receipt,
  Users,
  Building2,
  Calendar,
  Download,
  Upload,
  Filter,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  Zap,
  Target,
  Award,
  Edit,
  Eye,
  Settings
} from 'lucide-react';
import { usePlatformRoles } from '@/hooks/usePlatformRoles';

interface BillingStats {
  monthlyRevenue: number;
  annualRevenue: number;
  totalCustomers: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  growthRate: number;
  outstandingInvoices: number;
}

interface Subscription {
  id: string;
  customerId: string;
  customerName: string;
  plan: string;
  amount: number;
  status: string;
  startDate: string;
  endDate: string;
  nextBilling: string;
  autoRenew: boolean;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

interface Invoice {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  dueDate: string;
  issuedDate: string;
  paidDate?: string;
  items: InvoiceItem[];
}

const BillingManagementConsole: React.FC = () => {
  const navigate = useNavigate();
  const { customers } = usePlatformRoles();
  const [billingStats, setBillingStats] = useState<BillingStats>({
    monthlyRevenue: 0,
    annualRevenue: 0,
    totalCustomers: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    averageRevenuePerUser: 0,
    growthRate: 0,
    outstandingInvoices: 0
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (customers) {
      const monthlyRevenue = customers.reduce((acc, customer) => {
        const tierRevenue = {
          'basic': 99,
          'professional': 299,
          'enterprise': 999
        };
        return acc + (tierRevenue[customer.subscription_tier as keyof typeof tierRevenue] || 0);
      }, 0);

      const annualRevenue = monthlyRevenue * 12;
      const totalCustomers = customers.length;
      const activeSubscriptions = customers.filter(c => c.subscription_tier !== 'inactive').length;
      const churnRate = config.features.useMockData ? 2.5 : 0; // Mock data when enabled
      const averageRevenuePerUser = monthlyRevenue / totalCustomers;
      const growthRate = config.features.useMockData ? 15.2 : 0; // Mock data when enabled
      const outstandingInvoices = config.features.useMockData ? 3 : 0; // Mock data when enabled

      setBillingStats({
        monthlyRevenue,
        annualRevenue,
        totalCustomers,
        activeSubscriptions,
        churnRate,
        averageRevenuePerUser,
        growthRate,
        outstandingInvoices
      });

      // Mock subscriptions data
      const mockSubscriptions: Subscription[] = customers.map((customer, index) => ({
        id: `sub_${index}`,
        customerId: customer.id,
        customerName: customer.name,
        plan: customer.subscription_tier,
        amount: {
          'basic': 99,
          'professional': 299,
          'enterprise': 999
        }[customer.subscription_tier] || 0,
        status: 'active',
        startDate: customer.created_at,
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        autoRenew: true
      }));

      setSubscriptions(mockSubscriptions);

      // Mock invoices data
      const mockInvoices: Invoice[] = customers.map((customer, index) => ({
        id: `inv_${index}`,
        customerId: customer.id,
        customerName: customer.name,
        amount: {
          'basic': 99,
          'professional': 299,
          'enterprise': 999
        }[customer.subscription_tier] || 0,
        status: index % 5 === 0 ? 'pending' : 'paid',
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        issuedDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        paidDate: index % 5 === 0 ? undefined : new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        items: [
          {
            description: `${customer.subscription_tier} Plan`,
            quantity: 1,
            unitPrice: {
              'basic': 99,
              'professional': 299,
              'enterprise': 999
            }[customer.subscription_tier] || 0
          }
        ]
      }));

      setInvoices(mockInvoices);
    }
  }, [customers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-blue-100 text-blue-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const revenueData = config.features.useMockData ? [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ] : [];

  const quickActions = [
    {
      title: 'Generate Invoice',
      description: 'Create new invoice for customer',
      icon: Receipt,
      action: () => {
        // TODO: Implement invoice generation
        console.log('Generate invoice - opening invoice creation dialog');
        // This would typically open a modal or navigate to an invoice creation page
        alert('Invoice generation feature coming soon!');
      },
      color: 'bg-blue-500'
    },
    {
      title: 'Process Payment',
      description: 'Process customer payments',
      icon: CreditCard,
      action: () => {
        // TODO: Implement payment processing
        console.log('Process payment - opening payment processing interface');
        alert('Payment processing feature coming soon!');
      },
      color: 'bg-green-500'
    },
    {
      title: 'Export Reports',
      description: 'Export billing reports',
      icon: Download,
      action: () => {
        // TODO: Implement report export functionality
        console.log('Export reports - generating billing report');
        const reportData = {
          totalRevenue: billingStats.monthlyRevenue, // Assuming monthlyRevenue is the total for this report
          totalCustomers: billingStats.totalCustomers,
          monthlyGrowth: billingStats.growthRate, // Assuming growthRate is the monthly growth
          date: new Date().toISOString()
        };
        
        const reportContent = 'data:text/json;charset=utf-8,' + JSON.stringify(reportData, null, 2);
        const encodedUri = encodeURI(reportContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'billing_report.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      color: 'bg-purple-500'
    },
    {
      title: 'Update Plans',
      description: 'Manage subscription plans',
      icon: Settings,
      action: () => {
        // TODO: Implement plan management
        console.log('Update plans - opening plan management interface');
        alert('Plan management feature coming soon!');
      },
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight">Billing & Revenue</h1>
          <p className="text-muted-foreground">
            Manage subscriptions, invoices, and revenue tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingStats.monthlyRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +{billingStats.growthRate}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Revenue</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${billingStats.annualRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +12.5% from last year
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingStats.activeSubscriptions}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <Building2 className="h-3 w-3 mr-1" />
              {billingStats.totalCustomers} total customers
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billingStats.churnRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
              Below industry average
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common billing and revenue tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start"
                onClick={action.action}
              >
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>
            Monthly revenue performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-end justify-between space-x-2">
            {revenueData.map((data, index) => (
              <div key={index} className="flex flex-col items-center space-y-2">
                <div className="text-xs text-muted-foreground">${(data.revenue / 1000).toFixed(0)}k</div>
                <div 
                  className="w-8 bg-blue-500 rounded-t"
                  style={{ height: `${(data.revenue / 67000) * 200}px` }}
                />
                <div className="text-xs text-muted-foreground">{data.month}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Billing Management</CardTitle>
          <CardDescription>
            Comprehensive billing and subscription management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="subscriptions" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              <TabsTrigger value="invoices">Invoices</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="subscriptions" className="space-y-4">
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{subscription.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          Next billing: {new Date(subscription.nextBilling).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getPlanColor(subscription.plan)}>
                            {subscription.plan}
                          </Badge>
                          <Badge className={getStatusColor(subscription.status)}>
                            {subscription.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">${subscription.amount}/month</div>
                        <div className="text-sm text-muted-foreground">
                          {subscription.autoRenew ? 'Auto-renew' : 'Manual renewal'}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implement edit subscription functionality
                            console.log('Edit subscription:', subscription.id);
                            alert(`Editing subscription for ${subscription.customerName}`);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implement view invoice functionality
                            console.log('View invoice for subscription:', subscription.id);
                            alert(`Viewing invoice for ${subscription.customerName}`);
                          }}
                        >
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="invoices" className="space-y-4">
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{invoice.customerName}</div>
                        <div className="text-sm text-muted-foreground">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(invoice.status)}>
                            {invoice.status}
                          </Badge>
                          <Badge variant="outline">
                            #{invoice.id}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">${invoice.amount}</div>
                        <div className="text-sm text-muted-foreground">
                          {invoice.paidDate ? `Paid: ${new Date(invoice.paidDate).toLocaleDateString()}` : 'Unpaid'}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implement view invoice details functionality
                            console.log('View invoice details:', invoice.id);
                            alert(`Viewing invoice details for ${invoice.customerName}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implement download invoice functionality
                            console.log('Download invoice:', invoice.id);
                            const invoiceData = {
                              id: invoice.id,
                              customerName: invoice.customerName,
                              amount: invoice.amount,
                              status: invoice.status,
                              dueDate: invoice.dueDate,
                              items: invoice.items
                            };
                            
                            const invoiceContent = 'data:text/json;charset=utf-8,' + JSON.stringify(invoiceData, null, 2);
                            const encodedUri = encodeURI(invoiceContent);
                            const link = document.createElement('a');
                            link.setAttribute('href', encodedUri);
                            link.setAttribute('download', `invoice_${invoice.id}.json`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue by Plan</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Enterprise</span>
                        <span className="font-medium">$45,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Professional</span>
                        <span className="font-medium">$28,000</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Basic</span>
                        <span className="font-medium">$12,000</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Paid</span>
                        <span className="font-medium text-green-600">85%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pending</span>
                        <span className="font-medium text-yellow-600">12%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Overdue</span>
                        <span className="font-medium text-red-600">3%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Billing Settings</h3>
                <p className="text-muted-foreground">
                  Configure billing preferences, tax settings, and payment methods
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    // TODO: Implement billing settings configuration
                    console.log('Configure billing settings');
                    alert('Billing settings configuration interface coming soon!');
                  }}
                >
                  Configure Settings
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingManagementConsole;
