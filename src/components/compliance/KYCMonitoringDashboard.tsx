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
import { Flag, Eye, FilePenLine, Shield, AlertTriangle, Users, CheckCircle, FileText } from 'lucide-react';
import CustomerMonitoringActions from './CustomerMonitoringActions';
import { useNavigate } from 'react-router-dom';

// Mock customer data for demonstration
const mockCustomers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    kycStatus: 'verified' as DocumentStatus,
    riskScore: 25,
    lastTransaction: '2025-05-01T14:30:00Z',
    country: 'Sweden',
    transactions: 5,
    amount: 3000,
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'janesmith@example.com',
    kycStatus: 'pending' as DocumentStatus,
    riskScore: 45,
    lastTransaction: '2025-05-02T10:15:00Z',
    country: 'Denmark',
    transactions: 8,
    amount: 7500,
  },
  {
    id: '3',
    name: 'Ahmed Hassan',
    email: 'ahmed@example.com',
    kycStatus: 'pending' as DocumentStatus,
    riskScore: 60,
    lastTransaction: '2025-05-01T08:45:00Z',
    country: 'Turkey',
    transactions: 12,
    amount: 15000,
  },
  {
    id: '4',
    name: 'Sofia Rodriguez',
    email: 'sofia@example.com',
    kycStatus: 'rejected' as DocumentStatus,
    riskScore: 85,
    lastTransaction: '2025-04-30T16:20:00Z',
    country: 'Colombia',
    transactions: 3,
    amount: 12000,
  },
  {
    id: '5',
    name: 'Alexander Petrov',
    email: 'alexander@example.com',
    kycStatus: 'verified' as DocumentStatus,
    riskScore: 75,
    lastTransaction: '2025-05-03T09:10:00Z',
    country: 'Russia',
    transactions: 15,
    amount: 25000,
  },
  {
    id: '6',
    name: 'Lisa Chen',
    email: 'lisa@example.com',
    kycStatus: 'verified' as DocumentStatus,
    riskScore: 15,
    lastTransaction: '2025-05-02T11:40:00Z',
    country: 'Singapore',
    transactions: 4,
    amount: 5000,
  },
  {
    id: '7',
    name: 'David Johnson',
    email: 'david@example.com',
    kycStatus: 'pending' as DocumentStatus,
    riskScore: 50,
    lastTransaction: '2025-05-01T13:25:00Z',
    country: 'UK',
    transactions: 7,
    amount: 8500,
  },
];

const KYCMonitoringDashboard = () => {
  const [customers, setCustomers] = useState(mockCustomers);
  const [kycFilter, setKYCFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [actionModalOpen, setActionModalOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

  // Count metrics
  const flaggedUsers = customers.filter(c => c.riskScore > 70).length;
  const pendingReviews = customers.filter(c => c.kycStatus === 'pending').length;
  const highRiskUsers = customers.filter(c => c.riskScore > 70).length;
  const recentAlerts = 3; // Mock value for demonstration

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
      toast({
        title: "Viewing profile",
        description: `Opening profile for ${customer.name}`,
      });
    }
  };
  
  const handleCreateCase = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      // Navigate to compliance cases page with customer data
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

  const getRiskScoreClass = (score: number) => {
    if (score <= 30) return "bg-green-100 text-green-800";
    if (score <= 70) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getKYCStatusClass = (status: DocumentStatus) => {
    switch (status) {
      case 'verified':
        return "bg-green-100 text-green-800";
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
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
          <CardTitle>Customer Monitoring</CardTitle>
          <CardDescription>
            Filter and manage customer KYC and compliance status
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                {filteredCustomers.map((customer) => (
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
                        {customer.kycStatus.charAt(0).toUpperCase() + customer.kycStatus.slice(1)}
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
                          <span className="sr-only">View</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
