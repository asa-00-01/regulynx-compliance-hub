
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserVerificationTable from '@/components/kyc/UserVerificationTable';
import { mockUsers } from '@/components/kyc/mockKycData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, SlidersHorizontal } from 'lucide-react';
import KYCDashboardSummary from '@/components/kyc/KYCDashboardSummary';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const KYCVerificationPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

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
    if (activeTab === 'high_risk' && user.flags.riskScore < 75) {
      return false;
    }
    if (activeTab === 'incomplete' && 
        (user.flags.is_email_confirmed && user.phoneNumber && user.identityNumber)) {
      return false;
    }

    // Apply risk filter
    if (riskFilter === 'high' && user.flags.riskScore < 75) return false;
    if (riskFilter === 'medium' && (user.flags.riskScore < 50 || user.flags.riskScore >= 75)) return false;
    if (riskFilter === 'low' && (user.flags.riskScore < 25 || user.flags.riskScore >= 50)) return false;
    if (riskFilter === 'minimal' && user.flags.riskScore >= 25) return false;
    
    return true;
  });

  // Sort users
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    let comparison = 0;
    
    if (sortField === 'name') {
      comparison = a.fullName.localeCompare(b.fullName);
    } else if (sortField === 'risk') {
      comparison = a.flags.riskScore - b.flags.riskScore;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleSortChange = (field: string) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">KYC Verification</h1>
          <p className="text-muted-foreground">
            Verify user identities and monitor KYC compliance
          </p>
        </div>

        <KYCDashboardSummary users={mockUsers} />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email"
              className="pl-8 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Risk Level</SelectLabel>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="minimal">Minimal Risk</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => handleSortChange('risk')}>
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              {sortField === 'risk' 
                ? `Risk Score ${sortOrder === 'asc' ? '↑' : '↓'}` 
                : 'Sort by Risk'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="pep">PEP Users</TabsTrigger>
            <TabsTrigger value="sanctioned">Sanctioned</TabsTrigger>
            <TabsTrigger value="high_risk">High Risk</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete KYC</TabsTrigger>
          </TabsList>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">User Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <UserVerificationTable 
                users={sortedUsers} 
                onSort={handleSortChange}
                sortField={sortField}
                sortOrder={sortOrder}
              />
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default KYCVerificationPage;
