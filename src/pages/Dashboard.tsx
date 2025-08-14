import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Activity
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import AdminOnlyDevTools from '@/components/common/AdminOnlyDevTools';
import config from '@/config/environment';

interface ComplianceMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  verifiedUsers: number;
  sanctionedUsers: number;
  pepUsers: number;
}

interface DashboardMetrics {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  flaggedTransactions: number;
  totalTransactions: number;
  complianceScore: number;
  riskAlerts: number;
  documentsProcessed: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ComplianceMetrics>({
    totalTransactions: 0,
    flaggedTransactions: 0,
    verifiedUsers: 0,
    sanctionedUsers: 0,
    pepUsers: 0
  });

  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: dashboardService.getDashboardMetrics,
  });

  useEffect(() => {
    if (dashboardData) {
      // Convert DashboardMetrics to ComplianceMetrics
      const complianceMetrics = convertToComplianceMetrics(dashboardData);
      setMetrics(complianceMetrics);
    }
  }, [dashboardData]);

  if (isLoading) {
    return <div>Loading dashboard data...</div>;
  }

  if (isError) {
    return <div>Error loading dashboard data. Please try again later.</div>;
  }

  const convertToComplianceMetrics = (data: DashboardMetrics): ComplianceMetrics => {
    return {
      totalTransactions: data.totalTransactions,
      flaggedTransactions: data.flaggedTransactions,
      verifiedUsers: data.verifiedUsers,
      sanctionedUsers: 0, // Default value if not provided
      pepUsers: 0, // Default value if not provided
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Compliance Dashboard
          </h1>
          <p className="text-muted-foreground">
            Welcome back, {user?.name || user?.email}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="capitalize">
            {user?.role || 'User'}
          </Badge>
          {user?.customer?.name && (
            <Badge variant="secondary">
              {user.customer.name}
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Flagged Transactions
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.flaggedTransactions}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="h-3 w-3 inline mr-1" />
              -4.3% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Verified Users
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.verifiedUsers}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12.5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sanctioned Users
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{metrics.sanctionedUsers}</div>
            <p className="text-xs text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Compliance Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">High-risk transaction flagged</p>
                  <p className="text-xs text-muted-foreground">Transaction ID: TX-2024-001234</p>
                </div>
                <Badge variant="destructive">High Risk</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">KYC document pending review</p>
                  <p className="text-xs text-muted-foreground">User: john.doe@example.com</p>
                </div>
                <Badge variant="secondary">Pending</Badge>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">SAR report submitted</p>
                  <p className="text-xs text-muted-foreground">Report ID: SAR-2024-0089</p>
                </div>
                <Badge variant="default">Completed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Compliance Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">94%</div>
              <p className="text-sm text-muted-foreground mb-4">Overall compliance rating</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>KYC Completion</span>
                  <span>98%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>AML Monitoring</span>
                  <span>92%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Document Review</span>
                  <span>89%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Priority Action Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>3 high-risk transactions require immediate review</span>
                <Button size="sm" variant="destructive">Review Now</Button>
              </AlertDescription>
            </Alert>
            
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>12 KYC documents pending verification</span>
                <Button size="sm" variant="secondary">View Queue</Button>
              </AlertDescription>
            </Alert>
            
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription className="flex justify-between items-center">
                <span>Monthly SAR report due in 5 days</span>
                <Button size="sm" variant="outline">Generate Report</Button>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Admin-only developer tools */}
      <AdminOnlyDevTools />
    </div>
  );
};

export default Dashboard;
