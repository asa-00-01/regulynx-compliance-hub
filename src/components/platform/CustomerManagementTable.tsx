
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Users, Settings, Eye } from 'lucide-react';
import { Customer } from '@/types/platform-roles';
import { formatDistanceToNow } from 'date-fns';
import { CustomerDetailsDialog } from './CustomerDetailsDialog';
import { CustomerUsersDialog } from './CustomerUsersDialog';
import { CustomerSettingsDialog } from './CustomerSettingsDialog';

interface CustomerManagementTableProps {
  customers: Customer[];
  loading: boolean;
}

export function CustomerManagementTable({ customers, loading }: CustomerManagementTableProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeDialog, setActiveDialog] = useState<'details' | 'users' | 'settings' | null>(null);

  const getSubscriptionBadgeColor = (tier: string) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-purple-100 text-purple-800';
      case 'professional':
        return 'bg-blue-100 text-blue-800';
      case 'basic':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAction = (customer: Customer, action: 'details' | 'users' | 'settings') => {
    setSelectedCustomer(customer);
    setActiveDialog(action);
  };

  const closeDialog = () => {
    setSelectedCustomer(null);
    setActiveDialog(null);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No customers found. Create your first customer to get started.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Domain</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Users</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.name}
                </TableCell>
                <TableCell>
                  {customer.domain ? (
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      {customer.domain}
                    </code>
                  ) : (
                    <span className="text-muted-foreground">No domain</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={getSubscriptionBadgeColor(customer.subscription_tier)}
                  >
                    {customer.subscription_tier}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{customer.settings?.userCount || 0}</span>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleAction(customer, 'details')}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(customer, 'users')}>
                        <Users className="mr-2 h-4 w-4" />
                        Manage Users
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction(customer, 'settings')}>
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Dialogs */}
      {selectedCustomer && activeDialog === 'details' && (
        <CustomerDetailsDialog 
          customer={selectedCustomer} 
          open={true} 
          onOpenChange={closeDialog} 
        />
      )}
      
      {selectedCustomer && activeDialog === 'users' && (
        <CustomerUsersDialog 
          customer={selectedCustomer} 
          open={true} 
          onOpenChange={closeDialog} 
        />
      )}
      
      {selectedCustomer && activeDialog === 'settings' && (
        <CustomerSettingsDialog 
          customer={selectedCustomer} 
          open={true} 
          onOpenChange={closeDialog} 
        />
      )}
    </>
  );
}
