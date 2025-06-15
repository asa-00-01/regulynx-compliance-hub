
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Loader2 } from 'lucide-react';
import CustomerMonitoringActions from './CustomerMonitoringActions';
import { useKYCMonitoring } from './dashboard/useKYCMonitoring';
import DashboardStats from './dashboard/DashboardStats';
import DashboardFilterControls from './dashboard/DashboardFilterControls';
import CustomerTable from './dashboard/CustomerTable';

const KYCMonitoringDashboard = () => {
  const {
    kycFilter,
    setKYCFilter,
    riskFilter,
    setRiskFilter,
    countryFilter,
    setCountryFilter,
    selectedCustomer,
    setSelectedCustomer,
    actionModalOpen,
    setActionModalOpen,
    runningAssessment,
    runRiskAssessment,
    pagination,
    stats,
    handlers,
  } = useKYCMonitoring();

  const { handleReview, handleFlag, handleCreateCase, handleViewProfile } = handlers;

  return (
    <div className="space-y-6">
      <DashboardStats {...stats} />

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Customer Monitoring</CardTitle>
              <CardDescription>
                Filter and manage customer KYC and compliance status
              </CardDescription>
            </div>
            <Button
              onClick={runRiskAssessment}
              disabled={runningAssessment}
              className="flex items-center gap-2"
            >
              {runningAssessment ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              {runningAssessment ? 'Running Assessment...' : 'Run Risk Assessment'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <DashboardFilterControls
            kycFilter={kycFilter}
            setKYCFilter={setKYCFilter}
            riskFilter={riskFilter}
            setRiskFilter={setRiskFilter}
            countryFilter={countryFilter}
            setCountryFilter={setCountryFilter}
          />

          <CustomerTable
            customers={pagination.currentData}
            pagination={pagination}
            onReview={handleReview}
            onFlag={handleFlag}
            onCreateCase={handleCreateCase}
            onViewProfile={handleViewProfile}
          />
        </CardContent>
      </Card>
      
      {selectedCustomer && (
        <CustomerMonitoringActions
          customerId={selectedCustomer.id}
          customerName={selectedCustomer.name}
          riskScore={selectedCustomer.riskScore}
          open={actionModalOpen}
          onClose={() => {
            setActionModalOpen(false);
            setSelectedCustomer(null);
          }}
        />
      )}
    </div>
  );
};

export default KYCMonitoringDashboard;
