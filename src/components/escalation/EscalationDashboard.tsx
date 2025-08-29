import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Clock, CheckCircle, XCircle, TrendingUp, Users, AlertCircle } from 'lucide-react';
import { useEscalation } from '@/hooks/useEscalation';
import { format } from 'date-fns';
import { EscalationHistory, EscalationMetrics, SLATracking } from '@/types/escalation';
import EscalationRulesManager from './EscalationRulesManager';
import EscalationNotifications from './EscalationNotifications';
import EscalationHistoryComponent from './EscalationHistory';
import SLATrackingComponent from './SLATracking';

const EscalationDashboard: React.FC = () => {
  const {
    escalationSummary,
    escalationMetrics,
    slaBreaches,
    loading,
    refreshAll
  } = useEscalation({ autoRefresh: true, refreshInterval: 30000 });

  const [activeTab, setActiveTab] = useState('overview');

  const getEscalationLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-red-100 text-red-800';
      case 5: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSLAStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'met': return 'bg-blue-100 text-blue-800';
      case 'breached': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  if (loading.summary || loading.metrics) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(null).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Escalation Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage case escalations, SLA compliance, and escalation workflows
          </p>
        </div>
        <Button onClick={refreshAll} disabled={loading.summary}>
          Refresh
        </Button>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Escalations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{escalationSummary?.totalEscalations || 0}</div>
            <p className="text-xs text-muted-foreground">
              {escalationMetrics?.escalationsToday || 0} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Escalations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{escalationSummary?.activeEscalations || 0}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{escalationSummary?.slaBreaches || 0}</div>
            <p className="text-xs text-muted-foreground">
              {escalationMetrics?.slaComplianceRate ? `${Math.round(escalationMetrics.slaComplianceRate)}% compliance` : 'No data'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {escalationMetrics?.averageResolutionTime ? formatDuration(escalationMetrics.averageResolutionTime) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              Average time to resolve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="escalations">Recent Escalations</TabsTrigger>
          <TabsTrigger value="sla">SLA Tracking</TabsTrigger>
          <TabsTrigger value="metrics">Detailed Metrics</TabsTrigger>
          <TabsTrigger value="rules">Escalation Rules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Escalation Levels Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Escalation Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {escalationSummary?.escalationLevels && Object.entries(escalationSummary.escalationLevels).map(([level, count]) => (
                    <div key={level} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Badge className={getEscalationLevelColor(parseInt(level.replace('level', '')))}>
                          Level {level.replace('level', '')}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {count} cases
                        </span>
                      </div>
                      <div className="w-24">
                        <Progress 
                          value={escalationSummary.totalEscalations > 0 ? (count / escalationSummary.totalEscalations) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SLA Compliance */}
            <Card>
              <CardHeader>
                <CardTitle>SLA Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Compliance</span>
                    <span className="text-sm font-bold">
                      {escalationMetrics?.slaComplianceRate ? `${Math.round(escalationMetrics.slaComplianceRate)}%` : 'N/A'}
                    </span>
                  </div>
                  <Progress 
                    value={escalationMetrics?.slaComplianceRate || 0} 
                    className="h-3"
                  />
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Active SLAs</div>
                      <div className="font-semibold">
                        {slaBreaches.filter(sla => sla.status === 'active').length}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Breached SLAs</div>
                      <div className="font-semibold text-red-600">
                        {slaBreaches.filter(sla => sla.status === 'breached').length}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Recent Escalations Tab */}
        <TabsContent value="escalations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Escalations</CardTitle>
            </CardHeader>
            <CardContent>
              {escalationSummary?.recentEscalations && escalationSummary.recentEscalations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {escalationSummary.recentEscalations.map((escalation) => (
                      <TableRow key={escalation.id}>
                        <TableCell className="font-medium">{escalation.caseId.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge className={getEscalationLevelColor(escalation.escalationLevel)}>
                            Level {escalation.escalationLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{escalation.reason}</TableCell>
                        <TableCell>{escalation.newAssignedTo ? 'Assigned' : 'Unassigned'}</TableCell>
                        <TableCell>{format(new Date(escalation.escalationDate), 'MMM dd, HH:mm')}</TableCell>
                        <TableCell>
                          <Badge variant={escalation.resolvedAt ? 'outline' : 'default'}>
                            {escalation.resolvedAt ? 'Resolved' : 'Active'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent escalations</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLA Tracking Tab */}
        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SLA Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              {slaBreaches.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>SLA Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Elapsed</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slaBreaches.map((sla) => (
                      <TableRow key={sla.id}>
                        <TableCell className="font-medium">{sla.caseId.substring(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge className={getEscalationLevelColor(sla.escalationLevel)}>
                            Level {sla.escalationLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">{sla.slaType.replace('_', ' ')}</TableCell>
                        <TableCell>{formatDuration(sla.targetHours)}</TableCell>
                        <TableCell>
                          {formatDuration(
                            (new Date().getTime() - new Date(sla.startTime).getTime()) / (1000 * 60 * 60)
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getSLAStatusColor(sla.status)}>
                            {sla.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <p className="text-muted-foreground">All SLAs are within target</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Escalation Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Escalation Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Today</span>
                    <span className="font-semibold">{escalationMetrics?.escalationsToday || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">This Week</span>
                    <span className="font-semibold">{escalationMetrics?.escalationsThisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">This Month</span>
                    <span className="font-semibold">{escalationMetrics?.escalationsThisMonth || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Escalated Cases */}
            <Card>
              <CardHeader>
                <CardTitle>Top Escalated Cases</CardTitle>
              </CardHeader>
              <CardContent>
                {escalationMetrics?.topEscalatedCases && escalationMetrics.topEscalatedCases.length > 0 ? (
                  <div className="space-y-3">
                    {escalationMetrics.topEscalatedCases.map((caseItem, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge className={getEscalationLevelColor(caseItem.escalationLevel)}>
                            Level {caseItem.escalationLevel}
                          </Badge>
                          <span className="text-sm">{caseItem.caseId.substring(0, 8)}...</span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(caseItem.escalationDate), 'MMM dd')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No escalated cases</p>
                )}
              </CardContent>
            </Card>
          </div>
                 </TabsContent>

         {/* Escalation Rules Tab */}
         <TabsContent value="rules" className="space-y-4">
           <EscalationRulesManager />
         </TabsContent>

         {/* Escalation History Tab */}
         <TabsContent value="history" className="space-y-4">
           <EscalationHistoryComponent />
         </TabsContent>

         {/* SLA Tracking Tab */}
         <TabsContent value="sla" className="space-y-4">
           <SLATrackingComponent />
         </TabsContent>

         {/* Notifications Tab */}
         <TabsContent value="notifications" className="space-y-4">
           <EscalationNotifications />
         </TabsContent>
       </Tabs>
     </div>
   );
 };

export default EscalationDashboard;
