import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { 
  Activity, 
  Database, 
  Server, 
  Globe, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
  Shield,
  HardDrive,
  Cpu,
  Network
} from 'lucide-react';

interface SystemMetrics {
  cpu: {
    usage: number;
    cores: number;
    temperature: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  memory: {
    used: number;
    total: number;
    usage: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  disk: {
    used: number;
    total: number;
    usage: number;
    status: 'healthy' | 'warning' | 'critical';
  };
  network: {
    bandwidth: number;
    latency: number;
    status: 'healthy' | 'warning' | 'critical';
  };
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  uptime: number;
  lastCheck: string;
  endpoint: string;
}

interface DatabaseHealth {
  status: 'healthy' | 'warning' | 'critical';
  connections: number;
  maxConnections: number;
  activeQueries: number;
  slowQueries: number;
  replicationLag: number;
  lastBackup: string;
  backupSize: number;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  score: number;
  lastUpdated: string;
  metrics: SystemMetrics;
  services: ServiceStatus[];
  database: DatabaseHealth;
  alerts: SystemAlert[];
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  resolved: boolean;
  component: string;
}

const SystemHealthMonitor: React.FC = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Sample system health data
  const sampleHealth: SystemHealth = {
    overall: 'healthy',
    score: 92,
    lastUpdated: new Date().toISOString(),
    metrics: {
      cpu: {
        usage: 45,
        cores: 8,
        temperature: 65,
        status: 'healthy'
      },
      memory: {
        used: 6.2,
        total: 16,
        usage: 38.75,
        status: 'healthy'
      },
      disk: {
        used: 120,
        total: 500,
        usage: 24,
        status: 'healthy'
      },
      network: {
        bandwidth: 85,
        latency: 12,
        status: 'healthy'
      }
    },
    services: [
      {
        name: 'API Gateway',
        status: 'online',
        responseTime: 45,
        uptime: 99.98,
        lastCheck: new Date().toISOString(),
        endpoint: 'https://api.regulynx.com/health'
      },
      {
        name: 'Database',
        status: 'online',
        responseTime: 12,
        uptime: 99.99,
        lastCheck: new Date().toISOString(),
        endpoint: 'postgresql://localhost:5432'
      },
      {
        name: 'Authentication Service',
        status: 'online',
        responseTime: 23,
        uptime: 99.95,
        lastCheck: new Date().toISOString(),
        endpoint: 'https://auth.regulynx.com/health'
      },
      {
        name: 'File Storage',
        status: 'online',
        responseTime: 67,
        uptime: 99.92,
        lastCheck: new Date().toISOString(),
        endpoint: 'https://storage.regulynx.com/health'
      },
      {
        name: 'Email Service',
        status: 'degraded',
        responseTime: 234,
        uptime: 98.5,
        lastCheck: new Date().toISOString(),
        endpoint: 'https://email.regulynx.com/health'
      }
    ],
    database: {
      status: 'healthy',
      connections: 45,
      maxConnections: 100,
      activeQueries: 12,
      slowQueries: 2,
      replicationLag: 0,
      lastBackup: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
      backupSize: 2.5 // GB
    },
    alerts: [
      {
        id: '1',
        type: 'warning',
        message: 'Email service response time is above normal threshold',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        resolved: false,
        component: 'Email Service'
      },
      {
        id: '2',
        type: 'info',
        message: 'Scheduled database backup completed successfully',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
        resolved: true,
        component: 'Database'
      }
    ]
  };

  useEffect(() => {
    loadSystemHealth();
    
    if (autoRefresh) {
      const interval = setInterval(loadSystemHealth, refreshInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval]);

  const loadSystemHealth = async () => {
    setLoading(true);
    try {
      // TODO: Load real system health data from API
      console.log('Loading system health data...');
      
      // Simulate API call with slight variations
      const simulatedHealth = {
        ...sampleHealth,
        score: Math.max(85, Math.min(98, sampleHealth.score + (Math.random() - 0.5) * 10)),
        lastUpdated: new Date().toISOString(),
        metrics: {
          ...sampleHealth.metrics,
          cpu: {
            ...sampleHealth.metrics.cpu,
            usage: Math.max(30, Math.min(70, sampleHealth.metrics.cpu.usage + (Math.random() - 0.5) * 20))
          },
          memory: {
            ...sampleHealth.metrics.memory,
            usage: Math.max(25, Math.min(60, sampleHealth.metrics.memory.usage + (Math.random() - 0.5) * 20))
          }
        }
      };
      
      setHealth(simulatedHealth);
    } catch (error) {
      console.error('Error loading system health:', error);
      toast({
        title: 'Error',
        description: 'Failed to load system health data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
      case 'offline':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getOverallScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!health) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading system health...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">System Health Monitor</h2>
          <p className="text-muted-foreground">
            Real-time monitoring of system performance and services
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadSystemHealth} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Overall Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Overall System Health
          </CardTitle>
          <CardDescription>
            Last updated: {new Date(health.lastUpdated).toLocaleString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getOverallScoreColor(health.score)}`}>
                {health.score}%
              </div>
              <div className="text-sm text-muted-foreground">Health Score</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2">
                {getStatusIcon(health.overall)}
                <span className="text-lg font-medium capitalize">{health.overall}</span>
              </div>
              <div className="text-sm text-muted-foreground">System Status</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-medium">
                {health.alerts.filter(a => !a.resolved).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Cpu className="h-4 w-4" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{health.metrics.cpu.usage}%</span>
                    <span className="text-muted-foreground">{health.metrics.cpu.cores} cores</span>
                  </div>
                  <Progress value={health.metrics.cpu.usage} className="h-2" />
                  <div className="flex items-center gap-2 text-xs">
                    {getStatusIcon(health.metrics.cpu.status)}
                    <span className="capitalize">{health.metrics.cpu.status}</span>
                    <span className="text-muted-foreground">
                      {health.metrics.cpu.temperature}°C
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
                             <CardHeader className="pb-2">
                 <CardTitle className="flex items-center gap-2 text-sm">
                   <Activity className="h-4 w-4" />
                   Memory Usage
                 </CardTitle>
               </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{health.metrics.memory.usage.toFixed(1)}%</span>
                    <span className="text-muted-foreground">
                      {health.metrics.memory.used}GB / {health.metrics.memory.total}GB
                    </span>
                  </div>
                  <Progress value={health.metrics.memory.usage} className="h-2" />
                  <div className="flex items-center gap-2 text-xs">
                    {getStatusIcon(health.metrics.memory.status)}
                    <span className="capitalize">{health.metrics.memory.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <HardDrive className="h-4 w-4" />
                  Disk Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{health.metrics.disk.usage}%</span>
                    <span className="text-muted-foreground">
                      {health.metrics.disk.used}GB / {health.metrics.disk.total}GB
                    </span>
                  </div>
                  <Progress value={health.metrics.disk.usage} className="h-2" />
                  <div className="flex items-center gap-2 text-xs">
                    {getStatusIcon(health.metrics.disk.status)}
                    <span className="capitalize">{health.metrics.disk.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Network className="h-4 w-4" />
                  Network
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{health.metrics.network.bandwidth}%</span>
                    <span className="text-muted-foreground">
                      {health.metrics.network.latency}ms
                    </span>
                  </div>
                  <Progress value={health.metrics.network.bandwidth} className="h-2" />
                  <div className="flex items-center gap-2 text-xs">
                    {getStatusIcon(health.metrics.network.status)}
                    <span className="capitalize">{health.metrics.network.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Service Status
              </CardTitle>
              <CardDescription>
                Real-time status of all system services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {health.services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <h3 className="font-medium">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.endpoint}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-sm font-medium">{service.responseTime}ms</div>
                          <div className="text-xs text-muted-foreground">Response Time</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{service.uptime}%</div>
                          <div className="text-xs text-muted-foreground">Uptime</div>
                        </div>
                        <Badge className={getStatusColor(service.status)}>
                          {service.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Health
              </CardTitle>
              <CardDescription>
                Database performance and connection metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge className={getStatusColor(health.database.status)}>
                      {health.database.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Connections</span>
                      <span>{health.database.connections} / {health.database.maxConnections}</span>
                    </div>
                    <Progress value={(health.database.connections / health.database.maxConnections) * 100} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="font-medium">{health.database.activeQueries}</div>
                      <div className="text-muted-foreground">Active Queries</div>
                    </div>
                    <div>
                      <div className="font-medium">{health.database.slowQueries}</div>
                      <div className="text-muted-foreground">Slow Queries</div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Replication Lag</span>
                      <span>{health.database.replicationLag}ms</span>
                    </div>
                    <Progress value={Math.min(100, (health.database.replicationLag / 1000) * 100)} className="h-2" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Last Backup</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(health.database.lastBackup).toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Size: {health.database.backupSize} GB
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                System Alerts
              </CardTitle>
              <CardDescription>
                Active and resolved system alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {health.alerts.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Active Alerts</h3>
                    <p className="text-muted-foreground">All systems are operating normally.</p>
                  </div>
                ) : (
                  health.alerts.map((alert) => (
                    <div key={alert.id} className={`p-4 border rounded-lg ${alert.resolved ? 'bg-gray-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getStatusIcon(alert.type)}
                          <div>
                            <h3 className="font-medium">{alert.message}</h3>
                            <p className="text-sm text-muted-foreground">
                              {alert.component} • {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {alert.resolved && (
                            <Badge variant="secondary">Resolved</Badge>
                          )}
                          <Badge className={getStatusColor(alert.type)}>
                            {alert.type.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthMonitor;
