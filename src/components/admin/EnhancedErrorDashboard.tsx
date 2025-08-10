
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Bug, 
  TrendingUp, 
  Filter,
  Download,
  RefreshCw,
  Clock,
  MapPin,
  User,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { enhancedErrorTrackingService, ErrorLog, ErrorAnalytics } from '@/services/enhancedErrorTracking';

const EnhancedErrorDashboard: React.FC = () => {
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [analytics, setAnalytics] = useState<ErrorAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<ErrorLog | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    loadErrorData();
  }, [filter]);

  const loadErrorData = async () => {
    setLoading(true);
    try {
      const logs = enhancedErrorTrackingService.getErrorLogs();
      const errorAnalytics = enhancedErrorTrackingService.getErrorAnalytics();
      
      const filteredLogs = filter === 'all' 
        ? logs 
        : logs.filter(log => log.severity === filter);
      
      setErrorLogs(filteredLogs);
      setAnalytics(errorAnalytics);
    } catch (error) {
      console.error('Failed to load error data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveError = async (errorId: string) => {
    try {
      enhancedErrorTrackingService.resolveError(errorId, 'Admin');
      await loadErrorData();
    } catch (error) {
      console.error('Failed to resolve error:', error);
    }
  };

  const handleExportErrors = async () => {
    try {
      const exportData = enhancedErrorTrackingService.exportErrorLogs();
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'error-logs.json';
      a.click();
    } catch (error) {
      console.error('Failed to export errors:', error);
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading error analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enhanced Error Tracking</h1>
          <p className="text-muted-foreground">Monitor and analyze application errors</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadErrorData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExportErrors}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Bug className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Errors</p>
                  <p className="text-2xl font-bold">{analytics.totalErrors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Critical Errors</p>
                  <p className="text-2xl font-bold">{analytics.criticalErrors}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Error Rate</p>
                  <p className="text-2xl font-bold">{analytics.errorRate.toFixed(2)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Avg Resolution</p>
                  <p className="text-2xl font-bold">{Math.round(analytics.averageResolutionTime)}h</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="text-sm font-medium">Filter by severity:</span>
              <div className="flex gap-1">
                {['all', 'critical', 'high', 'medium', 'low'].map((severity) => (
                  <Button
                    key={severity}
                    size="sm"
                    variant={filter === severity ? 'default' : 'outline'}
                    onClick={() => setFilter(severity as any)}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {errorLogs.map((error) => (
              <Card key={error.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getSeverityColor(error.severity)}>
                          {error.severity}
                        </Badge>
                        <Badge variant="outline">
                          {error.component || 'Unknown'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {error.timestamp.toLocaleString()}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold mb-2">{error.message}</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{error.userId || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{error.userAgent || 'Unknown browser'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Occurred {error.occurrenceCount} time(s)</span>
                        </div>
                      </div>
                      
                      {error.stackTrace && (
                        <div className="mt-4">
                          <details>
                            <summary className="cursor-pointer text-sm font-medium">
                              Stack Trace
                            </summary>
                            <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                              {error.stackTrace}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      {error.status === 'unresolved' && (
                        <Button
                          size="sm"
                          onClick={() => handleResolveError(error.id)}
                        >
                          Resolve
                        </Button>
                      )}
                      <Badge variant={error.status === 'resolved' ? 'secondary' : 'destructive'}>
                        {error.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Error Types</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics?.topErrorTypes.map((errorType, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <span className="font-medium">{errorType.type}</span>
                    <Badge variant="secondary">{errorType.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Error Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics && Object.entries(analytics.errorDistribution).map(([severity, count]) => (
                    <div key={severity} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge className={getSeverityColor(severity)}>{severity}</Badge>
                      </div>
                      <span className="font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Alert>
            <TrendingUp className="h-4 w-4" />
            <AlertDescription>
              Trend analysis and historical data visualization will be displayed here.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedErrorDashboard;
