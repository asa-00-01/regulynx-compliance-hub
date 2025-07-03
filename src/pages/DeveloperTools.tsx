
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
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

              <TabsContent value="optimization" className="space-y-6">
                <OptimizationCenter embedded={true} />
              </TabsContent>

              <TabsContent value="system-health" className="space-y-6">
                <Card>
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

              <TabsContent value="security" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
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
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Monitor className="h-5 w-5" />
                        Security Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        <SecurityMonitor />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="dev-panel" className="space-y-6">
                <Card>
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
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeveloperTools;
