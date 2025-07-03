
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Developer Tools
              </h1>
              <p className="text-lg text-muted-foreground mt-2">
                Advanced development and optimization tools for administrators and developers.
              </p>
            </div>
            
            <Tabs defaultValue="optimization" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="optimization" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Optimization
                </TabsTrigger>
                <TabsTrigger value="system-health" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  System Health
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Security
                </TabsTrigger>
                <TabsTrigger value="dev-panel" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Dev Panel
                </TabsTrigger>
                <TabsTrigger value="monitoring" className="flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Monitoring
                </TabsTrigger>
              </TabsList>

              <TabsContent value="optimization" className="mt-6">
                <OptimizationCenter embedded={true} />
              </TabsContent>

              <TabsContent value="system-health" className="mt-6">
                <div className="space-y-6">
                  <div className="bg-card rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Health Monitor
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Monitor application performance, memory usage, and system status in real-time.
                    </p>
                    <SystemHealthMonitor />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="security" className="mt-6">
                <div className="space-y-6">
                  <div className="bg-card rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Security Audit & Monitoring
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Security event logging and real-time security status monitoring.
                    </p>
                    <div className="space-y-4">
                      <SecurityAuditLog />
                      <SecurityMonitor />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="dev-panel" className="mt-6">
                <div className="space-y-6">
                  <div className="bg-card rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Development Configuration
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Override environment configurations and feature flags for development.
                    </p>
                    <DeveloperPanel />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="monitoring" className="mt-6">
                <div className="space-y-6">
                  <div className="bg-card rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Monitor className="h-5 w-5" />
                      Real-time Monitoring
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Combined view of all monitoring tools and real-time system status.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">Security Status</h4>
                        <SecurityMonitor />
                      </div>
                      <div className="space-y-4">
                        <h4 className="font-medium">System Health</h4>
                        <SystemHealthMonitor />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DeveloperTools;
