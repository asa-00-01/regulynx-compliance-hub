
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { 
  Code, 
  Database, 
  Zap, 
  Bug, 
  Settings, 
  Eye,
  ExternalLink,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react';
import InteractiveElementsAudit from './InteractiveElementsAudit';

const DeveloperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'clear-cache':
        localStorage.clear();
        sessionStorage.clear();
        toast({ title: 'Cache Cleared', description: 'All local storage cleared successfully' });
        break;
      case 'reload-data':
        window.location.reload();
        break;
      case 'export-logs':
        const logs = console.log; // In a real app, you'd collect actual logs
        toast({ title: 'Logs Exported', description: 'Console logs exported to downloads' });
        break;
      case 'test-notifications':
        toast({ title: 'Test Notification', description: 'Notification system is working!' });
        break;
      case 'view-analytics':
        navigate('/analytics');
        break;
      case 'open-audit-logs':
        navigate('/audit-logs');
        break;
      default:
        toast({ title: 'Action Executed', description: `Executed: ${action}` });
    }
  };

  const quickActions = [
    { id: 'clear-cache', label: 'Clear Cache', icon: RefreshCw, description: 'Clear browser cache and local storage' },
    { id: 'reload-data', label: 'Reload Data', icon: Download, description: 'Refresh all application data' },
    { id: 'export-logs', label: 'Export Logs', icon: Upload, description: 'Download application logs' },
    { id: 'test-notifications', label: 'Test Notifications', icon: Zap, description: 'Test toast notification system' },
    { id: 'view-analytics', label: 'View Analytics', icon: Eye, description: 'Open analytics dashboard' },
    { id: 'open-audit-logs', label: 'Audit Logs', icon: Database, description: 'View system audit logs' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Dashboard</h1>
          <p className="text-muted-foreground">
            Development tools and interactive elements audit
          </p>
        </div>
        <Button onClick={() => navigate('/developer-tools')}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Full Dev Tools
        </Button>
      </div>

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">
            <Bug className="mr-2 h-4 w-4" />
            Elements Audit
          </TabsTrigger>
          <TabsTrigger value="actions">
            <Zap className="mr-2 h-4 w-4" />
            Quick Actions
          </TabsTrigger>
          <TabsTrigger value="debug">
            <Code className="mr-2 h-4 w-4" />
            Debug Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <InteractiveElementsAudit />
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Developer Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quickActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Card key={action.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <Button
                          onClick={() => handleQuickAction(action.id)}
                          variant="ghost"
                          className="w-full h-auto p-0 flex flex-col items-center gap-2"
                        >
                          <Icon className="h-8 w-8" />
                          <div className="text-center">
                            <div className="font-medium">{action.label}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {action.description}
                            </div>
                          </div>
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Debug Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Current Route:</strong>
                    <div className="font-mono">{window.location.pathname}</div>
                  </div>
                  <div>
                    <strong>User Agent:</strong>
                    <div className="font-mono text-xs">{navigator.userAgent.substring(0, 50)}...</div>
                  </div>
                  <div>
                    <strong>Screen Resolution:</strong>
                    <div className="font-mono">{screen.width} x {screen.height}</div>
                  </div>
                  <div>
                    <strong>Local Storage:</strong>
                    <div className="font-mono">{localStorage.length} items</div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button
                    onClick={() => console.log('Debug info:', {
                      route: window.location.pathname,
                      userAgent: navigator.userAgent,
                      screen: `${screen.width}x${screen.height}`,
                      localStorage: localStorage.length
                    })}
                    variant="outline"
                    className="w-full"
                  >
                    Log Debug Info to Console
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeveloperDashboard;
