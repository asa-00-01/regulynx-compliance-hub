import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import DashboardService, { DashboardMetrics } from '@/services/dashboardService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Users, Shield, Activity, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import DashboardCharts from '@/components/dashboard/DashboardCharts';

interface ComplianceMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  verifiedUsers: number;
  sanctionedUsers: number;
  pepUsers: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardMetrics = await DashboardService.getDashboardMetrics();
        setMetrics(dashboardMetrics);
      } catch (err: any) {
        console.error('Failed to load dashboard metrics:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!metrics) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>No dashboard data available.</AlertDescription>
      </Alert>
    );
  }

  const getRoleBasedWelcome = () => {
    if (user?.isPlatformOwner) return 'Platform Owner Dashboard';
    if (user?.customer_roles?.includes('customer_admin')) return 'Admin Dashboard';
    if (user?.customer_roles?.includes('customer_compliance')) return 'Compliance Dashboard';
    if (user?.customer_roles?.includes('customer_executive')) return 'Executive Dashboard';
    return 'Dashboard';
  };

  const getMetricCards = () => {
    const baseCards = [
      {
        title: 'Total Users',
        value: metrics.totalUsers,
        description: 'Registered users in system',
        icon: Users,
        color: 'text-blue-600'
      },
      {
        title: 'Verified Users',
        value: metrics.verifiedUsers,
        description: 'KYC verified users',
        icon: CheckCircle,
        color: 'text-green-600'
      },
      {
        title: 'Pending Verifications',
        value: metrics.pendingVerifications,
        description: 'Awaiting verification',
        icon: Clock,
        color: 'text-orange-600'
      }
    ];

    if (user?.customer_roles?.includes('customer_compliance') || user?.isPlatformOwner) {
      baseCards.push(
        {
          title: 'High Risk Customers',
          value: metrics.highRiskCustomers,
          description: 'Customers requiring attention',
          icon: AlertTriangle,
          color: 'text-red-600'
        },
        {
          title: 'Active Cases',
          value: metrics.activeComplianceCases,
          description: 'Open compliance cases',
          icon: Shield,
          color: 'text-purple-600'
        },
        {
          title: 'Flagged Transactions',
          value: metrics.flaggedTransactions,
          description: 'Transactions requiring review',
          icon: Activity,
          color: 'text-amber-600'
        }
      );
    }

    return baseCards;
  };

  const metricCards = getMetricCards();

  // Create compliance metrics from dashboard metrics
  const complianceMetrics: ComplianceMetrics = {
    totalTransactions: metrics.totalTransactions,
    flaggedTransactions: metrics.flaggedTransactions,
    verifiedUsers: metrics.verifiedUsers,
    sanctionedUsers: 0, // Not available in DashboardMetrics
    pepUsers: 0 // Not available in DashboardMetrics
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{getRoleBasedWelcome()}</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.name || user?.email}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {metricCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risk Overview */}
      {(user?.customer_roles?.includes('customer_compliance') || user?.isPlatformOwner) && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Risk Score Overview</CardTitle>
              <CardDescription>
                Average customer risk score: {metrics.averageRiskScore}%
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">System Risk Level</span>
                  <Badge variant={metrics.averageRiskScore > 70 ? 'destructive' : 
                                 metrics.averageRiskScore > 40 ? 'secondary' : 'default'}>
                    {metrics.averageRiskScore > 70 ? 'High' : 
                     metrics.averageRiskScore > 40 ? 'Medium' : 'Low'}
                  </Badge>
                </div>
                <Progress value={metrics.averageRiskScore} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {metrics.highRiskCustomers} customers require immediate attention
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>
                Current compliance monitoring overview
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Active Cases</span>
                  <span className="text-sm font-medium">{metrics.activeComplianceCases}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Flagged Transactions</span>
                  <span className="text-sm font-medium">{metrics.flaggedTransactions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Pending Reviews</span>
                  <span className="text-sm font-medium">{metrics.pendingVerifications}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts Section */}
      <DashboardCharts metrics={complianceMetrics} />
    </div>
  );
};

export default Dashboard;
