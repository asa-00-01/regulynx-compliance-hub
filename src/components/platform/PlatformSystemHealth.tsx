
import React from 'react';
import SystemHealthMonitor from '@/components/common/SystemHealthMonitor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Server, Database, Wifi } from 'lucide-react';

const PlatformSystemHealth: React.FC = () => {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">System Health Monitor</h1>
        <p className="text-muted-foreground">
          Monitor platform infrastructure and service health
        </p>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { name: 'API Gateway', status: 'healthy', icon: Server },
          { name: 'Database', status: 'healthy', icon: Database },
          { name: 'Authentication', status: 'healthy', icon: Wifi },
          { name: 'Background Jobs', status: 'warning', icon: Activity },
        ].map((service) => (
          <Card key={service.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{service.name}</CardTitle>
              <service.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-lg font-bold ${
                service.status === 'healthy' ? 'text-green-600' : 
                service.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed System Health */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed System Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <SystemHealthMonitor />
        </CardContent>
      </Card>
    </div>
  );
};

export default PlatformSystemHealth;
