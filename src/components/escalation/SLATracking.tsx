import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  TrendingDown,
  Timer,
  Target,
  BarChart3
} from 'lucide-react';
import { useEscalation } from '@/hooks/useEscalation';
import { SLATracking as SLATrackingType } from '@/types/escalation';
import { format } from 'date-fns';

const SLATrackingComponent: React.FC = () => {
  const { slaBreaches, escalationSummary, loading } = useEscalation();
  const [selectedSLA, setSelectedSLA] = useState<SLATrackingType | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const getSLAStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'met':
        return 'bg-green-100 text-green-800';
      case 'breached':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSLAStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Clock className="h-4 w-4" />;
      case 'met':
        return <CheckCircle className="h-4 w-4" />;
      case 'breached':
        return <XCircle className="h-4 w-4" />;
      case 'paused':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSLAProgress = (sla: SLATrackingType) => {
    const startTime = new Date(sla.startTime).getTime();
    const endTime = sla.endTime ? new Date(sla.endTime).getTime() : Date.now();
    const totalTime = endTime - startTime;
    const targetTime = sla.targetHours * 60 * 60 * 1000; // Convert hours to milliseconds
    
    return Math.min((totalTime / targetTime) * 100, 100);
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const calculateSLACompliance = () => {
    if (!escalationSummary) return 0;
    
    const totalSLAs = escalationSummary.totalEscalations;
    const breachedSLAs = escalationSummary.slaBreaches;
    
    if (totalSLAs === 0) return 100;
    return ((totalSLAs - breachedSLAs) / totalSLAs) * 100;
  };

  const handleViewDetails = (sla: SLATrackingType) => {
    setSelectedSLA(sla);
    setIsDetailDialogOpen(true);
  };

  const slaComplianceRate = calculateSLACompliance();

  if (loading.slaBreaches) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            SLA Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* SLA Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Compliance Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{slaComplianceRate.toFixed(1)}%</div>
              <Progress value={slaComplianceRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {escalationSummary?.totalEscalations || 0} total escalations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active SLAs</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {slaBreaches.filter(sla => sla.status === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently being tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {escalationSummary?.slaBreaches || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Met SLAs</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {slaBreaches.filter(sla => sla.status === 'met').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* SLA Tracking Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              SLA Tracking Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            {slaBreaches.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No SLA tracking data available</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Case ID</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>SLA Type</TableHead>
                      <TableHead>Target</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slaBreaches.map((sla) => (
                      <TableRow key={sla.id}>
                        <TableCell className="font-mono text-sm">
                          {sla.caseId.substring(0, 8)}...
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-blue-100 text-blue-800">
                            Level {sla.escalationLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {sla.slaType.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Timer className="h-4 w-4" />
                            <span className="text-sm">{formatDuration(sla.targetHours)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={getSLAProgress(sla)} 
                              className="w-20"
                            />
                            <span className="text-sm">
                              {getSLAProgress(sla).toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getSLAStatusIcon(sla.status)}
                            <Badge className={getSLAStatusColor(sla.status)}>
                              {sla.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(sla)}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* SLA Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              SLA Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the SLA tracking
            </DialogDescription>
          </DialogHeader>
          
          {selectedSLA && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Case ID</label>
                  <p className="text-sm font-mono">{selectedSLA.caseId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Escalation Level</label>
                  <Badge className="bg-blue-100 text-blue-800">
                    Level {selectedSLA.escalationLevel}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">SLA Type</label>
                  <p className="text-sm capitalize">{selectedSLA.slaType.replace('_', ' ')}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    {getSLAStatusIcon(selectedSLA.status)}
                    <Badge className={getSLAStatusColor(selectedSLA.status)}>
                      {selectedSLA.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Target Time</label>
                <div className="flex items-center gap-2 mt-1">
                  <Target className="h-4 w-4" />
                  <span className="text-sm font-medium">{formatDuration(selectedSLA.targetHours)}</span>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Progress</label>
                <div className="mt-2 space-y-2">
                  <Progress value={getSLAProgress(selectedSLA)} />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Start: {format(new Date(selectedSLA.startTime), 'MMM dd, yyyy HH:mm')}</span>
                    <span>{getSLAProgress(selectedSLA).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
              
              {selectedSLA.endTime && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">End Time</label>
                  <p className="text-sm">
                    {format(new Date(selectedSLA.endTime), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
              )}
              
              {selectedSLA.breachReason && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Breach Reason</label>
                  <div className="mt-1 p-3 bg-red-50 rounded-md">
                    <p className="text-sm text-red-700">{selectedSLA.breachReason}</p>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="text-sm">
                    {format(new Date(selectedSLA.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="text-sm">
                    {format(new Date(selectedSLA.updatedAt), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SLATrackingComponent;
