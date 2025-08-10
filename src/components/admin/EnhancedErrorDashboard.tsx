
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Bug, Clock, Search, Filter, TrendingUp } from 'lucide-react';
import { enhancedErrorTracking, EnhancedError } from '@/services/enhancedErrorTracking';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const EnhancedErrorDashboard: React.FC = () => {
  const [errors, setErrors] = useState<EnhancedError[]>([]);
  const [stats, setStats] = useState<any>({});
  const [selectedError, setSelectedError] = useState<EnhancedError | null>(null);
  const [filter, setFilter] = useState({
    severity: '',
    status: '',
    component: ''
  });

  useEffect(() => {
    loadErrors();
    loadStats();
  }, [filter]);

  const loadErrors = async () => {
    const result = await enhancedErrorTracking.searchErrors({
      severity: filter.severity || undefined,
      status: filter.status || undefined,
      component: filter.component || undefined,
      limit: 100
    });
    setErrors(result);
  };

  const loadStats = () => {
    const errorStats = enhancedErrorTracking.getErrorStats();
    setStats(errorStats);
  };

  const handleStatusUpdate = async (errorId: string, status: EnhancedError['status']) => {
    await enhancedErrorTracking.updateErrorStatus(errorId, status);
    loadErrors();
    loadStats();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'investigating': return 'bg-purple-100 text-purple-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'ignored': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const trendData = stats.recentTrend?.map((count: number, index: number) => ({
    day: `Day ${index + 1}`,
    errors: count
  })) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Enhanced Error Tracking</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Errors</CardTitle>
            <Bug className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stats.bySeverity?.critical || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Errors</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.byStatus?.new || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="h-20">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <Line 
                    type="monotone" 
                    dataKey="errors" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="errors" className="space-y-4">
        <TabsList>
          <TabsTrigger value="errors">Error List</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="errors" className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg">
            <select 
              value={filter.severity} 
              onChange={(e) => setFilter({...filter, severity: e.target.value})}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select 
              value={filter.status} 
              onChange={(e) => setFilter({...filter, status: e.target.value})}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="investigating">Investigating</option>
              <option value="resolved">Resolved</option>
              <option value="ignored">Ignored</option>
            </select>

            <select 
              value={filter.component} 
              onChange={(e) => setFilter({...filter, component: e.target.value})}
              className="px-3 py-2 border rounded-md"
            >
              <option value="">All Components</option>
              <option value="compliance">Compliance</option>
              <option value="kyc">KYC</option>
              <option value="payment">Payment</option>
              <option value="ui">UI</option>
              <option value="auth">Authentication</option>
            </select>
          </div>

          {/* Error List */}
          <div className="space-y-2">
            {errors.map((error) => (
              <Card key={error.id} className="cursor-pointer hover:bg-muted/50" 
                    onClick={() => setSelectedError(error)}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge className={getSeverityColor(error.severity)}>
                          {error.severity}
                        </Badge>
                        <Badge className={getStatusColor(error.status)}>
                          {error.status}
                        </Badge>
                        {error.context.component && (
                          <Badge variant="outline">
                            {error.context.component}
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium mb-1">{error.message}</h4>
                      <p className="text-sm text-muted-foreground">
                        First seen: {new Date(error.firstSeen).toLocaleString()}
                        {error.occurrences > 1 && ` • ${error.occurrences} occurrences`}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {error.status === 'new' && (
                        <Button size="sm" variant="outline" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(error.id, 'investigating');
                                }}>
                          Investigate
                        </Button>
                      )}
                      {error.status === 'investigating' && (
                        <Button size="sm" variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusUpdate(error.id, 'resolved');
                                }}>
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Error Analytics</CardTitle>
              <CardDescription>
                Detailed breakdown of error patterns and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-4">By Severity</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.bySeverity || {}).map(([severity, count]) => (
                      <div key={severity} className="flex justify-between items-center">
                        <Badge className={getSeverityColor(severity)}>
                          {severity}
                        </Badge>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">By Status</h4>
                  <div className="space-y-2">
                    {Object.entries(stats.byStatus || {}).map(([status, count]) => (
                      <div key={status} className="flex justify-between items-center">
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                        <span className="font-medium">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Error Trends</CardTitle>
              <CardDescription>
                Error frequency over the last 7 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="errors" 
                      stroke="#10b981" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Error Detail Modal */}
      {selectedError && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Error Details</CardTitle>
                <Button variant="ghost" onClick={() => setSelectedError(null)}>
                  ×
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Badge className={getSeverityColor(selectedError.severity)}>
                  {selectedError.severity}
                </Badge>
                <Badge className={getStatusColor(selectedError.status)}>
                  {selectedError.status}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Message</h4>
                <p className="text-sm bg-muted p-3 rounded">{selectedError.message}</p>
              </div>

              {selectedError.stack && (
                <div>
                  <h4 className="font-medium mb-2">Stack Trace</h4>
                  <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                    {selectedError.stack}
                  </pre>
                </div>
              )}

              <div>
                <h4 className="font-medium mb-2">Context</h4>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(selectedError.context, null, 2)}
                </pre>
              </div>

              {selectedError.context.breadcrumbs && selectedError.context.breadcrumbs.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Breadcrumbs</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedError.context.breadcrumbs.map((breadcrumb, index) => (
                      <div key={index} className="text-xs p-2 bg-muted rounded">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{breadcrumb.category}</span>
                          <span className="text-muted-foreground">
                            {new Date(breadcrumb.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p>{breadcrumb.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedErrorDashboard;
