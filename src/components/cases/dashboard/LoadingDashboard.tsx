
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const LoadingDashboard: React.FC = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map(i => (
        <Card key={i} className="h-32">
          <CardContent className="p-6">
            <div className="h-full animate-pulse bg-muted rounded-md"></div>
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[1, 2].map(i => (
        <Card key={i} className="h-80">
          <CardContent className="p-6">
            <div className="h-full animate-pulse bg-muted rounded-md"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

export default LoadingDashboard;
