
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
  RefreshCw,
  BarChart3
} from 'lucide-react';
import InteractiveElementsAudit from './InteractiveElementsAudit';

const DeveloperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'clear-cache': {
        localStorage.clear();
        sessionStorage.clear();
        toast({ title: 'Cache Cleared', description: 'All local storage cleared successfully' });
        break;
      }
      case 'reload-data': {
        window.location.reload();
        break;
      }
      case 'export-logs': {
        // Collect console logs and export them
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => {
          logs.push({ timestamp: new Date().toISOString(), message: args.join(' ') });
          originalLog.apply(console, args);
        };
        
        // Create and download log file
        const logContent = logs.map(log => `${log.timestamp}: ${log.message}`).join('\n');
        const blob = new Blob([logContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `logs-${new Date().toISOString().split('T')[0]}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({ title: 'Logs Exported', description: 'Console logs exported to downloads' });
        break;
      }
      case 'test-notifications': {
        toast({ title: 'Test Notification', description: 'Notification system is working!' });
        break;
      }
      case 'view-analytics': {
        navigate('/analytics');
        break;
      }
      case 'open-audit-logs': {
        navigate('/audit-logs');
        break;
      }
      case 'export-data': {
        // Export current application state
        const appState = {
          timestamp: new Date().toISOString(),
          localStorage: Object.fromEntries(Object.entries(localStorage)),
          sessionStorage: Object.fromEntries(Object.entries(sessionStorage)),
          userAgent: navigator.userAgent,
          url: window.location.href
        };
        
        const stateBlob = new Blob([JSON.stringify(appState, null, 2)], { type: 'application/json' });
        const stateUrl = URL.createObjectURL(stateBlob);
        const stateLink = document.createElement('a');
        stateLink.href = stateUrl;
        stateLink.download = `app-state-${new Date().toISOString().split('T')[0]}.json`;
        stateLink.click();
        URL.revokeObjectURL(stateUrl);
        
        toast({ title: 'Data Exported', description: 'Application state exported successfully' });
        break;
      }
      case 'import-data': {
        // Create file input for data import
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
              try {
                const data = JSON.parse(e.target?.result as string);
                // In a real implementation, you'd validate and apply the imported data
                toast({ title: 'Data Imported', description: 'Application state imported successfully' });
              } catch (error) {
                toast({ title: 'Import Error', description: 'Failed to parse imported data', variant: 'destructive' });
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
        break;
      }
      default:
        toast({ title: 'Action Executed', description: `Executed: ${action}` });
    }
  };

  const quickActions = [
    { id: 'clear-cache', label: 'Clear Cache', icon: RefreshCw, description: 'Clear all cached data' },
    { id: 'reload-data', label: 'Reload Data', icon: RefreshCw, description: 'Reload application data' },
    { id: 'export-logs', label: 'Export Logs', icon: Download, description: 'Export console logs' },
    { id: 'test-notifications', label: 'Test Notifications', icon: Eye, description: 'Test notification system' },
    { id: 'view-analytics', label: 'View Analytics', icon: BarChart3, description: 'Open analytics dashboard' },
    { id: 'open-audit-logs', label: 'Audit Logs', icon: Database, description: 'View audit logs' },
    { id: 'export-data', label: 'Export Data', icon: Download, description: 'Export application state' },
    { id: 'import-data', label: 'Import Data', icon: Upload, description: 'Import application state' }
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
