
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Zap,
  Database,
  Globe,
  Server,
  Wifi,
  Shield
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const EnhancedMonitoring = () => {
  const [timeRange, setTimeRange] = useState('1h');
  const [selectedMetric, setSelectedMetric] = useState('response_time');

  // Mock data - replace with actual metrics
  const performanceData = [
    { time: '00:00', response_time: 120, throughput: 450, error_rate: 0.5 },
    { time: '00:15', response_time: 115, throughput: 480, error_rate: 0.3 },
    { time: '00:30', response_time: 140, throughput: 420, error_rate: 0.8 },
    { time: '00:45', response_time: 110, throughput: 520, error_rate: 0.2 },
    { time: '01:00', response_time: 125, throughput: 490, error_rate: 0.4 },
  ];

  const alertData = [
    { id: '1', type: 'critical', message: 'High error rate detected in payment processing', timestamp: '2024-01-20T10:30:00Z', resolved: false },
    { id: '2', type: 'warning', message: 'API response time above threshold', timestamp: '2024-01-20T09:45:00Z', resolved: true },
    { id: '3', type: 'info', message: 'Scheduled maintenance completed successfully', timestamp: '2024-01-20T08:00:00Z', resolved: true },
  ];

  const healthMetrics = [
    { name: 'API Gateway', status: 'healthy', uptime: '99.9%', responseTime: '125ms' },
    { name: 'Database', status: 'healthy', uptime: '99.8%', responseTime: '45ms' },
    { name: 'Authentication Service', status: 'warning', uptime: '98.5%', responseTime: '200ms' },
    { name: 'Webhook Processor', status: 'healthy', uptime: '99.7%', responseTime: '80ms' },
  ];

  const integrationStatus = [
    { name: 'Client A', status: 'active', requests: 1250, errors: 2 },
    { name: 'Client B', status: 'active', requests: 890, errors: 0 },
    { name: 'Client C', status: 'warning', requests: 340, errors: 15 },
    { name: 'Client D', status: 'inactive', requests: 0, errors: 0 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': case 'active': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': case 'error': return 'text-red-500';
      case 'inactive': return 'text-gray-500';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'critical': case 'error': return <AlertTriangle className="h-4 w-4" />;
      case 'inactive': return <Clock className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Enhanced Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time system health and performance monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="15m">15 minutes</SelectItem>
              <SelectItem value="1h">1 hour</SelectItem>
              <SelectItem value="6h">6 hours</SelectItem>
              <SelectItem value="24h">24 hours</SelectItem>
              <SelectItem value="7d">7 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-blue-500" />
              <p className="text-sm font-medium">Avg Response Time</p>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-2xl font-bold">125ms</p>
              <Badge className="bg-green-500">
                <TrendingDown className="h-3 w-3 mr-1" />
                -5%
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium">Throughput</p>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-2xl font-bold">1,245/min</p>
              <Badge className="bg-green-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                +12%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <p className="text-sm font-medium">Error Rate</p>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-2xl font-bold">0.4%</p>
              <Badge className="bg-red-500">
                <TrendingUp className="h-3 w-3 mr-1" />
                +0.1%
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <p className="text-sm font-medium">System Uptime</p>
            </div>
            <div className="flex items-center space-x-2 mt-2">
              <p className="text-2xl font-bold">99.9%</p>
              <Badge className="bg-green-500">Healthy</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList>
          <TabsTrigger value="performance">
            <Activity className="mr-2 h-4 w-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="health">
            <Shield className="mr-2 h-4 w-4" />
            System Health
          </TabsTrigger>
          <TabsTrigger value="alerts">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Alerts
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Globe className="mr-2 h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="response_time">Response Time</SelectItem>
                    <SelectItem value="throughput">Throughput</SelectItem>
                    <SelectItem value="error_rate">Error Rate</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey={selectedMetric} 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid gap-4">
            {healthMetrics.map((metric, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 ${getStatusColor(metric.status)}`}>
                        {getStatusIcon(metric.status)}
                        <h3 className="font-semibold">{metric.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Uptime: </span>
                        <span className="font-medium">{metric.uptime}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Response: </span>
                        <span className="font-medium">{metric.responseTime}</span>
                      </div>
                      <Badge className={metric.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}>
                        {metric.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            {alertData.map((alert) => (
              <Card key={alert.id} className={`border-l-4 ${
                alert.type === 'critical' ? 'border-l-red-500' : 
                alert.type === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'
              }`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className={`h-4 w-4 ${
                        alert.type === 'critical' ? 'text-red-500' : 
                        alert.type === 'warning' ? 'text-yellow-500' : 'text-blue-500'
                      }`} />
                      <p className="font-medium">{alert.message}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                      <Badge variant={alert.resolved ? 'default' : 'destructive'}>
                        {alert.resolved ? 'Resolved' : 'Active'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <div className="grid gap-4">
            {integrationStatus.map((integration, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center space-x-2 ${getStatusColor(integration.status)}`}>
                        {getStatusIcon(integration.status)}
                        <h3 className="font-semibold">{integration.name}</h3>
                      </div>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                      <div>
                        <span className="text-muted-foreground">Requests: </span>
                        <span className="font-medium">{integration.requests.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Errors: </span>
                        <span className={`font-medium ${integration.errors > 0 ? 'text-red-500' : 'text-green-500'}`}>
                          {integration.errors}
                        </span>
                      </div>
                      <Badge className={
                        integration.status === 'active' ? 'bg-green-500' : 
                        integration.status === 'warning' ? 'bg-yellow-500' : 'bg-gray-500'
                      }>
                        {integration.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedMonitoring;
