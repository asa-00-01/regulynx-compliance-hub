import { DashboardLayout } from '@/components/layouts/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RecentDocumentsTable } from '@/components/tables/recent-documents-table';
import { RiskScoreChart } from '@/components/charts/risk-score-chart';
import { ComplianceCasesCard } from '@/components/cards/compliance-cases-card';
import { PerformanceOverviewCard } from '@/components/cards/performance-overview-card';
import { useAuthState } from '@/hooks/useAuthState';

export default function Dashboard() {
  const { user } = useAuthState();

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Replace with actual metric cards */}
          <Card>
            <CardHeader>
              <CardTitle>Total Users</CardTitle>
              <CardDescription>Registered users on the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,423</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Cases</CardTitle>
              <CardDescription>Compliance cases currently under review</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pending Documents</CardTitle>
              <CardDescription>Documents awaiting verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>New Alerts</CardTitle>
              <CardDescription>Unresolved risk alerts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Risk Score Distribution</CardTitle>
              <CardDescription>
                Distribution of user risk scores across the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <RiskScoreChart />
            </CardContent>
          </Card>
          
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Recent Documents</CardTitle>
              <CardDescription>
                Latest document submissions requiring review
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RecentDocumentsTable />
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2">
          <ComplianceCasesCard />
          {user && (
            <PerformanceOverviewCard 
              user={{
                ...user,
                status: user.status as 'verified' | 'pending' | 'rejected' | 'information_requested'
              }} 
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
