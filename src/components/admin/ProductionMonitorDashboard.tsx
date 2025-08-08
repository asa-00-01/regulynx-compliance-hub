
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database,
  Deploy,
  Bug,
  RefreshCw,
  XCircle,
  TrendingUp,
  Server
} from 'lucide-react';
import { productionMonitor, BackupStatus, ErrorLog, DeploymentLog, EnvironmentValidation } from '@/services/productionMonitor';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface SystemHealth {
  backups: { recent: BackupStatus[]; failed: number };
  errors: { critical: number; high: number; total: number };
  deployments: { recent: DeploymentLog[]; successful: number };
  validations: EnvironmentValidation[];
}

interface ProductionReadiness {
  isReady: boolean;
  score: number;
  issues: Array<{ type: string; severity: string; message: string; recommendation: string }>;
}

const ProductionMonitorDashboard: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [productionReadiness, setProductionReadiness] = useState<ProductionReadiness | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [health, readiness] = await Promise.all([
        productionMonitor.getSystemHealth(),
        productionMonitor.checkProductionReadiness()
      ]);
      
      setSystemHealth(health);
      setProductionReadiness(readiness);
    } catch (error) {
      console.error('Failed to load production monitor data:', error);
      toast({
        title: "Failed to Load Data",
        description: "Could not fetch production monitoring data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleScheduleBackup = async (type: 'full' | 'incremental' | 'differential') => {
    try {
      await productionMonitor.scheduleBackup(type);
      toast({
        title: "Backup Scheduled",
        description: `${type} backup has been scheduled successfully.`
      });
      loadData(); // Refresh data
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to schedule backup. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleResolveError = async (errorId: string) => {
    try {
      await productionMonitor.resolveError(errorId);
      toast({
        title: "Error Resolved",
        description: "Error has been marked as resolved."
      });
      loadData(); // Refresh data
    } catch (error) {
      toast({
        title: "Failed to Resolve",
        description: "Could not resolve error. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading && !systemHealth) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Production Monitor</h2>
          <p className="text-muted-foreground">
            Monitor system health, backups, errors, and production readiness
          </p>
        </div>
        <Button onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Production Readiness Alert */}
      {productionReadiness && !productionReadiness.isReady && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>System Not Production Ready</strong> - Score: {productionReadiness.score}/100
            <br />
            {productionReadiness.issues.filter(i => i.severity === 'critical').length} critical issue(s) must be resolved.
          </AlertDescription>
        </Alert>
      )}

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Production Ready</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {productionReadiness?.isReady ? (
                <span className="text-green-600">Ready</span>
              ) : (
                <span className="text-red-600">Not Ready</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Score: {productionReadiness?.score || 0}/100
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {systemHealth?.errors.critical || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemHealth?.errors.total || 0} total errors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systemHealth?.backups.failed || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemHealth?.backups.recent.length || 0} recent backups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployments</CardTitle>
            <Deploy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {systemHealth?.deployments.successful || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {systemHealth?.deployments.recent.length || 0} recent deployments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="validations">Environment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Production Readiness Issues */}
          {productionReadiness?.issues && productionReadiness.issues.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Production Issues</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {productionReadiness.issues.map((issue, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <AlertTriangle className={`h-5 w-5 flex-shrink-0 ${
                      issue.severity === 'critical' ? 'text-red-500' : 
                      issue.severity === 'high' ? 'text-orange-500' : 'text-yellow-500'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className={getSeverityColor(issue.severity)}>
                          {issue.severity.toUpperCase()}
                        </Badge>
                        <span className="font-medium">{issue.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{issue.message}</p>
                      <p className="text-xs text-blue-600">{issue.recommendation}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="backups" className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button onClick={() => handleScheduleBackup('incremental')} size="sm">
              Schedule Incremental Backup
            </Button>
            <Button onClick={() => handleScheduleBackup('full')} variant="outline" size="sm">
              Schedule Full Backup
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Backups</CardTitle>
            </CardHeader>
            <CardContent>
              {systemHealth?.backups.recent.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No backup logs found</p>
              ) : (
                <div className="space-y-3">
                  {systemHealth?.backups.recent.map((backup) => (
                    <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(backup.status)}
                        <div>
                          <div className="font-medium">{backup.backup_type} Backup</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(backup.created_at))} ago
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getSeverityColor(backup.status === 'failed' ? 'high' : 'low')}>
                          {backup.status}
                        </Badge>
                        {backup.file_size && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {Math.round(backup.file_size / 1024 / 1024)} MB
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
            </CardHeader>
            <CardContent>
              {systemHealth?.errors.total === 0 ? (
                <p className="text-muted-foreground text-center py-4">No errors found</p>
              ) : (
                <div className="space-y-3">
                  {/* This would show actual error logs - simplified for demo */}
                  <div className="text-center py-4 text-muted-foreground">
                    {systemHealth?.errors.total} error(s) - Use detailed error logs for full view
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment History</CardTitle>
            </CardHeader>
            <CardContent>
              {systemHealth?.deployments.recent.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No deployment logs found</p>
              ) : (
                <div className="space-y-3">
                  {systemHealth?.deployments.recent.map((deployment) => (
                    <div key={deployment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(deployment.status)}
                        <div>
                          <div className="font-medium">v{deployment.version}</div>
                          <div className="text-sm text-muted-foreground">
                            {deployment.environment} • {formatDistanceToNow(new Date(deployment.created_at))} ago
                          </div>
                        </div>
                      </div>
                      <Badge className={getSeverityColor(deployment.status === 'failed' ? 'high' : 'low')}>
                        {deployment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environment Validations</CardTitle>
            </CardHeader>
            <CardContent>
              {!systemHealth?.validations || systemHealth.validations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No validations available</p>
              ) : (
                <div className="space-y-3">
                  {systemHealth.validations.map((validation, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(validation.status)}
                        <div>
                          <div className="font-medium">{validation.validation_type.replace('_', ' ')}</div>
                          <div className="text-sm text-muted-foreground">{validation.message}</div>
                          {validation.recommendation && (
                            <div className="text-xs text-blue-600 mt-1">{validation.recommendation}</div>
                          )}
                        </div>
                      </div>
                      <Badge className={getSeverityColor(validation.severity)}>
                        {validation.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductionMonitorDashboard;
