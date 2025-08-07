
import React from 'react';
import IntegrationDashboard from '@/components/integration/IntegrationDashboard';
import { useFeatureAccess } from '@/hooks/use-permissions';
import { AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const Integration = () => {
  const { canManageCases } = useFeatureAccess();

  if (!canManageCases) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-yellow-500 mr-4" />
              <div>
                <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
                <p className="text-muted-foreground">
                  You don't have permission to access integration management.
                  Contact your administrator for access.
                </p>
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
