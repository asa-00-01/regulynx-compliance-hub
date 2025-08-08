
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Users, AlertTriangle, CheckCircle, Clock, FileX, Download, RefreshCw } from 'lucide-react';
import { useCompliance } from '@/context/ComplianceContext';
import { convertToKYCUsers, convertToKYCVerifications } from './mockKycData';
import useKYCUsers from '@/hooks/useKYCUsers';
import { useKYCOperations } from '@/hooks/useKYCOperations';
import { useAdvancedKYCFilters } from '@/hooks/useAdvancedKYCFilters';
import KYCUserCard from './KYCUserCard';
import KYCUserDetailsModal from './KYCUserDetailsModal';
import KYCBulkActionsToolbar from './KYCBulkActionsToolbar';

const EnhancedKYCVerificationPage = () => {
  const { state } = useCompliance();
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Convert unified users to KYC format for compatibility
  const kycUsers = useMemo(() => {
    console.log('Converting users from compliance context:', state.users.length);
    return convertToKYCUsers(state.users);
  }, [state.users]);

  const kycVerifications = useMemo(() => {
    return convertToKYCVerifications(state.users);
  }, [state.users]);

  // Use the existing KYC hooks with the centralized data
  const kycHookData = useKYCUsers({ initialUsers: kycUsers });
  const kycOperations = useKYCOperations({ 
    users: kycUsers,
    onUserUpdate: (userId, updates) => {
      console.log('User updated:', userId, updates);
    }
  });

  const advancedFilters = useAdvancedKYCFilters({ users: kycUsers });

  // Stats based on centralized data
  const stats = useMemo(() => {
    const total = state.users.length;
    const verified = state.users.filter(user => user.kycStatus === 'verified').length;
    const pending = state.users.filter(user => user.kycStatus === 'pending').length;
    const rejected = state.users.filter(user => user.kycStatus === 'rejected').length;
    const flagged = state.users.filter(user => user.isPEP || user.isSanctioned || user.riskScore > 70).length;

    return { total, verified, pending, rejected, flagged };
  }, [state.users]);

  const handleUserClick = (user: any) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Show loading state if no users are loaded yet
  if (state.users.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading KYC data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">KYC Verification Center</h1>
          <p className="text-muted-foreground mt-2">
            Manage and verify customer identity documents and compliance status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={advancedFilters.exportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={kycHookData.handleExportData}>
            <FileX className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <FileX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flagged</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.flagged}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={kycHookData.activeTab} onValueChange={kycHookData.setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pep">PEP</TabsTrigger>
            <TabsTrigger value="sanctioned">Sanctioned</TabsTrigger>
            <TabsTrigger value="high_risk">High Risk</TabsTrigger>
            <TabsTrigger value="incomplete">Incomplete</TabsTrigger>
            <TabsTrigger value="flagged">Flagged</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={kycHookData.searchTerm}
                onChange={(e) => kycHookData.setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={kycHookData.riskFilter} onValueChange={kycHookData.setRiskFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="minimal">Minimal (0-24)</SelectItem>
                <SelectItem value="low">Low (25-49)</SelectItem>
                <SelectItem value="medium">Medium (50-74)</SelectItem>
                <SelectItem value="high">High (75-100)</SelectItem>
              </SelectContent>
            </Select>
            {kycHookData.showResetFilters && (
              <Button variant="outline" onClick={kycHookData.handleResetFilters}>
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        <TabsContent value={kycHookData.activeTab} className="space-y-4">
          {advancedFilters.selectedUsers.length > 0 && (
            <KYCBulkActionsToolbar
              selectedUsers={advancedFilters.selectedUsers}
              users={kycHookData.sortedUsers}
              onClearSelection={advancedFilters.clearSelection}
              onBulkAction={advancedFilters.handleBulkAction}
              kycOperations={kycOperations}
            />
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {kycHookData.isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : kycHookData.sortedUsers.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <FileX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your filters or search term.
                </p>
              </div>
            ) : (
              kycHookData.sortedUsers.map((user) => (
                <KYCUserCard
                  key={user.id}
                  user={user}
                  onUserClick={handleUserClick}
                  onFlagUser={kycHookData.handleFlagUser}
                  isFlagged={kycHookData.flaggedUsers.includes(user.id)}
                  isSelected={advancedFilters.selectedUsers.includes(user.id)}
                  onToggleSelection={() => advancedFilters.toggleUserSelection(user.id)}
                  kycOperations={kycOperations}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* User Details Modal */}
      <KYCUserDetailsModal
        user={selectedUser}
        open={showUserModal}
        onOpenChange={setShowUserModal}
        kycOperations={kycOperations}
      />
    </div>
  );
};

export default EnhancedKYCVerificationPage;
