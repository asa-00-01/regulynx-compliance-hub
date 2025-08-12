
import React from 'react';
import OptimizationCenter from '@/components/common/OptimizationCenter';

const Optimization: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Performance Optimization
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Analyze and optimize your application's performance with comprehensive tools and insights.
            </p>
          </div>
          
          {/* Render OptimizationCenter in embedded mode */}
          <OptimizationCenter embedded={true} />
        </div>
      </div>
    </div>
  );
};

export default Optimization;
