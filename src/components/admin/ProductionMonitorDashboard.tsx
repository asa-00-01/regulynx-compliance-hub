
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  Rocket,
  Server, 
  TrendingUp, 
  XCircle,
  RefreshCw,
  Clock
} from 'lucide-react';
import { productionMonitor } from '@/services/productionMonitor';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface BackupStatus {
  id: string;
  backup_type: 'full' | 'incremental' | 'differential';
  status: 'started' | 'completed' | 'failed' | 'cancelled';
  file_path?: string;
  file_size?: number;
  duration_seconds?: number;
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

interface ErrorLog {
  id: string;
  error_id: string;
  error_message: string;
  error_stack?: string;
  error_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  user_id?: string;
  url?: string;
  user_agent?: string;
  environment?: string;
  additional_context?: Record<string, any>;
  resolved?: boolean;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
}

interface DeploymentLog {
  id: string;
  deployment_id: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  status: 'started' | 'building' | 'testing' | 'deploying' | 'completed' | 'failed' | 'rolled_back';
  commit_hash?: string;
  branch?: string;
  deployed_by?: string;
  build_duration_seconds?: number;
  deployment_duration_seconds?: number;
  error_message?: string;
  rollback_reason?: string;
  created_at: string;
  completed_at?: string;
}

interface EnvironmentValidation {
  validation_type: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  recommendation?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

const ProductionMonitorDashboard: React.FC = () => {
  const [backupLogs, setBackupLogs] = useState<BackupStatus[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [deploymentLogs, setDeploymentLogs] = useState<DeploymentLog[]>([]);
  const [environmentValidations, setEnvironmentValidations] = useState<EnvironmentValidation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [backups, errors, deployments, validations] = await Promise.all([
          productionMonitor.getBackupLogs(),
          productionMonitor.getErrorLogs(),
          productionMonitor.getDeploymentLogs(),
          productionMonitor.validateEnvironment()
        ]);
        setBackupLogs(backups);
        setErrorLogs(errors);
        setDeploymentLogs(deployments);
        setEnvironmentValidations(validations);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast({
          title: "Error",
          description: "Failed to fetch production monitor data.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleRescheduleBackup = async () => {
    try {
      setLoading(true);
      await productionMonitor.scheduleBackup();
      toast({
        title: "Backup Rescheduled",
        description: "A new backup has been scheduled.",
      });
    } catch (error) {
      console.error('Failed to reschedule backup:', error);
      toast({
        title: "Error",
        description: "Failed to reschedule backup.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading production monitor data..." />;
  }

  return (
    <Tabs defaultValue="health" className="w-full space-y-4">
      <TabsList>
        <TabsTrigger value="health"><Activity className="mr-2 h-4 w-4" /> System Health</TabsTrigger>
        <TabsTrigger value="backups"><Database className="mr-2 h-4 w-4" /> Backups</TabsTrigger>
        <TabsTrigger value="errors"><AlertTriangle className="mr-2 h-4 w-4" /> Errors</TabsTrigger>
        <TabsTrigger value="deployments"><Rocket className="mr-2 h-4 w-4" /> Deployments</TabsTrigger>
        <TabsTrigger value="validations"><CheckCircle className="mr-2 h-4 w-4" /> Validations</TabsTrigger>
      </TabsList>
      <TabsContent value="health" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>A summary of the system's current health status.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center space-x-4">
              <Server className="h-6 w-6 text-gray-500" />
              <div>
                <div className="text-2xl font-bold">{backupLogs.length}</div>
                <div className="text-muted-foreground">Total Backups</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <XCircle className="h-6 w-6 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{errorLogs.length}</div>
                <div className="text-muted-foreground">Total Errors</div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-6 w-6 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{deploymentLogs.length}</div>
                <div className="text-muted-foreground">Total Deployments</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="backups" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Backup Logs</CardTitle>
            <CardDescription>Recent backup activities and status.</CardDescription>
          </CardHeader>
          <CardContent>
            {backupLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Completed At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {backupLogs.map((backup) => (
                      <tr key={backup.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{backup.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{backup.backup_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={backup.status === 'completed' ? 'success' : backup.status === 'failed' ? 'destructive' : 'secondary'}>
                            {backup.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(backup.created_at).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {backup.completed_at ? new Date(backup.completed_at).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-muted-foreground">No backup logs found.</div>
            )}
            <Button onClick={handleRescheduleBackup} disabled={loading} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reschedule Backup
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="errors" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Error Logs</CardTitle>
            <CardDescription>Recent errors and their details.</CardDescription>
          </CardHeader>
          <CardContent>
            {errorLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {errorLogs.map((error) => (
                      <tr key={error.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{error.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{error.error_message}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={error.severity === 'critical' ? 'destructive' : error.severity === 'high' ? 'warning' : 'secondary'}>
                            {error.severity}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(error.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-muted-foreground">No error logs found.</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="deployments" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Deployment Logs</CardTitle>
            <CardDescription>Recent deployment activities and status.</CardDescription>
          </CardHeader>
          <CardContent>
            {deploymentLogs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Version
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Environment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {deploymentLogs.map((deployment) => (
                      <tr key={deployment.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{deployment.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{deployment.version}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{deployment.environment}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={deployment.status === 'completed' ? 'success' : deployment.status === 'failed' ? 'destructive' : 'secondary'}>
                            {deployment.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{new Date(deployment.created_at).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-muted-foreground">No deployment logs found.</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="validations" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Environment Validations</CardTitle>
            <CardDescription>Environment configuration validation results.</CardDescription>
          </CardHeader>
          <CardContent>
            {environmentValidations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Message
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Severity
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {environmentValidations.map((validation) => (
                      <tr key={validation.validation_type}>
                        <td className="px-6 py-4 whitespace-nowrap">{validation.validation_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={validation.status === 'passed' ? 'success' : validation.status === 'failed' ? 'destructive' : 'warning'}>
                            {validation.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{validation.message}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge variant={validation.severity === 'critical' ? 'destructive' : validation.severity === 'high' ? 'warning' : 'secondary'}>
                            {validation.severity}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-muted-foreground">No environment validations found.</div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default ProductionMonitorDashboard;
