
import React from 'react';
import IntegrationDashboard from '@/components/integration/IntegrationDashboard';
import { usePlatformRoleAccess } from '@/hooks/permissions/usePlatformRoleAccess';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import RefreshProfileButton from '@/components/platform/RefreshProfileButton';

const Integration = () => {
  const { isPlatformAdmin, isPlatformOwner } = usePlatformRoleAccess();

  if (!isPlatformAdmin() && !isPlatformOwner()) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mr-4" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground mb-4">
                  You don't have permission to access integration management.
                  Platform admin access is required.
                </p>
                <RefreshProfileButton />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <IntegrationDashboard />
    </div>
  );
};

export default Integration;
