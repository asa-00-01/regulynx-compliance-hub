import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { DocumentStatus } from '@/types/supabase';
import { Flag, Eye, FilePenLine, Shield, AlertTriangle, Users, CheckCircle, FileText, Play, Loader2 } from 'lucide-react';
import CustomerMonitoringActions from './CustomerMonitoringActions';
import { useNavigate } from 'react-router-dom';
import { unifiedMockData } from '@/mocks/centralizedMockData';
import { evaluateUserRisk } from '@/services/riskScoringService';
import { usePagination } from '@/hooks/usePagination';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useCompliance } from '@/context/ComplianceContext';

const KYCMonitoringDashboard = () => {
  // Transform unified data to dashboard format
  const transformedCustomers = unifiedMockData.map(user => ({
    id: user.id,
    name: user.fullName,
    email: user.email,
    kycStatus: user.kycStatus,
    riskScore: user.riskScore,
    lastTransaction: user.transactions.length > 0 
      ? user.transactions[0].timestamp 
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    country: user.countryOfResidence || 'Unknown',
    transactions: user.transactions.length,
    amount: user.transactions.reduce((sum, tx) => sum + tx.senderAmount, 0),
  }));

  const [customers, setCustomers] = useState(transformedCustomers);
  const [kycFilter, setKYCFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  const [runningAssessment, setRunningAssessment] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setSelectedUser } = useCompliance();

  // Filter customers based on selected filters
  const filteredCustomers = customers.filter((customer) => {
    const matchesKYC = kycFilter === 'all' || customer.kycStatus === kycFilter;
    
    const matchesRisk = 
      riskFilter === 'all' || 
      (riskFilter === 'low' && customer.riskScore <= 30) ||
      (riskFilter === 'medium' && customer.riskScore > 30 && customer.riskScore <= 70) ||
      (riskFilter === 'high' && customer.riskScore > 70);
    
    const matchesCountry = 
      countryFilter === '' || 
      customer.country.toLowerCase().includes(countryFilter.toLowerCase());
    
    return matchesKYC && matchesRisk && matchesCountry;
  });

  // Add pagination
  const {
    currentData: paginatedCustomers,
    currentPage,
    totalPages,
    totalItems,
    goToPage,
    goToNextPage,
    goToPrevPage,
    hasNextPage,
    hasPrevPage,
    startIndex,
    endIndex
  } = usePagination({ 
    data: filteredCustomers, 
    itemsPerPage: 10 
  });

  // Count metrics
  const flaggedUsers = customers.filter(c => c.riskScore > 70).length;
  const pendingReviews = customers.filter(c => c.kycStatus === 'pending').length;
  const highRiskUsers = customers.filter(c => c.riskScore > 70).length;
  const recentAlerts = 3; // Mock value for demonstration

  // Risk Assessment function
  const runRiskAssessment = async () => {
    setRunningAssessment(true);
    try {
      let assessedCount = 0;
      const updatedCustomers = [...customers];

      for (const customer of customers) {
        try {
          // Find the corresponding user in unified data
          const userData = unifiedMockData.find(u => u.id === customer.id);
          if (userData) {
            console.log(`Running risk assessment for user: ${customer.name}`);
            const riskResult = await evaluateUserRisk(userData);
            
            // Update the customer's risk score
            const customerIndex = updatedCustomers.findIndex(c => c.id === customer.id);
            if (customerIndex !== -1) {
              updatedCustomers[customerIndex].riskScore = riskResult.total_risk_score;
            }
            assessedCount++;
          }
        } catch (error) {
          console.error(`Error assessing user ${customer.name}:`, error);
        }
      }

      setCustomers(updatedCustomers);
      toast({
        title: 'Risk Assessment Complete',
        description: `Successfully assessed ${assessedCount} out of ${customers.length} customers`,
      });
    } catch (error) {
      console.error('Error running risk assessment:', error);
      toast({
        title: 'Assessment Error',
        description: 'Failed to complete risk assessment',
        variant: 'destructive'
      });
    } finally {
      setRunningAssessment(false);
    }
  };

  // Action handlers
  const handleReview = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setActionModalOpen(true);
    }
  };

  const handleFlag = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedCustomer(customer);
      setActionModalOpen(true);
    }
  };

  const handleViewProfile = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      setSelectedUser(customerId);
      navigate(`/user-case/${customerId}`, {
        state: {
          returnTo: '/compliance'
        }
      });
      
      toast({
        title: "User Profile",
        description: `Opening complete profile for ${customer.name}`,
      });
    }
  };
  
  const handleCreateCase = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      navigate('/compliance-cases', { 
        state: { 
          createCase: true,
          userData: {
            userId: customer.id,
            userName: customer.name,
            riskScore: customer.riskScore
          }
        }
      });
    }
  };

  // Helper functions
  const getRiskScoreClass = (score: number) => {
    if (score <= 30) return "bg-green-100 text-green-800";
    if (score <= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getKYCStatusClass = (status: string) => {
    switch (status) {
      case 'verified':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'information_requested':
        return "bg-orange-100 text-orange-800";
      case 'rejected':
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats Section */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Flagged Users</CardTitle>
            <Flag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flaggedUsers}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <FilePenLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReviews}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Risk Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskUsers}</div>
            <p className="text-xs text-muted-foreground">
              Above 70 risk score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recent Alerts</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentAlerts}</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
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
          {/* Filter controls */}
          <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium text-muted-foreground">
                KYC Status
              </label>
              <Select
                value={kycFilter}
                onValueChange={setKYCFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="information_requested">Information Requested</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium text-muted-foreground">
                Risk Level
              </label>
              <Select
                value={riskFilter}
                onValueChange={setRiskFilter}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Risk Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="low">Low (0-30)</SelectItem>
                  <SelectItem value="medium">Medium (31-70)</SelectItem>
                  <SelectItem value="high">High (71-100)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-1/3">
              <label className="text-sm font-medium text-muted-foreground">
                Country
              </label>
              <Input
                type="text"
                placeholder="Filter by country"
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
              />
            </div>
          </div>

          {/* Pagination Info */}
          <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
            <div>
              Showing {startIndex} to {endIndex} of {totalItems} customers
            </div>
            <div>
              Page {currentPage} of {totalPages}
            </div>
          </div>

          {/* Customer Table */}
          <div className="mt-6 rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Last Transaction</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{customer.name}</div>
                        <div className="text-xs text-muted-foreground">{customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getKYCStatusClass(
                          customer.kycStatus
                        )}`}
                      >
                        {customer.kycStatus.charAt(0).toUpperCase() + customer.kycStatus.slice(1).replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRiskScoreClass(
                          customer.riskScore
                        )}`}
                      >
                        {customer.riskScore}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(customer.lastTransaction).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{customer.country}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleReview(customer.id)}
                          title="Review"
                        >
                          <FilePenLine className="h-4 w-4" />
                          <span className="sr-only">Review</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleFlag(customer.id)}
                          title="Flag"
                        >
                          <Flag className="h-4 w-4" />
                          <span className="sr-only">Flag</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCreateCase(customer.id)}
                          title="Create Case"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Create Case</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewProfile(customer.id)}
                          title="View Profile"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View Profile</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="border-t p-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={goToPrevPage}
                        className={!hasPrevPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
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
                      <PaginationNext 
                        onClick={goToNextPage}
                        className={!hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Customer Action Modal */}
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
