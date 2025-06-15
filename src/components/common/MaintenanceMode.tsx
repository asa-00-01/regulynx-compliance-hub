
import React from 'react';
import { Construction, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const MaintenanceMode: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <Construction className="h-16 w-16 text-orange-500" />
          </div>
          <CardTitle className="text-2xl">Under Maintenance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We're currently performing scheduled maintenance to improve your experience. 
            We'll be back online shortly.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Expected downtime: 30 minutes</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Thank you for your patience. For urgent matters, please contact our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MaintenanceMode;
