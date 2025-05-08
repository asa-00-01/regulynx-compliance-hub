
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserVerificationTable from '@/components/kyc/UserVerificationTable';
import { mockUsers } from '@/components/kyc/mockKycData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, SlidersHorizontal, DownloadCloud, Flag } from 'lucide-react';
import KYCDashboardSummary from '@/components/kyc/KYCDashboardSummary';
import { useToast } from '@/hooks/use-toast';
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
  const [flaggedUsers, setFlaggedUsers] = useState<string[]>([]);
  const { toast } = useToast();

  // Simulate loading state for UI improvements
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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
    if (activeTab === 'flagged' && !flaggedUsers.includes(user.id)) {
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

  const handleResetFilters = () => {
    setSearchTerm('');
    setRiskFilter('all');
    setSortField('name');
    setSortOrder('asc');
    setActiveTab('all');
  };

  const handleFlagUser = (userId: string) => {
    if (flaggedUsers.includes(userId)) {
      setFlaggedUsers(flaggedUsers.filter(id => id !== userId));
      toast({
        title: "User Unflagged",
        description: "User has been removed from flagged list"
      });
    } else {
      setFlaggedUsers([...flaggedUsers, userId]);
      toast({
        title: "User Flagged",
        description: "User has been added to flagged list for review"
      });
    }
  };

  const handleExportData = () => {
    toast({
      title: "Exporting Data",
      description: "KYC data export has been initiated. File will be downloaded shortly."
    });
    
    // In a real implementation, this would generate a CSV file
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "KYC data has been exported successfully"
      });
    }, 1500);
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

        <KYCDashboardSummary users={mockUsers} isLoading={isLoading} />

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

            <Button variant="outline" onClick={handleExportData}>
              <DownloadCloud className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            {(searchTerm || riskFilter !== 'all' || sortField !== 'name' || sortOrder !== 'asc' || activeTab !== 'all') && (
              <Button variant="ghost" onClick={handleResetFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Users</TabsTrigger>
            <TabsTrigger value="pep">PEP Users</TabsTrigger>
            <TabsTrigger value="sanctioned">Sanctioned</TabsTrigger>
            <TabsTrigger value="high_risk">High Risk</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete KYC</TabsTrigger>
            <TabsTrigger value="flagged">
              Flagged
              {flaggedUsers.length > 0 && (
                <Badge variant="secondary" className="ml-2">{flaggedUsers.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                User Verification
                {isLoading ? null : (
                  <span className="text-xs text-muted-foreground ml-2">
                    {sortedUsers.length} user{sortedUsers.length === 1 ? '' : 's'}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UserVerificationTable 
                users={sortedUsers} 
                onSort={handleSortChange}
                sortField={sortField}
                sortOrder={sortOrder}
                isLoading={isLoading}
                flaggedUsers={flaggedUsers}
                onFlagUser={handleFlagUser}
              />
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default KYCVerificationPage;
