
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/layout/DashboardLayout';
import KYCMonitoringDashboard from '@/components/compliance/KYCMonitoringDashboard';
import RiskScoringEngine from '@/components/compliance/RiskScoringEngine';
import ComplianceCaseManagement from '@/components/compliance/ComplianceCaseManagement';
import RedFlagsAlerts from '@/components/compliance/RedFlagsAlerts';
import UserActivityLogs from '@/components/compliance/UserActivityLogs';
import { usePermissions } from '@/hooks/use-permissions';

const Compliance = () => {
  const [activeTab, setActiveTab] = useState('kyc-monitoring');
  const { canManageCases } = usePermissions();
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Compliance & Risk Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage KYC compliance, risk scores, and compliance cases
          </p>
        </div>

        <Tabs 
          defaultValue="kyc-monitoring" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="kyc-monitoring">KYC Monitoring</TabsTrigger>
            <TabsTrigger value="risk-scoring">Risk Scoring</TabsTrigger>
            <TabsTrigger value="case-management">Case Management</TabsTrigger>
            <TabsTrigger value="alerts">Red Flags & Alerts</TabsTrigger>
            <TabsTrigger value="activity-logs">Activity Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kyc-monitoring" className="space-y-4">
            <KYCMonitoringDashboard />
          </TabsContent>
          
          <TabsContent value="risk-scoring" className="space-y-4">
            <RiskScoringEngine />
          </TabsContent>
          
          <TabsContent value="case-management" className="space-y-4">
            <ComplianceCaseManagement />
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-4">
            <RedFlagsAlerts />
          </TabsContent>
          
          <TabsContent value="activity-logs" className="space-y-4">
            <UserActivityLogs />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Compliance;
