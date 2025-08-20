import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Activity,
  TrendingUp,
  AlertTriangle,
  Shield,
  Settings,
  BarChart3,
  Zap,
  Globe,
  Database,
  Cpu,
  HardDrive,
  Network,
  Clock,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { usePlatformRoles } from '@/hooks/usePlatformRoles';
import { useAuth } from '@/context/AuthContext';
import { config } from '@/config/environment';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  activeConnections: number;
}

interface PlatformStats {
  totalCustomers: number;
  activeCustomers: number;
  totalUsers: number;
  monthlyRevenue: number;
  systemHealth: string;
  alerts: number;
  performance: number;
}

const PlatformConsole: React.FC = () => {
  const navigate = useNavigate();
  const { customers, customersLoading } = usePlatformRoles();
  const { user } = useAuth();
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 62,
    disk: 78,
    network: 23,
    uptime: 99.9,
    activeConnections: 1247
  });
  const [platformStats, setPlatformStats] = useState<PlatformStats>({
    totalCustomers: 0,
    activeCustomers: 0,
    totalUsers: 0,
    monthlyRevenue: 0,
    systemHealth: 'Healthy',
    alerts: 0,
    performance: 98.5
  });

  useEffect(() => {
    if (customers) {
      const totalCustomers = customers.length;
      const activeCustomers = customers.filter(c => c.subscription_tier !== 'inactive').length;
      const totalUsers = customers.reduce((acc, customer) => acc + (customer.settings?.userCount || 0), 0);
      const monthlyRevenue = customers.reduce((acc, customer) => {
        const tierRevenue = {
          'basic': 99,
          'professional': 299,
          'enterprise': 999
        };
        return acc + (tierRevenue[customer.subscription_tier as keyof typeof tierRevenue] || 0);
      }, 0);

      setPlatformStats({
        totalCustomers,
        activeCustomers,
        totalUsers,
        monthlyRevenue,
        systemHealth: 'Healthy',
        alerts: 2,
        performance: 98.5
      });
    }
  }, [customers]);

  const getHealthColor = (health: string) => {
    switch (health.toLowerCase()) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceColor = (performance: number) => {
    if (performance >= 95) return 'text-green-600';
    if (performance >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const quickActions = [
    {
      title: 'Add Customer',
      description: 'Create new customer organization',
      icon: Building2,
      action: () => navigate('/platform/management'),
      color: 'bg-blue-500'
    },
    {
      title: 'System Health',
      description: 'Check system status',
      icon: Activity,
      action: () => navigate('/platform/system-health'),
      color: 'bg-green-500'
    },
    {
      title: 'User Management',
      description: 'Manage platform users',
      icon: Users,
      action: () => navigate('/platform/users'),
      color: 'bg-purple-500'
    },
    {
      title: 'Billing Overview',
      description: 'View revenue and billing',
      icon: DollarSign,
      action: () => navigate('/platform/billing'),
      color: 'bg-orange-500'
    }
  ];

  const recentActivity = [
    {
      type: 'customer',
      message: 'New customer "Acme Corp" registered',
      time: '2 minutes ago',
      status: 'success'
    },
    {
      type: 'system',
      message: 'System backup completed successfully',
      time: '15 minutes ago',
      status: 'success'
    },
    {
      type: 'alert',
      message: 'High CPU usage detected on server-01',
      time: '1 hour ago',
      status: 'warning'
    },
    {
      type: 'billing',
      message: 'Monthly invoice generated for 15 customers',
      time: '2 hours ago',
      status: 'success'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight">Platform Console</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'Administrator'}. Here's what's happening with your platform.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={getHealthColor(platformStats.systemHealth)}>
            <Activity className="h-3 w-3 mr-1" />
            {platformStats.systemHealth}
          </Badge>
          <Badge variant="outline" className={getPerformanceColor(platformStats.performance)}>
            <Zap className="h-3 w-3 mr-1" />
            {platformStats.performance}% Performance
          </Badge>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {platformStats.activeCustomers} active customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${platformStats.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +15% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.alerts}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 w-full">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common platform management tasks
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start"
                onClick={action.action}
              >
                <div className={`w-2 h-2 rounded-full ${action.color} mr-3`} />
                <div className="flex flex-col items-start">
                  <span className="font-medium">{action.title}</span>
                  <span className="text-xs text-muted-foreground">{action.description}</span>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* System Metrics */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              System Metrics
            </CardTitle>
            <CardDescription>
              Real-time system performance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>CPU Usage</span>
                <span>{systemMetrics.cpu}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${systemMetrics.cpu}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Memory Usage</span>
                <span>{systemMetrics.memory}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${systemMetrics.memory}%` }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Disk Usage</span>
                <span>{systemMetrics.disk}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${systemMetrics.disk}%` }}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Uptime</div>
                <div className="font-medium">{systemMetrics.uptime}%</div>
              </div>
              <div>
                <div className="text-muted-foreground">Active Connections</div>
                <div className="font-medium">{systemMetrics.activeConnections}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest platform events
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-green-500' : 
                  activity.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{activity.message}</div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Management</CardTitle>
          <CardDescription>
            Comprehensive platform administration and monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="customers">Customers</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Platform Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Database</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>API Services</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Authentication</span>
                      <Badge variant="outline" className="text-green-600">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Online
                      </Badge>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Environment Info</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Environment:</span>
                      <span className="font-medium">{config.app.environment}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Version:</span>
                      <span className="font-medium">{config.app.version}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domain:</span>
                      <span className="font-medium">{config.app.domain}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="customers" className="space-y-4">
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Customer Management</h3>
                <p className="text-muted-foreground">
                  Manage customer organizations, subscriptions, and user access
                </p>
                <Button className="mt-4" onClick={() => navigate('/platform/management')}>
                  View Customer Management
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="text-center py-8">
                <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">System Health</h3>
                <p className="text-muted-foreground">
                  Monitor system performance, logs, and infrastructure
                </p>
                <Button className="mt-4" onClick={() => navigate('/platform/system-health')}>
                  View System Health
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Billing & Revenue</h3>
                <p className="text-muted-foreground">
                  Track revenue, manage subscriptions, and handle billing
                </p>
                <Button className="mt-4" onClick={() => navigate('/platform/billing')}>
                  View Billing Dashboard
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Security Center</h3>
                <p className="text-muted-foreground">
                  Monitor security events, audit logs, and access controls
                </p>
                <Button className="mt-4" onClick={() => navigate('/platform/security')}>
                  View Security Center
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Platform Analytics</h3>
                <p className="text-muted-foreground">
                  View detailed analytics, trends, and performance metrics
                </p>
                <Button className="mt-4" onClick={() => navigate('/platform/analytics')}>
                  View Analytics
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformConsole;
