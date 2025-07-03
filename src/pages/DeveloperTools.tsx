
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Settings, 
  Activity, 
  Shield, 
  Zap, 
  Code,
  Monitor
} from 'lucide-react';
import OptimizationCenter from '@/components/common/OptimizationCenter';
import SystemHealthMonitor from '@/components/common/SystemHealthMonitor';
import SecurityAuditLog from '@/components/security/SecurityAuditLog';
import DeveloperPanel from '@/components/dev/DeveloperPanel';
import SecurityMonitor from '@/components/security/SecurityMonitor';

const DeveloperTools: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="w-full max-w-full overflow-hidden">
        <div className="space-y-6">
          <div className="border-b pb-4">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Developer Tools
            </h1>
            <p className="text-muted-foreground mt-2">
              Advanced development and optimization tools for administrators and developers.
            </p>
          </div>
          
          <Tabs defaultValue="optimization" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="optimization" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">Optimization</span>
              </TabsTrigger>
              <TabsTrigger value="system-health" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                <span className="hidden sm:inline">System Health</span>
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Security</span>
              </TabsTrigger>
              <TabsTrigger value="dev-panel" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Configuration</span>
              </TabsTrigger>
            </TabsList>

            <div className="w-full max-w-full">
              <TabsContent value="optimization" className="space-y-6 w-full">
                <div className="w-full max-w-full overflow-hidden">
                  <OptimizationCenter embedded={true} />
                </div>
              </TabsContent>

              <TabsContent value="system-health" className="space-y-6 w-full">
                <Card className="w-full max-w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Health Monitor
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <SystemHealthMonitor />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="security" className="space-y-6 w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-full">
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Security Audit Log
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <SecurityAuditLog embedded={true} />
                    </CardContent>
                  </Card>
                  
                  <Card className="w-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Security Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <SecurityMonitor />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="dev-panel" className="space-y-6 w-full">
                <Card className="w-full max-w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Development Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DeveloperPanel embedded={true} />
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeveloperTools;
