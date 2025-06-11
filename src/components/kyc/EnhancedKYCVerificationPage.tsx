
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, Filter, Download, Settings } from 'lucide-react';

import KYCDashboardSummary from './KYCDashboardSummary';
import KYCUserTable from './KYCUserTable';
import KYCUserTabs from './KYCUserTabs';
import AdvancedKYCFilters from './AdvancedKYCFilters';
import BulkActionsPanel from './BulkActionsPanel';
import KYCAnalytics from './KYCAnalytics';
import useKYCUsers from '@/hooks/useKYCUsers';
import { useAdvancedKYCFilters } from '@/hooks/useAdvancedKYCFilters';
import { mockUsers } from './mockKycData';

const EnhancedKYCVerificationPage: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState('users');
  
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

  const {
    filters,
    filteredUsers,
    activeFiltersCount,
    selectedUsers,
    updateFilter,
    resetFilters: resetAdvancedFilters,
    toggleUserSelection,
    toggleAllUsers,
    clearSelection,
    handleBulkAction,
    exportData
  } = useAdvancedKYCFilters({ users: sortedUsers });

  const displayUsers = activeMainTab === 'advanced' ? filteredUsers : sortedUsers;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">KYC Verification Center</h1>
        <p className="text-muted-foreground">
          Enhanced user identity verification and compliance monitoring
        </p>
      </div>

      <KYCDashboardSummary users={mockUsers} isLoading={isLoading} />

      <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Advanced Filtering
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1">{activeFiltersCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <KYCUserTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            flaggedUsersCount={flaggedUsers.length}
          />
          
          {selectedUsers.length > 0 && (
            <BulkActionsPanel
              selectedUsers={selectedUsers}
              onClearSelection={clearSelection}
              onBulkAction={handleBulkAction}
            />
          )}
          
          <KYCUserTable
            users={displayUsers}
            onSort={handleSortChange}
            sortField={sortField}
            sortOrder={sortOrder}
            isLoading={isLoading}
            flaggedUsers={flaggedUsers}
            onFlagUser={handleFlagUser}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <AdvancedKYCFilters
            searchTerm={filters.searchTerm}
            setSearchTerm={(term) => updateFilter('searchTerm', term)}
            riskFilter={filters.riskFilter}
            setRiskFilter={(filter) => updateFilter('riskFilter', filter)}
            countryFilter={filters.countryFilter}
            setCountryFilter={(country) => updateFilter('countryFilter', country)}
            dateRange={filters.dateRange}
            setDateRange={(range) => updateFilter('dateRange', range)}
            kycStatusFilter={filters.kycStatusFilter}
            setKycStatusFilter={(status) => updateFilter('kycStatusFilter', status)}
            onApplyFilters={() => {}}
            onResetFilters={resetAdvancedFilters}
            onExportData={exportData}
            activeFiltersCount={activeFiltersCount}
            totalUsers={mockUsers.length}
            filteredUsers={filteredUsers.length}
          />

          {selectedUsers.length > 0 && (
            <BulkActionsPanel
              selectedUsers={selectedUsers}
              onClearSelection={clearSelection}
              onBulkAction={handleBulkAction}
            />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Filtered Results</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleAllUsers}
                  >
                    {selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <KYCUserTable
                users={filteredUsers}
                onSort={handleSortChange}
                sortField={sortField}
                sortOrder={sortOrder}
                isLoading={isLoading}
                flaggedUsers={flaggedUsers}
                onFlagUser={handleFlagUser}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <KYCAnalytics users={mockUsers} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedKYCVerificationPage;
