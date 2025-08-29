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
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Download,
  Filter,
  Search,
  Plus,
  Eye,
  Settings,
  PieChart,
  LineChart,
  Target,
  Award,
  Globe,
  Database,
  Server,
  Network,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  FileText,
  Clipboard,
  RefreshCw,
  BarChart,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  ScatterChart,
  AreaChart
} from 'lucide-react';
import { usePlatformRoles } from '@/hooks/usePlatformRoles';

interface AnalyticsStats {
  totalRevenue: number;
  monthlyGrowth: number;
  activeUsers: number;
  userGrowth: number;
  conversionRate: number;
  churnRate: number;
  averageSessionDuration: number;
  pageViews: number;
}

interface Report {
  id: string;
  name: string;
  type: string;
  status: 'completed' | 'processing' | 'failed';
  createdAt: string;
  lastRun: string;
  nextRun: string;
  format: 'pdf' | 'csv' | 'excel';
  size: string;
}

const AnalyticsReportingConsole: React.FC = () => {
  const navigate = useNavigate();
  const { customers } = usePlatformRoles();
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats>({
    totalRevenue: 0,
    monthlyGrowth: 0,
    activeUsers: 0,
    userGrowth: 0,
    conversionRate: 0,
    churnRate: 0,
    averageSessionDuration: 0,
    pageViews: 0
  });

  const [reports, setReports] = useState<Report[]>(config.features.useMockData ? [
    {
      id: 'rep_001',
      name: 'Monthly Revenue Report',
      type: 'Revenue',
      status: 'completed',
      createdAt: '2024-01-01',
      lastRun: '2024-01-20',
      nextRun: '2024-02-01',
      format: 'pdf',
      size: '2.3 MB'
    },
    {
      id: 'rep_002',
      name: 'User Activity Report',
      type: 'User Analytics',
      status: 'completed',
      createdAt: '2024-01-01',
      lastRun: '2024-01-19',
      nextRun: '2024-01-26',
      format: 'csv',
      size: '1.8 MB'
    },
    {
      id: 'rep_003',
      name: 'Customer Churn Analysis',
      type: 'Customer Analytics',
      status: 'processing',
      createdAt: '2024-01-20',
      lastRun: '2024-01-20',
      nextRun: '2024-01-27',
      format: 'excel',
      size: 'Processing...'
    }
  ] : []);

  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedMetric, setSelectedMetric] = useState('revenue');

  useEffect(() => {
    if (customers) {
      const totalRevenue = customers.reduce((acc, customer) => {
        const tierRevenue = {
          'basic': 99,
          'professional': 299,
          'enterprise': 999
        };
        return acc + (tierRevenue[customer.subscription_tier as keyof typeof tierRevenue] || 0);
      }, 0);

      const activeUsers = customers.reduce((acc, customer) => acc + (customer.settings?.userCount || 0), 0);

      setAnalyticsStats({
        totalRevenue: totalRevenue * 12, // Annual revenue
        monthlyGrowth: config.features.useMockData ? 15.2 : 0,
        activeUsers,
        userGrowth: config.features.useMockData ? 8.5 : 0,
        conversionRate: config.features.useMockData ? 3.2 : 0,
        churnRate: config.features.useMockData ? 2.5 : 0,
        averageSessionDuration: config.features.useMockData ? 12.5 : 0,
        pageViews: config.features.useMockData ? 45000 : 0
      });
    }
  }, [customers]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf': return <FileText className="h-4 w-4" />;
      case 'csv': return <Clipboard className="h-4 w-4" />;
      case 'excel': return <BarChart className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const quickActions = [
    {
      title: 'Generate Report',
      description: 'Create custom analytics report',
      icon: Plus,
      action: () => {
        // TODO: Implement report generation functionality
        console.log('Generate report - opening report builder');
        alert('Report builder interface coming soon!');
      },
      color: 'bg-blue-500'
    },
    {
      title: 'Export Data',
      description: 'Export analytics data',
      icon: Download,
      action: () => {
        // TODO: Implement data export functionality
        console.log('Export data - generating analytics export');
        const exportData = {
          analyticsStats: analyticsStats,
          reports: reports,
          exportDate: new Date().toISOString(),
          format: 'json'
        };
        
        const exportContent = 'data:text/json;charset=utf-8,' + JSON.stringify(exportData, null, 2);
        const encodedUri = encodeURI(exportContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'analytics_export.json');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      color: 'bg-green-500'
    },
    {
      title: 'Schedule Reports',
      description: 'Set up automated report delivery',
      icon: FileText,
      action: () => {
        // TODO: Implement report scheduling functionality
        console.log('Schedule reports - opening scheduling interface');
        alert('Report scheduling interface coming soon!');
      },
      color: 'bg-purple-500'
    },
    {
      title: 'Custom Dashboard',
      description: 'Create custom analytics dashboard',
      icon: BarChart3,
      action: () => {
        // TODO: Implement custom dashboard creation
        console.log('Custom dashboard - opening dashboard builder');
        alert('Custom dashboard builder coming soon!');
      },
      color: 'bg-orange-500'
    }
  ];

  const chartData = config.features.useMockData ? {
    revenue: [
      { month: 'Jan', value: 45000 },
      { month: 'Feb', value: 52000 },
      { month: 'Mar', value: 48000 },
      { month: 'Apr', value: 61000 },
      { month: 'May', value: 55000 },
      { month: 'Jun', value: 67000 },
    ],
    users: [
      { month: 'Jan', value: 1200 },
      { month: 'Feb', value: 1350 },
      { month: 'Mar', value: 1280 },
      { month: 'Apr', value: 1450 },
      { month: 'May', value: 1380 },
      { month: 'Jun', value: 1520 },
    ],
    conversion: [
      { month: 'Jan', value: 2.8 },
      { month: 'Feb', value: 3.1 },
      { month: 'Mar', value: 2.9 },
      { month: 'Apr', value: 3.4 },
      { month: 'May', value: 3.2 },
      { month: 'Jun', value: 3.6 },
    ]
  } : {
    revenue: [],
    users: [],
    conversion: []
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight">Analytics & Reporting</h1>
          <p className="text-muted-foreground">
            Comprehensive analytics, insights, and automated reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Report
          </Button>
        </div>
      </div>

      {/* Analytics Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${analyticsStats.totalRevenue.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +{analyticsStats.monthlyGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsStats.activeUsers.toLocaleString()}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +{analyticsStats.userGrowth}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsStats.conversionRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
              +0.4% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{analyticsStats.churnRate}%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 mr-1 text-green-600" />
              -0.3% from last month
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common analytics and reporting tasks
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

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 w-full">
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
              {chartData.revenue.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="text-xs text-muted-foreground">${(data.value / 1000).toFixed(0)}k</div>
                  <div 
                    className="w-8 bg-blue-500 rounded-t"
                    style={{ height: `${(data.value / 67000) * 200}px` }}
                  />
                  <div className="text-xs text-muted-foreground">{data.month}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>
              Active user growth over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-end justify-between space-x-2">
              {chartData.users.map((data, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className="text-xs text-muted-foreground">{(data.value / 1000).toFixed(1)}k</div>
                  <div 
                    className="w-8 bg-green-500 rounded-t"
                    style={{ height: `${(data.value / 1520) * 200}px` }}
                  />
                  <div className="text-xs text-muted-foreground">{data.month}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Analytics & Reporting Management</CardTitle>
          <CardDescription>
            Comprehensive analytics dashboard and reporting tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
              <TabsTrigger value="dashboards">Dashboards</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Average Session Duration</span>
                        <span className="font-medium">{analyticsStats.averageSessionDuration} min</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Page Views</span>
                        <span className="font-medium">{analyticsStats.pageViews.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Bounce Rate</span>
                        <span className="font-medium">32%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Return Users</span>
                        <span className="font-medium">68%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Top Customer</span>
                        <span className="font-medium">Enterprise Corp</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Most Active Feature</span>
                        <span className="font-medium">AML Monitoring</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Best Converting Plan</span>
                        <span className="font-medium">Professional</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Peak Usage Time</span>
                        <span className="font-medium">2-4 PM EST</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-4">
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <BarChart3 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{report.name}</div>
                        <div className="text-sm text-muted-foreground">{report.type}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline">
                            {report.format.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">{report.size}</div>
                        <div className="text-sm text-muted-foreground">
                          Last run: {report.lastRun}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implement view report functionality
                            console.log('View report:', report.id);
                            alert(`Viewing report: ${report.name}`);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implement download report functionality
                            console.log('Download report:', report.id);
                            const reportData = {
                              id: report.id,
                              name: report.name,
                              type: report.type,
                              status: report.status,
                              format: report.format,
                              size: report.size,
                              lastRun: report.lastRun
                            };
                            
                            const reportContent = 'data:text/json;charset=utf-8,' + JSON.stringify(reportData, null, 2);
                            const encodedUri = encodeURI(reportContent);
                            const link = document.createElement('a');
                            link.setAttribute('href', encodedUri);
                            link.setAttribute('download', `${report.name.toLowerCase().replace(/\s+/g, '_')}.json`);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            // TODO: Implement report settings functionality
                            console.log('Report settings:', report.id);
                            alert(`Configuring settings for: ${report.name}`);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="dashboards" className="space-y-4">
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold">Custom Dashboards</h3>
                <p className="text-muted-foreground">
                  Create and manage custom analytics dashboards
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    // TODO: Implement create dashboard functionality
                    console.log('Create dashboard');
                    alert('Dashboard creation interface coming soon!');
                  }}
                >
                  Create Dashboard
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="font-medium text-blue-900">Revenue Opportunity</div>
                        <div className="text-sm text-blue-700">
                          Enterprise customers show 40% higher engagement with advanced features
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-900">Growth Trend</div>
                        <div className="text-sm text-green-700">
                          User retention improved by 15% after implementing new onboarding flow
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="font-medium text-yellow-900">Action Required</div>
                        <div className="text-sm text-yellow-700">
                          Consider reducing churn by offering personalized support to at-risk customers
                        </div>
                      </div>
                      <div className="p-3 bg-purple-50 rounded-lg">
                        <div className="font-medium text-purple-900">Optimization</div>
                        <div className="text-sm text-purple-700">
                          Mobile usage increased 25% - consider mobile-first feature development
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">Analytics Settings</h3>
                <p className="text-muted-foreground">
                  Configure analytics preferences, data retention, and reporting schedules
                </p>
                <Button 
                  className="mt-4"
                  onClick={() => {
                    // TODO: Implement analytics settings configuration
                    console.log('Configure analytics settings');
                    alert('Analytics settings configuration interface coming soon!');
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

export default AnalyticsReportingConsole;
