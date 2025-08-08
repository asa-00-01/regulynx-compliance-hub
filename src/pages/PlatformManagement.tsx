
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePlatformRoleAccess } from '@/hooks/permissions/usePlatformRoleAccess';
import { PlatformRoleService } from '@/services/platformRoleService';
import { Customer, ExtendedUserProfile, CustomerRole } from '@/types/platform-roles';
import { Building2, Users, Settings, Shield, Plus } from 'lucide-react';

const PlatformManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerUsers, setCustomerUsers] = useState<ExtendedUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', domain: '', subscription_tier: 'basic' });
  
  const { toast } = useToast();
  const { isPlatformAdmin, canManageCustomers } = usePlatformRoleAccess();

  useEffect(() => {
    if (canManageCustomers()) {
      loadCustomers();
    }
  }, [canManageCustomers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await PlatformRoleService.getCustomers();
      setCustomers(data);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to load customers: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCustomerUsers = async (customerId: string) => {
    try {
      const users = await PlatformRoleService.getCustomerUsers(customerId);
      setCustomerUsers(users);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to load customer users: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleCreateCustomer = async () => {
    try {
      const customer = await PlatformRoleService.createCustomer(newCustomer);
      setCustomers([...customers, customer]);
      setNewCustomer({ name: '', domain: '', subscription_tier: 'basic' });
      setIsCreateCustomerOpen(false);
      toast({
        title: 'Success',
        description: 'Customer created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to create customer: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    loadCustomerUsers(customer.id);
  };

  const handleRoleChange = async (userId: string, customerId: string, newRole: CustomerRole) => {
    try {
      // For simplicity, we'll remove all existing roles and add the new one
      const user = customerUsers.find(u => u.id === userId);
      if (user?.customer_roles.length) {
        for (const role of user.customer_roles) {
          await PlatformRoleService.removeCustomerRole(userId, customerId, role);
        }
      }
      
      await PlatformRoleService.assignCustomerRole(userId, customerId, newRole);
      await loadCustomerUsers(customerId);
      
      toast({
        title: 'Success',
        description: 'User role updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to update role: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  if (!isPlatformAdmin()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-center">
              You need platform administrator privileges to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Platform Management</h1>
        <p className="text-muted-foreground">
          Manage customers, users, and platform-wide settings.
        </p>
      </div>

      <Tabs defaultValue="customers" className="space-y-6">
        <TabsList>
          <TabsTrigger value="customers" className="flex items-center space-x-2">
            <Building2 className="h-4 w-4" />
            <span>Customers</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>User Management</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Platform Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Customer Organizations</CardTitle>
                <CardDescription>
                  Manage customer organizations and their settings.
                </CardDescription>
              </div>
              <Dialog open={isCreateCustomerOpen} onOpenChange={setIsCreateCustomerOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Customer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Customer</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div>
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                        placeholder="Enter customer name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerDomain">Domain (Optional)</Label>
                      <Input
                        id="customerDomain"
                        value={newCustomer.domain}
                        onChange={(e) => setNewCustomer({ ...newCustomer, domain: e.target.value })}
                        placeholder="customer.example.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subscriptionTier">Subscription Tier</Label>
                      <Select
                        value={newCustomer.subscription_tier}
                        onValueChange={(value) => setNewCustomer({ ...newCustomer, subscription_tier: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basic">Basic</SelectItem>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsCreateCustomerOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCustomer}>Create Customer</Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading customers...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Domain</TableHead>
                      <TableHead>Subscription</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.domain || 'Not set'}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{customer.subscription_tier}</Badge>
                        </TableCell>
                        <TableCell>{new Date(customer.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCustomerSelect(customer)}
                          >
                            View Users
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          {selectedCustomer ? (
            <Card>
              <CardHeader>
                <CardTitle>Users for {selectedCustomer.name}</CardTitle>
                <CardDescription>
                  Manage user roles and permissions for this customer.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Customer Roles</TableHead>
                      <TableHead>Platform Roles</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.customer_roles.map((role) => (
                              <Badge key={role} variant="outline">
                                {role.replace('customer_', '')}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.platform_roles.map((role) => (
                              <Badge key={role} variant="default">
                                {role.replace('platform_', '')}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={user.customer_roles[0] || 'customer_support'}
                            onValueChange={(value: CustomerRole) =>
                              handleRoleChange(user.id, selectedCustomer.id, value)
                            }
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="customer_admin">Admin</SelectItem>
                              <SelectItem value="customer_compliance">Compliance</SelectItem>
                              <SelectItem value="customer_executive">Executive</SelectItem>
                              <SelectItem value="customer_support">Support</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select a Customer</h3>
                <p className="text-muted-foreground">
                  Choose a customer from the Customers tab to manage their users.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Settings</CardTitle>
              <CardDescription>
                Configure global platform settings and policies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Platform-wide settings will be implemented in future updates.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformManagement;
