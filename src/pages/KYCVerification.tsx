
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { mockUsers } from '@/components/kyc/mockKycData';
import KYCDashboardSummary from '@/components/kyc/KYCDashboardSummary';
import KYCFilters from '@/components/kyc/KYCFilters';
import KYCUserTabs from '@/components/kyc/KYCUserTabs';
import KYCUserTable from '@/components/kyc/KYCUserTable';
import useKYCUsers from '@/hooks/useKYCUsers';

const KYCVerificationPage = () => {
  const {
    activeTab,
    setActiveTab,
    searchTerm,
    setSearchTerm,
    riskFilter,
    setRiskFilter,
    sortField,
    sortOrder,
    handleSortChange,
    flaggedUsers,
    handleFlagUser,
    isLoading,
    handleResetFilters,
    handleExportData,
    sortedUsers,
    showResetFilters
  } = useKYCUsers({ initialUsers: mockUsers });

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">KYC Verification</h1>
          <p className="text-muted-foreground">
            Verify user identities and monitor KYC compliance
          </p>
        </div>

        <KYCDashboardSummary users={mockUsers} isLoading={isLoading} />

        <KYCFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          riskFilter={riskFilter}
          setRiskFilter={setRiskFilter}
          sortField={sortField}
          sortOrder={sortOrder}
          handleSortChange={handleSortChange}
          handleExportData={handleExportData}
          handleResetFilters={handleResetFilters}
          showResetButton={showResetFilters}
        />

        <KYCUserTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          flaggedUsersCount={flaggedUsers.length}
        />
        
        <KYCUserTable
          users={sortedUsers}
          onSort={handleSortChange}
          sortField={sortField}
          sortOrder={sortOrder}
          isLoading={isLoading}
          flaggedUsers={flaggedUsers}
          onFlagUser={handleFlagUser}
        />
      </div>
    </DashboardLayout>
  );
};

export default KYCVerificationPage;
