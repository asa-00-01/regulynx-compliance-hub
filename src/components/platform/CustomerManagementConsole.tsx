import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Building2, 
  Users, 
  DollarSign, 
  Activity,
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Settings,
  Shield,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Globe,
  Mail,
  Phone
} from 'lucide-react';
import { usePlatformRoles } from '@/hooks/usePlatformRoles';
import { Customer as BaseCustomer } from '@/types/platform-roles';
import { CreateCustomerDialog } from './CreateCustomerDialog';
import { CustomerDetailsDialog } from './CustomerDetailsDialog';
import { CustomerSettingsDialog } from './CustomerSettingsDialog';

// Extended Customer interface for this component
interface Customer extends BaseCustomer {
  status: 'active' | 'inactive' | 'suspended';
  userCount: number;
  monthlyRevenue: number;
  lastActivity: string;
}

interface CustomerStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
  totalUsers: number;
  totalRevenue: number;
}

const CustomerManagementConsole: React.FC = () => {
  const navigate = useNavigate();
  const { customers, customersLoading } = usePlatformRoles();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerStats, setCustomerStats] = useState<CustomerStats>({
    total: 0,
    active: 0,
    inactive: 0,
    newThisMonth: 0,
    totalUsers: 0,
    totalRevenue: 0
  });

  // Transform base customers to extended customers with mock data
  const extendedCustomers: Customer[] = useMemo(() => 
    customers?.map(customer => ({
      ...customer,
      status: customer.subscription_tier === 'inactive' ? 'inactive' : 'active' as const,
      userCount: customer.settings?.userCount || Math.floor(Math.random() * 50) + 1,
      monthlyRevenue: customer.settings?.monthlyRevenue || Math.floor(Math.random() * 1000) + 100,
      lastActivity: customer.updated_at
    })) || [], [customers]
  );

  useEffect(() => {
    if (extendedCustomers.length > 0) {
      const total = extendedCustomers.length;
      const active = extendedCustomers.filter(c => c.status === 'active').length;
      const inactive = extendedCustomers.filter(c => c.status === 'inactive').length;
      const newThisMonth = extendedCustomers.filter(c => {
        const createdDate = new Date(c.created_at);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() && createdDate.getFullYear() === now.getFullYear();
      }).length;
      const totalUsers = extendedCustomers.reduce((acc, c) => acc + c.userCount, 0);
      const totalRevenue = extendedCustomers.reduce((acc, c) => acc + c.monthlyRevenue, 0);

      setCustomerStats({
        total,
        active,
        inactive,
        newThisMonth,
        totalUsers,
        totalRevenue
      });
    }
  }, [extendedCustomers]);

  const filteredCustomers = extendedCustomers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.domain?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || customer.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'basic': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCustomerAction = (customer: Customer, action: string) => {
    setSelectedCustomer(customer);
    switch (action) {
      case 'view':
        setIsDetailsDialogOpen(true);
        break;
      case 'edit':
        setIsSettingsDialogOpen(true);
        break;
      case 'delete':
        // Show confirmation dialog or handle deletion
        if (window.confirm(`Are you sure you want to delete customer "${customer.name}"? This action cannot be undone.`)) {
          console.log('Delete customer:', customer.id);
          // TODO: Implement actual deletion logic
          // This would typically call an API to delete the customer
        }
        break;
    }
  };

  const quickActions = [
    {
      title: 'Add Customer',
      description: 'Create new customer organization',
      icon: Plus,
      action: () => setIsCreateDialogOpen(true),
      color: 'bg-blue-500'
    },
    {
      title: 'Bulk Import',
      description: 'Import customers from CSV',
      icon: Users,
      action: () => {
        // TODO: Implement CSV import functionality
        console.log('Bulk import - opening file picker');
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            console.log('CSV file selected:', file.name);
            // TODO: Process CSV file
          }
        };
        input.click();
      },
      color: 'bg-green-500'
    },
    {
      title: 'Export Data',
      description: 'Export customer data',
      icon: TrendingUp,
      action: () => {
        // TODO: Implement data export functionality
        console.log('Export data - generating CSV');
        const csvContent = 'data:text/csv;charset=utf-8,' + 
          'Name,Email,Domain,Subscription Tier,Status\n' +
          extendedCustomers.map(c => `${c.name},${c.domain || ''},${c.domain || ''},${c.subscription_tier},${c.status}`).join('\n');
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'customers_export.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      color: 'bg-purple-500'
    },
    {
      title: 'Analytics',
      description: 'View customer analytics',
      icon: Activity,
      action: () => navigate('/platform/analytics'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between h-20 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-bold tracking-tight">Customer Management</h1>
          <p className="text-muted-foreground">
            Manage customer organizations, subscriptions, and access
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Customer
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.total}</div>
            <p className="text-xs text-muted-foreground">
              {customerStats.newThisMonth} new this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.active}</div>
            <p className="text-xs text-muted-foreground">
              {customerStats.inactive} inactive
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customerStats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${customerStats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common customer management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 w-full">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-start"
                onClick={action.action}
              >
                <div className={`w-8 h-8 rounded-lg ${action.color} flex items-center justify-center mb-3`}>
                  <action.icon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Customer Directory</CardTitle>
              <CardDescription>
                Manage all customer organizations
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList>
              <TabsTrigger value="all">All ({customerStats.total})</TabsTrigger>
              <TabsTrigger value="active">Active ({customerStats.active})</TabsTrigger>
              <TabsTrigger value="inactive">Inactive ({customerStats.inactive})</TabsTrigger>
              <TabsTrigger value="enterprise">Enterprise</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        <div className="text-sm text-muted-foreground">{customer.domain}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getTierColor(customer.subscription_tier)}>
                            {customer.subscription_tier}
                          </Badge>
                          <Badge className={getStatusColor(customer.status || 'active')}>
                            {customer.status || 'active'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-medium">{customer.userCount} users</div>
                        <div className="text-sm text-muted-foreground">
                          ${customer.monthlyRevenue || 0}/month
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCustomerAction(customer, 'view')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCustomerAction(customer, 'edit')}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCustomerAction(customer, 'delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="active" className="space-y-4">
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold">Active Customers</h3>
                <p className="text-muted-foreground">
                  View all active customer organizations
                </p>
              </div>
            </TabsContent>

            <TabsContent value="inactive" className="space-y-4">
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
                <h3 className="text-lg font-semibold">Inactive Customers</h3>
                <p className="text-muted-foreground">
                  View all inactive customer organizations
                </p>
              </div>
            </TabsContent>

            <TabsContent value="enterprise" className="space-y-4">
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold">Enterprise Customers</h3>
                <p className="text-muted-foreground">
                  View all enterprise-level customers
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateCustomerDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
      
      {selectedCustomer && (
        <>
          <CustomerDetailsDialog
            customer={selectedCustomer}
            open={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
          />
          <CustomerSettingsDialog
            customer={selectedCustomer}
            open={isSettingsDialogOpen}
            onOpenChange={setIsSettingsDialogOpen}
          />
        </>
      )}
    </div>
  );
};

export default CustomerManagementConsole;
