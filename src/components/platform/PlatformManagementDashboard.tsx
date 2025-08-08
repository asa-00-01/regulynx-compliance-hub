
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Users, Building2, Shield } from 'lucide-react';
import { usePlatformRoles } from '@/hooks/usePlatformRoles';
import { Customer } from '@/types/platform-roles';
import { CreateCustomerDialog } from './CreateCustomerDialog';
import { CustomerManagementTable } from './CustomerManagementTable';

export function PlatformManagementDashboard() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { customers, customersLoading } = usePlatformRoles();

  const totalUsers = customers?.reduce((acc, customer) => acc + (customer.settings?.userCount || 0), 0) || 0;
  const activeCustomers = customers?.filter(c => c.subscription_tier !== 'inactive').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Platform Management</h1>
          <p className="text-muted-foreground">Manage customers, users, and platform-level configurations</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {activeCustomers} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Across all customers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="platform-roles">Platform Roles</TabsTrigger>
          <TabsTrigger value="system-health">System Health</TabsTrigger>
        </TabsList>

        <TabsContent value="customers">
          <Card>
            <CardHeader>
              <CardTitle>Customer Management</CardTitle>
              <CardDescription>
                Manage customer organizations and their subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CustomerManagementTable 
                customers={customers || []} 
                loading={customersLoading} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="platform-roles">
          <Card>
            <CardHeader>
              <CardTitle>Platform Role Management</CardTitle>
              <CardDescription>
                Manage platform-level administrator and support roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Platform role management interface coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system-health">
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Monitor platform performance and system metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Database Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>API Status</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Authentication</span>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Operational
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateCustomerDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}
