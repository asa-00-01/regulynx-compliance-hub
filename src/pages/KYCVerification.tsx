
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserVerificationTable from '@/components/kyc/UserVerificationTable';
import { mockUsers } from '@/components/kyc/mockKycData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserFlags } from '@/types/kyc';
import { Search, Filter } from 'lucide-react';

const KYCVerificationPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    showPep: false,
    showSanctioned: false,
    showUnverifiedEmail: false
  });

  const filteredUsers = mockUsers.filter(user => {
    // Apply search term
    if (searchTerm && !user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !user.email.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Apply tab filters
    if (activeTab === 'pep' && !user.flags.is_verified_pep) {
      return false;
    }
    if (activeTab === 'sanctioned' && !user.flags.is_sanction_list) {
      return false;
    }
    if (activeTab === 'incomplete' && 
        (user.flags.is_email_confirmed && user.phoneNumber && user.identityNumber)) {
      return false;
    }

    // Apply additional filters
    if (filters.showPep && !user.flags.is_verified_pep) {
      return false;
    }
    if (filters.showSanctioned && !user.flags.is_sanction_list) {
      return false;
    }
    if (filters.showUnverifiedEmail && user.flags.is_email_confirmed) {
      return false;
    }
    
    return true;
  });

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">KYC Verification</h1>
          <p className="text-muted-foreground">
            Verify user identities and monitor KYC compliance
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email"
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="pep">PEP Users</TabsTrigger>
            <TabsTrigger value="sanctioned">Sanctioned</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete KYC</TabsTrigger>
          </TabsList>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">User Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <UserVerificationTable users={filteredUsers} />
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default KYCVerificationPage;
