
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import DashboardLayout from '@/components/layout/DashboardLayout';
import KYCMonitoringDashboard from '@/components/compliance/KYCMonitoringDashboard';
import RiskScoringEngine from '@/components/compliance/RiskScoringEngine';
import ComplianceCaseManagement from '@/components/compliance/ComplianceCaseManagement';
import RedFlagsAlerts from '@/components/compliance/RedFlagsAlerts';
import UserActivityLogs from '@/components/compliance/UserActivityLogs';
import { usePermissions } from '@/hooks/use-permissions';
import { UserCheck, CircleDollarSign, FileSearch, Shield, FileText, AlertTriangle, Users } from 'lucide-react';
import UserOverviewSection from '@/components/compliance/UserOverviewSection';

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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link to="/kyc-verification">
            <div className="h-full">
              <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center space-y-2">
                <UserCheck className="h-10 w-10 text-blue-500" />
                <span className="font-medium">KYC Verification</span>
              </Button>
            </div>
          </Link>
          
          <Link to="/compliance-cases">
            <div className="h-full">
              <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center space-y-2">
                <FileText className="h-10 w-10 text-purple-500" />
                <span className="font-medium">Compliance Cases</span>
              </Button>
            </div>
          </Link>
          
          <Link to="/aml-monitoring">
            <div className="h-full">
              <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center space-y-2">
                <CircleDollarSign className="h-10 w-10 text-green-500" />
                <span className="font-medium">AML Monitoring</span>
              </Button>
            </div>
          </Link>
          
          <Link to="/sar-center">
            <div className="h-full">
              <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center space-y-2">
                <AlertTriangle className="h-10 w-10 text-amber-500" />
                <span className="font-medium">SAR Center</span>
              </Button>
            </div>
          </Link>
          
          <Link to="/user-case">
            <div className="h-full">
              <Button variant="outline" className="w-full h-full p-6 flex flex-col items-center justify-center space-y-2">
                <Users className="h-10 w-10 text-indigo-500" />
                <span className="font-medium">User Case View</span>
              </Button>
            </div>
          </Link>
        </div>

        <Tabs 
          defaultValue="kyc-monitoring" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-6 gap-2">
            <TabsTrigger value="kyc-monitoring">KYC Monitoring</TabsTrigger>
            <TabsTrigger value="risk-scoring">Risk Scoring</TabsTrigger>
            <TabsTrigger value="case-management">Case Management</TabsTrigger>
            <TabsTrigger value="alerts">Red Flags & Alerts</TabsTrigger>
            <TabsTrigger value="activity-logs">Activity Logs</TabsTrigger>
            <TabsTrigger value="user-overview">User Overview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="kyc-monitoring" className="space-y-4">
            <KYCMonitoringDashboard />
          </TabsContent>
          
          <TabsContent value="risk-scoring" className="space-y-4">
            <RiskScoringEngine />
          </TabsContent>
          
          <TabsContent value="case-management" className="space-y-4">
            <div className="mb-4 flex justify-end">
              <Link to="/compliance-cases">
                <Button>
                  View Full Case Management Module
                </Button>
              </Link>
            </div>
            <ComplianceCaseManagement />
          </TabsContent>
          
          <TabsContent value="alerts" className="space-y-4">
            <RedFlagsAlerts />
          </TabsContent>
          
          <TabsContent value="activity-logs" className="space-y-4">
            <UserActivityLogs />
          </TabsContent>
          
          <TabsContent value="user-overview" className="space-y-4">
            <UserOverviewSection />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Compliance;
