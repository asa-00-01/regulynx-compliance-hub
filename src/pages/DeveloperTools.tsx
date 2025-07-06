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
  Monitor,
  CheckCircle,
  Globe,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import OptimizationCenter from '@/components/common/OptimizationCenter';
import SystemHealthMonitor from '@/components/common/SystemHealthMonitor';
import SecurityAuditLog from '@/components/security/SecurityAuditLog';
import DeveloperPanel from '@/components/dev/DeveloperPanel';
import SecurityMonitor from '@/components/security/SecurityMonitor';
import EnvironmentChecker from '@/components/common/EnvironmentChecker';
import ProductionReadinessChecker from '@/components/common/ProductionReadinessChecker';
import HelpPanel from '@/components/common/HelpPanel';
import AnalyticsContent from '@/components/dev/AnalyticsContent';
import PerformanceContent from '@/components/dev/PerformanceContent';

const DeveloperTools: React.FC = () => {
  return (
    <DashboardLayout>
      <div 
        id="developer-tools-page"
        className="developer-tools-container flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-full overflow-hidden"
      >
        <div 
          id="developer-tools-header"
          className="developer-tools-header border-b pb-4"
        >
          <h1 
            id="developer-tools-title"
            className="developer-tools-title text-3xl font-bold tracking-tight text-foreground"
          >
            Developer Tools
          </h1>
          <p 
            id="developer-tools-subtitle"
            className="developer-tools-subtitle text-muted-foreground mt-2"
          >
            Advanced development and optimization tools for administrators and developers.
          </p>
        </div>
        
        <Tabs 
          id="developer-tools-tabs"
          defaultValue="optimization" 
          className="developer-tools-tabs w-full"
        >
          <TabsList 
            id="developer-tools-tabs-list"
            className="developer-tools-tabs-navigation grid w-full grid-cols-9 mb-6"
          >
            <TabsTrigger 
              id="optimization-tab"
              value="optimization" 
              className="optimization-tab-trigger flex items-center gap-2"
            >
              <Zap className="h-4 w-4" />
              <span className="hidden sm:inline">Optimization</span>
            </TabsTrigger>
            <TabsTrigger 
              id="analytics-tab"
              value="analytics" 
              className="analytics-tab-trigger flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger 
              id="performance-tab"
              value="performance" 
              className="performance-tab-trigger flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger 
              id="production-readiness-tab"
              value="production-readiness" 
              className="production-readiness-tab-trigger flex items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Production</span>
            </TabsTrigger>
            <TabsTrigger 
              id="environment-tab"
              value="environment" 
              className="environment-tab-trigger flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">Environment</span>
            </TabsTrigger>
            <TabsTrigger 
              id="system-health-tab"
              value="system-health" 
              className="system-health-tab-trigger flex items-center gap-2"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">System Health</span>
            </TabsTrigger>
            <TabsTrigger 
              id="security-tab"
              value="security" 
              className="security-tab-trigger flex items-center gap-2"
            >
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
            <TabsTrigger 
              id="help-tab"
              value="help" 
              className="help-tab-trigger flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Help</span>
            </TabsTrigger>
            <TabsTrigger 
              id="dev-panel-tab"
              value="dev-panel" 
              className="dev-panel-tab-trigger flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configuration</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent 
            id="optimization-content"
            value="optimization" 
            className="optimization-tab-content space-y-4"
          >
            <OptimizationCenter embedded={true} />
          </TabsContent>

          <TabsContent 
            id="analytics-content"
            value="analytics" 
            className="analytics-tab-content space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Analytics Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <AnalyticsContent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent 
            id="performance-content"
            value="performance" 
            className="performance-tab-content space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Performance Dashboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <PerformanceContent />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent 
            id="production-readiness-content"
            value="production-readiness" 
            className="production-readiness-tab-content space-y-4"
          >
            <ProductionReadinessChecker />
          </TabsContent>

          <TabsContent 
            id="environment-content"
            value="environment" 
            className="environment-tab-content space-y-4"
          >
            <EnvironmentChecker />
          </TabsContent>

          <TabsContent 
            id="system-health-content"
            value="system-health" 
            className="system-health-tab-content space-y-4"
          >
            <Card 
              id="system-health-card"
              className="system-health-monitor-card"
            >
              <CardHeader 
                id="system-health-card-header"
                className="system-health-card-header"
              >
                <CardTitle 
                  id="system-health-card-title"
                  className="system-health-card-title flex items-center gap-2"
                >
                  <Activity className="h-5 w-5" />
                  System Health Monitor
                </CardTitle>
              </CardHeader>
              <CardContent 
                id="system-health-card-content"
                className="system-health-card-content"
              >
                <SystemHealthMonitor />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent 
            id="security-content"
            value="security" 
            className="security-tab-content space-y-4"
          >
            <div 
              id="security-grid-container"
              className="security-dashboard-grid grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <Card 
                id="security-audit-card"
                className="security-audit-log-card"
              >
                <CardHeader 
                  id="security-audit-card-header"
                  className="security-audit-card-header"
                >
                  <CardTitle 
                    id="security-audit-card-title"
                    className="security-audit-card-title flex items-center gap-2"
                  >
                    <Shield className="h-5 w-5" />
                    Security Audit Log
                  </CardTitle>
                </CardHeader>
                <CardContent 
                  id="security-audit-card-content"
                  className="security-audit-card-content p-0"
                >
                  <SecurityAuditLog embedded={true} />
                </CardContent>
              </Card>
              
              <Card 
                id="security-monitor-card"
                className="security-status-monitor-card"
              >
                <CardHeader 
                  id="security-monitor-card-header"
                  className="security-monitor-card-header"
                >
                  <CardTitle 
                    id="security-monitor-card-title"
                    className="security-monitor-card-title flex items-center gap-2"
                  >
                    <Monitor className="h-5 w-5" />
                    Security Status
                  </CardTitle>
                </CardHeader>
                <CardContent 
                  id="security-monitor-card-content"
                  className="security-monitor-card-content"
                >
                  <SecurityMonitor embedded={true} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent 
            id="help-content"
            value="help" 
            className="help-tab-content space-y-4"
          >
            <HelpPanel />
          </TabsContent>

          <TabsContent 
            id="dev-panel-content"
            value="dev-panel" 
            className="dev-panel-tab-content space-y-4"
          >
            <Card 
              id="dev-configuration-card"
              className="developer-configuration-card"
            >
              <CardHeader 
                id="dev-configuration-card-header"
                className="dev-configuration-card-header"
              >
                <CardTitle 
                  id="dev-configuration-card-title"
                  className="dev-configuration-card-title flex items-center gap-2"
                >
                  <Code className="h-5 w-5" />
                  Development Configuration
                </CardTitle>
              </CardHeader>
              <CardContent 
                id="dev-configuration-card-content"
                className="dev-configuration-card-content"
              >
                <DeveloperPanel embedded={true} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default DeveloperTools;
