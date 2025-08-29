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
import { useComplianceData } from '@/hooks/useComplianceData';

const Compliance = () => {
  const [activeTab, setActiveTab] = React.useState('overview');
  const { complianceData, riskFactors, recentActivities, loading } = useComplianceData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compliance Center</h1>
            <p className="text-muted-foreground">
              Overview of your organization's compliance status and activities.
            </p>
          </div>
          <Button disabled>
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-4 w-4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted animate-pulse rounded mb-4" />
                <div className="h-2 w-full bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
                  <div className="flex items-center gap-2">
                    {risk.trend && (
                      <Badge 
                        variant={risk.trend === 'up' ? 'destructive' : risk.trend === 'down' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {risk.trend === 'up' ? '↗' : risk.trend === 'down' ? '↘' : '→'} {risk.trend}
                      </Badge>
                    )}
                    {risk.status === 'Healthy' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : risk.status === 'Critical' ? (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{risk.score}</div>
                  <Progress value={risk.score} className="mt-4" />
                  <p className="text-sm text-muted-foreground mt-2">
                    Status: <Badge variant="secondary">{risk.status}</Badge>
                  </p>
                  {risk.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {risk.description}
                    </p>
                  )}
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
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">{activity.type}</CardTitle>
                    {activity.severity && (
                      <Badge 
                        variant={
                          activity.severity === 'critical' ? 'destructive' : 
                          activity.severity === 'high' ? 'destructive' : 
                          activity.severity === 'medium' ? 'secondary' : 'outline'
                        }
                        className="text-xs"
                      >
                        {activity.severity}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.user && (
                      <Badge variant="outline" className="text-xs">
                        {activity.user}
                      </Badge>
                    )}
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
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
