import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useCompliance } from '@/context/ComplianceContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { AlertTriangle, Users, FileText, TrendingUp, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

// Define ComplianceMetrics type to match what the component expects
interface ComplianceMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  verifiedUsers: number;
  sanctionedUsers: number;
  pepUsers: number;
}

const Dashboard: React.FC = () => {
  const { state } = useCompliance();
  const { metrics: dashboardMetrics, recentDocuments, loading } = useDashboardData();

  // Convert DashboardMetrics to ComplianceMetrics format
  const complianceMetrics: ComplianceMetrics = React.useMemo(() => {
    if (dashboardMetrics) {
      // If we have DashboardMetrics, map them to ComplianceMetrics
      return {
        totalTransactions: Math.floor(Math.random() * 1000) + 500, // Mock data
        flaggedTransactions: Math.floor(Math.random() * 50) + 10,
        verifiedUsers: state.users.filter(u => u.kycStatus === 'verified').length,
        sanctionedUsers: state.users.filter(u => u.isSanctioned).length,
        pepUsers: state.users.filter(u => u.isPEP).length,
      };
    }
    
    // Default values when no metrics are available
    return {
      totalTransactions: 0,
      flaggedTransactions: 0,
      verifiedUsers: 0,
      sanctionedUsers: 0,
      pepUsers: 0,
    };
  }, [dashboardMetrics, state.users]);

  // Loading state
  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          {t('dashboard.welcome', {name: user?.name})}
        </h2>
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Compliance Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Documents</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics?.pendingDocuments || 0}</div>
            <p className="text-xs text-muted-foreground">
              +2 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardMetrics?.activeAlerts || 0}</div>
            <p className="text-xs text-muted-foreground">
              -1 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.users.length}</div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.verifiedUsers} verified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceMetrics.flaggedTransactions}</div>
            <p className="text-xs text-muted-foreground">
              of {complianceMetrics.totalTransactions} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <div className="border rounded-md bg-muted">
        <CardHeader className="py-4">
          <CardTitle className="text-lg font-semibold">Recent Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recentDocuments.map((doc) => (
              <Link to={`/customers/${doc.userId}`} key={doc.id} className="block">
                <div className="flex items-center px-4 py-3 hover:bg-secondary transition-colors">
                  <div className="mr-3 rounded-full bg-blue-500 text-white p-2">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="flex-grow">
                    <div className="font-medium">{doc.fileName}</div>
                    <div className="text-sm text-muted-foreground">Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <Badge variant="outline">{doc.status}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          {recentDocuments.length === 0 && (
            <div className="px-4 py-3 text-center text-muted-foreground">
              No recent documents found.
            </div>
          )}
        </CardContent>
      </div>
    </div>
  );
};

export default Dashboard;
