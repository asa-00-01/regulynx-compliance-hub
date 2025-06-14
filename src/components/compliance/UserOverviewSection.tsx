import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Users, HelpCircle, Info } from 'lucide-react';
import { useCompliance } from '@/context/ComplianceContext';
import UserCard from '@/components/user/UserCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { usePagination } from '@/hooks/usePagination';
import { TooltipHelp } from '@/components/ui/tooltip-custom';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

const UserOverviewSection: React.FC = () => {
  const { state } = useCompliance();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  // Filter users based on search and risk filter
  const filteredUsers = state.users.filter(user => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Risk filter
    let matchesRisk = true;
    if (riskFilter === 'high') {
      matchesRisk = user.riskScore >= 75;
    } else if (riskFilter === 'medium') {
      matchesRisk = user.riskScore >= 50 && user.riskScore < 75;
    } else if (riskFilter === 'low') {
      matchesRisk = user.riskScore < 50;
    }
    
    // Tab filter
    if (activeTab === 'pep') {
      return matchesSearch && matchesRisk && user.isPEP;
    } else if (activeTab === 'sanctioned') {
      return matchesSearch && matchesRisk && user.isSanctioned;
    } else if (activeTab === 'high-risk') {
      return matchesSearch && matchesRisk && user.riskScore >= 75;
    } else if (activeTab === 'with-cases') {
      return matchesSearch && matchesRisk && user.complianceCases.length > 0;
    }
    
    return matchesSearch && matchesRisk;
  });

  // Add pagination
  const {
    currentData: paginatedUsers,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    goToPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex
  } = usePagination({ 
    data: filteredUsers, 
    itemsPerPage: 12 
  });
  
  const pepCount = state.users.filter(user => user.isPEP).length;
  const sanctionedCount = state.users.filter(user => user.isSanctioned).length;
  const highRiskCount = state.users.filter(user => user.riskScore >= 75).length;
  const withCasesCount = state.users.filter(user => user.complianceCases.length > 0).length;
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" /> 
            User Overview
            <TooltipHelp content="Monitor and manage all users in your system. Use filters and tabs to quickly find specific user groups based on risk levels, PEP status, sanctions, or case history.">
              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
            </TooltipHelp>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Use the search bar to find users by name or email. Apply risk filters and use tabs to categorize users. Click on any user card to view detailed information and manage their compliance status.
            </AlertDescription>
          </Alert>

          <div className="mb-4 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <TooltipHelp content="Search for users by entering their full name or email address. The search is case-insensitive and matches partial text.">
                <Input
                  placeholder="Search by name or email..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </TooltipHelp>
            </div>
            <div className="flex gap-2">
              <TooltipHelp content="Filter users by their risk assessment level. High risk users (75+) require immediate attention, medium risk (50-74) need monitoring, and low risk (<50) are considered safe.">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={riskFilter}
                  onChange={(e) => setRiskFilter(e.target.value)}
                >
                  <option value="all">All Risk Levels</option>
                  <option value="high">High Risk (75+)</option>
                  <option value="medium">Medium Risk (50-74)</option>
                  <option value="low">Low Risk (<50)</option>
                </select>
              </TooltipHelp>
              <TooltipHelp content="Clear all applied filters and return to showing all users">
                <Button variant="outline" onClick={() => {
                  setSearchQuery('');
                  setRiskFilter('all');
                }}>
                  Reset
                </Button>
              </TooltipHelp>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-2 sm:grid-cols-5">
              <TabsTrigger value="all">
                <TooltipHelp content="View all users in the system regardless of their status">
                  All Users 
                  <Badge variant="outline" className="ml-2">{state.users.length}</Badge>
                </TooltipHelp>
              </TabsTrigger>
              <TabsTrigger value="pep">
                <TooltipHelp content="Politically Exposed Persons - individuals who hold or have held prominent public positions and require enhanced due diligence">
                  PEP
                  <Badge variant="outline" className="ml-2">{pepCount}</Badge>
                </TooltipHelp>
              </TabsTrigger>
              <TabsTrigger value="sanctioned">
                <TooltipHelp content="Users who appear on sanctions lists and are subject to regulatory restrictions">
                  Sanctioned
                  <Badge variant="outline" className="ml-2">{sanctionedCount}</Badge>
                </TooltipHelp>
              </TabsTrigger>
              <TabsTrigger value="high-risk">
                <TooltipHelp content="Users with risk scores of 75 or higher requiring immediate attention and enhanced monitoring">
                  High Risk
                  <Badge variant="outline" className="ml-2">{highRiskCount}</Badge>
                </TooltipHelp>
              </TabsTrigger>
              <TabsTrigger value="with-cases">
                <TooltipHelp content="Users who have active or historical compliance cases that require investigation or follow-up">
                  With Cases
                  <Badge variant="outline" className="ml-2">{withCasesCount}</Badge>
                </TooltipHelp>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab} className="mt-4">
              {/* Pagination Info */}
              {filteredUsers.length > 0 && (
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                  <div>
                    Showing {startIndex} to {endIndex} of {totalItems} users
                  </div>
                  <div>
                    Page {currentPage} of {totalPages}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedUsers.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-muted-foreground">No users found matching your criteria.</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => {
                        setSearchQuery('');
                        setRiskFilter('all');
                        setActiveTab('all');
                      }}
                    >
                      Reset Filters
                    </Button>
                  </div>
                ) : (
                  paginatedUsers.map(user => (
                    <UserCard key={user.id} userId={user.id} />
                  ))
                )}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <TooltipHelp content="Go to previous page">
                          <PaginationPrevious 
                            onClick={goToPrevPage}
                            className={!hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </TooltipHelp>
                      </PaginationItem>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          // Show first page, last page, current page, and pages around current
                          return page === 1 || 
                                 page === totalPages || 
                                 Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => {
                          // Add ellipsis if there's a gap
                          const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                          
                          return (
                            <React.Fragment key={page}>
                              {showEllipsisBefore && (
                                <PaginationItem>
                                  <PaginationEllipsis />
                                </PaginationItem>
                              )}
                              <PaginationItem>
                                <PaginationLink
                                  onClick={() => goToPage(page)}
                                  isActive={currentPage === page}
                                  className="cursor-pointer"
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            </React.Fragment>
                          );
                        })}
                      
                      <PaginationItem>
                        <TooltipHelp content="Go to next page">
                          <PaginationNext 
                            onClick={goToNextPage}
                            className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                          />
                        </TooltipHelp>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserOverviewSection;
