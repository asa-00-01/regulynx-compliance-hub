import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  Users,
  Activity,
  BarChart3
} from 'lucide-react';

const Compliance = () => {
  const [activeTab, setActiveTab] = React.useState('overview');

  const complianceData = {
    overallScore: 85,
    status: 'Healthy',
    lastUpdated: '2024-03-15',
    casesOpened: 32,
    casesResolved: 28,
    alertsGenerated: 156,
    amlAlerts: 89,
    kycAlerts: 67,
    trainingCompletion: 92,
    policyUpdates: 4,
  };

  const riskFactors = [
    { name: 'Transaction Monitoring', score: 92, status: 'Healthy' },
    { name: 'KYC/CDD', score: 88, status: 'Healthy' },
    { name: 'AML Procedures', score: 76, status: 'Moderate' },
    { name: 'Sanctions Screening', score: 95, status: 'Healthy' },
    { name: 'Regulatory Reporting', score: 80, status: 'Healthy' },
  ];

  const recentActivities = [
    { type: 'AML Alert', description: 'High-value transaction detected', date: '2024-03-14', status: 'Open' },
    { type: 'KYC Update', description: 'User document verification required', date: '2024-03-13', status: 'Pending' },
    { type: 'Policy Change', description: 'Updated AML policy', date: '2024-03-10', status: 'Completed' },
    { type: 'System Update', description: 'Compliance system updated to v2.5', date: '2024-03-05', status: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Center</h1>
          <p className="text-muted-foreground">
            Overview of your organization's compliance status and activities.
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-sm grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="risk">Risk Factors</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Compliance Score</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceData.overallScore}</div>
                <Progress value={complianceData.overallScore} className="mt-4" />
                <p className="text-sm text-muted-foreground mt-2">
                  Status: <Badge variant="secondary">{complianceData.status}</Badge>
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cases Opened / Resolved</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceData.casesOpened} / {complianceData.casesResolved}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Last Updated: {complianceData.lastUpdated}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alerts Generated</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceData.alertsGenerated}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  AML: {complianceData.amlAlerts}, KYC: {complianceData.kycAlerts}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Training Completion Rate</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceData.trainingCompletion}%</div>
                <Progress value={complianceData.trainingCompletion} className="mt-4" />
                <p className="text-sm text-muted-foreground mt-2">
                  All employees are up-to-date with compliance training.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Policy Updates</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceData.policyUpdates}</div>
                <p className="text-sm text-muted-foreground mt-2">
                  Recent updates to compliance policies.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {riskFactors.map((risk, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{risk.name}</CardTitle>
                  {risk.status === 'Healthy' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{risk.score}</div>
                  <Progress value={risk.score} className="mt-4" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Status: <Badge variant="secondary">{risk.status}</Badge>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {recentActivities.map((activity, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{activity.type}</CardTitle>
                  <p className="text-sm text-muted-foreground">{activity.date}</p>
                </CardHeader>
                <CardContent>
                  <CardDescription>{activity.description}</CardDescription>
                  <p className="text-sm text-muted-foreground mt-2">
                    Status: <Badge variant="secondary">{activity.status}</Badge>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Compliance;
