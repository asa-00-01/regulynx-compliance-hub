
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Rocket, 
  GitBranch, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Package,
  Calendar,
  User,
  Download,
  Upload,
  Settings,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface Release {
  id: string;
  version: string;
  name: string;
  status: 'draft' | 'scheduled' | 'deploying' | 'deployed' | 'failed' | 'rolled-back';
  createdBy: string;
  createdAt: string;
  scheduledAt?: string;
  deployedAt?: string;
  description: string;
  changes: string[];
  environments: {
    name: string;
    status: 'pending' | 'deploying' | 'deployed' | 'failed';
    deployedAt?: string;
  }[];
  rollbackAvailable: boolean;
}

const ReleaseManagement = () => {
  const [selectedRelease, setSelectedRelease] = useState<string | null>(null);

  // Mock data - replace with actual data fetching
  const releases: Release[] = [
    {
      id: '1',
      version: 'v2.1.0',
      name: 'Enhanced API Authentication',
      status: 'deployed',
      createdBy: 'John Doe',
      createdAt: '2024-01-15T10:00:00Z',
      deployedAt: '2024-01-15T14:30:00Z',
      description: 'Improved authentication mechanisms and new OAuth 2.0 support',
      changes: [
        'Added OAuth 2.0 authentication flow',
        'Enhanced API key security',
        'Improved error handling for auth failures',
        'Added rate limiting for authentication endpoints'
      ],
      environments: [
        { name: 'Development', status: 'deployed', deployedAt: '2024-01-15T12:00:00Z' },
        { name: 'Staging', status: 'deployed', deployedAt: '2024-01-15T13:15:00Z' },
        { name: 'Production', status: 'deployed', deployedAt: '2024-01-15T14:30:00Z' }
      ],
      rollbackAvailable: true
    },
    {
      id: '2',
      version: 'v2.0.3',
      name: 'Bug Fixes and Performance',
      status: 'deployed',
      createdBy: 'Jane Smith',
      createdAt: '2024-01-10T09:00:00Z',
      deployedAt: '2024-01-10T16:00:00Z',
      description: 'Critical bug fixes and performance improvements',
      changes: [
        'Fixed memory leak in webhook processing',
        'Improved database query performance',
        'Fixed race condition in data synchronization',
        'Updated dependencies for security patches'
      ],
      environments: [
        { name: 'Development', status: 'deployed', deployedAt: '2024-01-10T11:00:00Z' },
        { name: 'Staging', status: 'deployed', deployedAt: '2024-01-10T14:00:00Z' },
        { name: 'Production', status: 'deployed', deployedAt: '2024-01-10T16:00:00Z' }
      ],
      rollbackAvailable: true
    },
    {
      id: '3',
      version: 'v2.2.0',
      name: 'Advanced Monitoring Features',
      status: 'scheduled',
      createdBy: 'Mike Johnson',
      createdAt: '2024-01-20T11:00:00Z',
      scheduledAt: '2024-01-25T15:00:00Z',
      description: 'New monitoring and alerting capabilities',
      changes: [
        'Real-time performance metrics dashboard',
        'Advanced alerting system',
        'Custom monitoring rules engine',
        'Integration health scoring'
      ],
      environments: [
        { name: 'Development', status: 'deployed', deployedAt: '2024-01-20T13:00:00Z' },
        { name: 'Staging', status: 'pending' },
        { name: 'Production', status: 'pending' }
      ],
      rollbackAvailable: false
    }
  ];

  const getStatusColor = (status: Release['status']) => {
    switch (status) {
      case 'deployed': return 'bg-green-500';
      case 'deploying': return 'bg-blue-500';
      case 'scheduled': return 'bg-orange-500';
      case 'failed': return 'bg-red-500';
      case 'rolled-back': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusIcon = (status: Release['status']) => {
    switch (status) {
      case 'deployed': return <CheckCircle className="h-4 w-4" />;
      case 'deploying': return <Clock className="h-4 w-4" />;
      case 'scheduled': return <Calendar className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'rolled-back': return <RotateCcw className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleDeploy = (releaseId: string) => {
    console.log('Deploying release:', releaseId);
    // Implement deployment logic
  };

  const handleRollback = (releaseId: string) => {
    console.log('Rolling back release:', releaseId);
    // Implement rollback logic
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Release Management</h2>
          <p className="text-muted-foreground">
            Manage and deploy releases across environments
          </p>
        </div>
        <Button>
          <Rocket className="mr-2 h-4 w-4" />
          Create Release
        </Button>
      </div>

      <Tabs defaultValue="releases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="releases">
            <Package className="mr-2 h-4 w-4" />
            Releases
          </TabsTrigger>
          <TabsTrigger value="deployments">
            <Rocket className="mr-2 h-4 w-4" />
            Deployments
          </TabsTrigger>
          <TabsTrigger value="environments">
            <Settings className="mr-2 h-4 w-4" />
            Environments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="releases" className="space-y-4">
          <div className="grid gap-4">
            {releases.map((release) => (
              <Card key={release.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{release.name}</CardTitle>
                        <Badge variant="outline">{release.version}</Badge>
                        <Badge className={getStatusColor(release.status)}>
                          {getStatusIcon(release.status)}
                          <span className="ml-1 capitalize">{release.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {release.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {release.status === 'scheduled' && (
                        <Button size="sm" onClick={() => handleDeploy(release.id)}>
                          <Play className="mr-1 h-3 w-3" />
                          Deploy Now
                        </Button>
                      )}
                      {release.rollbackAvailable && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleRollback(release.id)}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          Rollback
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {release.createdBy}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(release.createdAt).toLocaleDateString()}
                      </div>
                      {release.scheduledAt && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Scheduled: {new Date(release.scheduledAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      {release.environments.map((env) => (
                        <div key={env.name} className="flex items-center justify-between p-2 border rounded">
                          <span className="text-sm font-medium">{env.name}</span>
                          <Badge 
                            variant={env.status === 'deployed' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {env.status}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Changes:</h4>
                      <ul className="text-sm text-muted-foreground space-y-0.5">
                        {release.changes.slice(0, 2).map((change, index) => (
                          <li key={index} className="flex items-start gap-1">
                            <span className="text-xs mt-1">•</span>
                            {change}
                          </li>
                        ))}
                        {release.changes.length > 2 && (
                          <li className="text-xs">+{release.changes.length - 2} more changes</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="deployments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">v2.2.0 - Advanced Monitoring Features</h3>
                  <Badge className="bg-blue-500">In Progress</Badge>
                </div>
                <Progress value={66} className="w-full" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 border rounded">
                    <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-1" />
                    <p className="text-sm font-medium">Development</p>
                    <p className="text-xs text-muted-foreground">Completed</p>
                  </div>
                  <div className="text-center p-3 border rounded bg-blue-50">
                    <Clock className="h-6 w-6 text-blue-500 mx-auto mb-1" />
                    <p className="text-sm font-medium">Staging</p>
                    <p className="text-xs text-muted-foreground">Deploying...</p>
                  </div>
                  <div className="text-center p-3 border rounded">
                    <Package className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                    <p className="text-sm font-medium">Production</p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {['Development', 'Staging', 'Production'].map((env) => (
              <Card key={env}>
                <CardHeader>
                  <CardTitle className="text-lg">{env}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Version:</span>
                    <Badge>v2.1.0</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className="bg-green-500">Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Deploy:</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Settings className="mr-1 h-3 w-3" />
                      Configure
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Download className="mr-1 h-3 w-3" />
                      Logs
                    </Button>
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

export default ReleaseManagement;
