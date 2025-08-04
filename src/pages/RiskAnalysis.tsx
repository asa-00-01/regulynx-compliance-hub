
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, TrendingUp, Users, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import RiskDistributionChart from '@/components/dashboard/RiskDistributionChart';
import { mockRiskDistribution } from '@/components/aml/mockTransactionData';

const RiskAnalysis = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { t } = useTranslation();

  const riskMetrics = [
    {
      title: 'High Risk Users',
      value: '147',
      change: '+12%',
      changeType: 'increase' as const,
      icon: AlertTriangle,
      color: 'text-red-600'
    },
    {
      title: 'Risk Score Trend',
      value: '72.3',
      change: '-5%',
      changeType: 'decrease' as const,
      icon: TrendingUp,
      color: 'text-blue-600'
    },
    {
      title: 'Users Under Review',
      value: '89',
      change: '+8%',
      changeType: 'increase' as const,
      icon: Users,
      color: 'text-yellow-600'
    },
    {
      title: 'Compliance Score',
      value: '94.2%',
      change: '+2%',
      changeType: 'increase' as const,
      icon: Shield,
      color: 'text-green-600'
    }
  ];

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.riskAnalysis')}</h1>
          <p className="text-muted-foreground">
            Comprehensive risk assessment and analysis dashboard for compliance monitoring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {riskMetrics.map((metric, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className={`text-xs ${metric.changeType === 'increase' ? 'text-red-600' : 'text-green-600'}`}>
                  {metric.change} from last month
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Risk Overview</TabsTrigger>
            <TabsTrigger value="distribution">Risk Distribution</TabsTrigger>
            <TabsTrigger value="trends">Risk Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Score Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <RiskDistributionChart data={mockRiskDistribution} loading={false} />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Recent Risk Alerts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">High-value transaction detected</p>
                        <p className="text-xs text-muted-foreground">User ID: USR-2024-001</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 p-4 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Unusual transaction pattern</p>
                        <p className="text-xs text-muted-foreground">User ID: USR-2024-002</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="distribution" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <RiskDistributionChart data={mockRiskDistribution} loading={false} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Risk Trends Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Risk trend analysis coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RiskAnalysis;
