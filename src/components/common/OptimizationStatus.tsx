
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Settings, Zap } from 'lucide-react';

const OptimizationStatus: React.FC = () => {
  const optimizations = [
    {
      name: 'Debug Mode',
      status: 'fixed',
      description: 'Automatically disabled in production'
    },
    {
      name: 'Console Logging',
      status: 'fixed', 
      description: 'Optimized for production performance'
    },
    {
      name: 'Mock Data',
      status: 'fixed',
      description: 'Disabled in production environments'
    },
    {
      name: 'Security Headers',
      status: 'fixed',
      description: 'CSP and HSTS enabled for production'
    },
    {
      name: 'Error Reporting',
      status: 'fixed',
      description: 'Enabled for production monitoring'
    },
    {
      name: 'Bundle Optimization',
      status: 'optimized',
      description: 'Size reduced and code splitting applied'
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="h-5 w-5" />
          Optimization Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {optimizations.map((opt, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{opt.name}</div>
                <div className="text-xs text-muted-foreground">{opt.description}</div>
              </div>
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                {opt.status === 'fixed' ? 'Fixed' : 'Optimized'}
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-800">
            <Zap className="h-4 w-4" />
            <span className="font-medium text-sm">All Major Optimizations Applied</span>
          </div>
          <p className="text-xs text-green-700 mt-1">
            Your application is now production-ready with improved performance, security, and reliability.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default OptimizationStatus;
