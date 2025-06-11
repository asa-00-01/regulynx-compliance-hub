
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EnhancedKYCVerificationPage from '@/components/kyc/EnhancedKYCVerificationPage';

const KYCVerificationPage = () => {
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <EnhancedKYCVerificationPage />
    </DashboardLayout>
  );
};

export default KYCVerificationPage;
