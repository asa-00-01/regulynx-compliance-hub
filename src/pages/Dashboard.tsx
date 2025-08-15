
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Shield, AlertTriangle, Activity, TrendingUp, FileText, Clock, CheckCircle } from 'lucide-react';
import { DashboardService, type DashboardMetrics } from '@/services/dashboardService';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: DashboardService.getDashboardMetrics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => DashboardService.getRecentActivity(5),
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: riskDistribution } = useQuery({
    queryKey: ['risk-distribution'],
    queryFn: DashboardService.getRiskScoreDistribution,
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-destructive mb-4 mx-auto" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </div>
      </div>
    );
  }

  const defaultMetrics: DashboardMetrics = {
    totalUsers: 0,
    verifiedUsers: 0,
    pendingVerifications: 0,
    flaggedTransactions: 0,
    totalTransactions: 0,
    activeComplianceCases: 0,
    highRiskCustomers: 0,
    averageRiskScore: 0
  };

  const dashboardMetrics = metrics || defaultMetrics;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your compliance platform activity
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Organization customers being monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.verifiedUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              KYC verified customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.pendingVerifications.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting KYC verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.highRiskCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Customers requiring attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.totalTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              AML transactions monitored
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Transactions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.flaggedTransactions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Requiring investigation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.activeComplianceCases.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Open compliance cases
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics.averageRiskScore}</div>
            <p className="text-xs text-muted-foreground">
              Across all customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivity && recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity: any) => (
                <div key={activity.id} className="flex items-center space-x-4 text-sm">
                  <div className="flex-shrink-0">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">
                      <span className="font-medium">
                        {activity.organization_customers?.full_name || 'Unknown Customer'}
                      </span>
                      {' - '}
                      <span className="capitalize">{activity.type.replace('_', ' ')}</span>
                    </p>
                    <p className="text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${activity.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 
                        activity.status === 'resolved' ? 'bg-green-100 text-green-800' : 
                        'bg-blue-100 text-blue-800'}`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No recent activity</p>
          )}
        </CardContent>
      </Card>

      {/* Risk Distribution */}
      {riskDistribution && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{riskDistribution.low}</div>
                <p className="text-sm text-muted-foreground">Low Risk</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{riskDistribution.medium}</div>
                <p className="text-sm text-muted-foreground">Medium Risk</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{riskDistribution.high}</div>
                <p className="text-sm text-muted-foreground">High Risk</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{riskDistribution.critical}</div>
                <p className="text-sm text-muted-foreground">Critical Risk</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
