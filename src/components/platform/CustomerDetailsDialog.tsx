
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Customer } from '@/types/platform-roles';
import { formatDistanceToNow, format } from 'date-fns';
import { Building2, Calendar, Globe, Users, CreditCard } from 'lucide-react';

interface CustomerDetailsDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDetailsDialog({ customer, open, onOpenChange }: CustomerDetailsDialogProps) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Customer Details: {customer.name}
          </DialogTitle>
          <DialogDescription>
            View detailed information about this customer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer Name</label>
                  <p className="text-sm font-medium">{customer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer ID</label>
                  <p className="text-sm font-mono">{customer.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Domain</label>
                  <p className="text-sm">
                    {customer.domain ? (
                      <code className="bg-muted px-2 py-1 rounded text-xs">
                        {customer.domain}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">No domain configured</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Subscription Tier</label>
                  <div className="mt-1">
                    <Badge 
                      variant="secondary" 
                      className={getSubscriptionBadgeColor(customer.subscription_tier)}
                    >
                      {customer.subscription_tier}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-4 w-4" />
                Usage Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{customer.settings?.userCount || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Globe className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-2xl font-bold">{customer.settings?.apiCallsThisMonth || 0}</p>
                  <p className="text-sm text-muted-foreground">API Calls</p>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                  <p className="text-2xl font-bold">{customer.settings?.storageUsedMB || 0} MB</p>
                  <p className="text-sm text-muted-foreground">Storage Used</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Created</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(customer.created_at), 'PPP')} 
                  ({formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })})
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Last Updated</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(customer.updated_at), 'PPP')} 
                  ({formatDistanceToNow(new Date(customer.updated_at), { addSuffix: true })})
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          {customer.settings && Object.keys(customer.settings).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Additional Settings</CardTitle>
                <CardDescription>
                  Customer-specific configuration options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
                  {JSON.stringify(customer.settings, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
