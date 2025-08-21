
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Shield,
  FileText,
  DollarSign
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { ComplianceMetrics } from '@/types/compliance';

const Dashboard = () => {
  const { user } = useAuth();

  // Mock metrics data
  const metrics: ComplianceMetrics = {
    totalCustomers: 1247,
    verifiedCustomers: 1089,
    pendingCustomers: 142,
    rejectedCustomers: 16,
    highRiskCustomers: 23,
    pepCustomers: 8,
    sanctionedCustomers: 2,
    averageRiskScore: 34
  };

  const recentAlerts = [
    {
      id: '1',
      type: 'High Risk Transaction',
      description: 'Transaction of $50,000 flagged for review',
      timestamp: '2024-01-15 14:30',
      severity: 'high' as const
    },
    {
      id: '2', 
      type: 'KYC Expiry',
      description: '5 customers require KYC renewal',
      timestamp: '2024-01-15 12:15',
      severity: 'medium' as const
    },
    {
      id: '3',
      type: 'Sanctions Match',
      description: 'Potential sanctions list match detected',
      timestamp: '2024-01-15 09:45',
      severity: 'critical' as const
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || 'User'}. Here's your compliance overview.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Shield className="h-4 w-4 mr-2" />
            Run Compliance Check
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.verifiedCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.verifiedCustomers / metrics.totalCustomers) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pendingCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.highRiskCustomers}</div>
            <p className="text-xs text-muted-foreground">
              Active monitoring required
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <DashboardCharts metrics={metrics} />

      {/* Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between p-3 border rounded">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <span className="font-medium">{alert.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                  <p className="text-xs text-muted-foreground">{alert.timestamp}</p>
                </div>
                <Button variant="outline" size="sm">
                  Review
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Key Performance Indicators
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Average Risk Score</span>
                <span className="font-medium">{metrics.averageRiskScore}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ width: `${metrics.averageRiskScore}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>KYC Completion Rate</span>
                <span className="font-medium">
                  {((metrics.verifiedCustomers / metrics.totalCustomers) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(metrics.verifiedCustomers / metrics.totalCustomers) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>PEP Detection Rate</span>
                <span className="font-medium">
                  {((metrics.pepCustomers / metrics.totalCustomers) * 100).toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ width: `${(metrics.pepCustomers / metrics.totalCustomers) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
