
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useParams } from 'react-router-dom';

const UserCase = () => {
  const { userId } = useParams();
  console.log('UserCase page rendering...', { userId });
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="w-full space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Case</h1>
          <p className="text-muted-foreground">
            {userId ? `Detailed case view for user ${userId}` : 'User case management'}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">User Profile</h3>
            <p className="text-muted-foreground">User information and verification status</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
            <p className="text-muted-foreground">User transaction patterns</p>
          </div>
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Risk Profile</h3>
            <p className="text-muted-foreground">Risk assessment and scoring</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserCase;
