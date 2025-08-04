
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileWarning, Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import SARList from '@/components/sar/SARList';
import SARForm from '@/components/sar/SARForm';
import GoAMLReporting from '@/components/sar/GoAMLReporting';
import { useSARData } from '@/hooks/useSARData';
import { useTranslation } from 'react-i18next';

const SARCenter = () => {
  const [activeTab, setActiveTab] = useState('reports');
  const [showNewSARForm, setShowNewSARForm] = useState(false);
  const { t } = useTranslation();
  
  const {
    sarReports,
    loading,
    createSAR,
    updateSAR,
    deleteSAR
  } = useSARData();

  const handleCreateSAR = async (sarData: any) => {
    try {
      await createSAR(sarData);
      setShowNewSARForm(false);
    } catch (error) {
      console.error('Error creating SAR:', error);
    }
  };

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('navigation.sarCenter')}</h1>
            <p className="text-muted-foreground">
              Suspicious Activity Report management and regulatory compliance center.
            </p>
          </div>
          <Button onClick={() => setShowNewSARForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New SAR Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total SARs</CardTitle>
              <FileWarning className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sarReports.length}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <FileWarning className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sarReports.filter(sar => sar.status === 'draft').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting submission
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Filed This Month</CardTitle>
              <FileWarning className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sarReports.filter(sar => sar.status === 'filed').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully submitted
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="reports">SAR Reports</TabsTrigger>
            <TabsTrigger value="goaml">GoAML Reporting</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search SAR reports..."
                  className="pl-8"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>

            {showNewSARForm ? (
              <Card>
                <CardHeader>
                  <CardTitle>New SAR Report</CardTitle>
                </CardHeader>
                <CardContent>
                  <SARForm 
                    onSubmit={handleCreateSAR}
                    onCancel={() => setShowNewSARForm(false)}
                  />
                </CardContent>
              </Card>
            ) : (
              <SARList 
                reports={sarReports}
                loading={loading}
                onUpdate={updateSAR}
                onDelete={deleteSAR}
              />
            )}
          </TabsContent>

          <TabsContent value="goaml" className="space-y-4">
            <GoAMLReporting />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SARCenter;
