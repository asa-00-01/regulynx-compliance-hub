
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalCustomerMapping } from '@/types/integration';
import { Users, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CustomerMappingViewProps {
  mappings: ExternalCustomerMapping[];
  selectedClientId: string | null;
}

const CustomerMappingView = ({ mappings, selectedClientId }: CustomerMappingViewProps) => {
  if (!selectedClientId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer Mappings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Select a client to view customer mappings.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSyncStatusBadge = (status: string) => {
    const variants = {
      synced: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Mappings for {selectedClientId}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mappings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No customer mappings found for this client.
          </div>
        ) : (
          <div className="space-y-4">
            {mappings.map((mapping) => (
              <div key={mapping.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h4 className="font-medium">
                      External ID: {mapping.externalCustomerId}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Internal ID: {mapping.internalUserId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {mapping.lastSyncedAt && `Last synced ${formatDistanceToNow(new Date(mapping.lastSyncedAt), { addSuffix: true })}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getSyncStatusBadge(mapping.syncStatus)}>
                    {mapping.syncStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CustomerMappingView;
