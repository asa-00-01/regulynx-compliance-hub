
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Package, 
  TrendingUp, 
  Settings,
  X
} from 'lucide-react';
import PerformanceOptimizer from './PerformanceOptimizer';
import BundleAnalyzer from './BundleAnalyzer';
import ProductionReadinessChecker from './ProductionReadinessChecker';
import config from '@/config/environment';

interface OptimizationCenterProps {
  embedded?: boolean;
}

const OptimizationCenter: React.FC<OptimizationCenterProps> = ({ embedded = false }) => {
  const [isVisible, setIsVisible] = useState(false);

  // If embedded, always show the content
  if (embedded) {
    return (
      <Card className="w-full shadow-xl bg-white border">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="text-xl flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Optimization Center
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="mx-6 mb-4 mt-4">
              <TabsTrigger value="performance" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="bundle" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Bundle Analysis
              </TabsTrigger>
              <TabsTrigger value="production" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Production Ready
              </TabsTrigger>
            </TabsList>

            <div className="overflow-y-auto max-h-[80vh]">
              <TabsContent value="performance" className="mt-0">
                <PerformanceOptimizer />
              </TabsContent>

              <TabsContent value="bundle" className="mt-0">
                <BundleAnalyzer />
              </TabsContent>

              <TabsContent value="production" className="mt-0">
                <ProductionReadinessChecker />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    );
  }

  // Don't show floating version anymore - redirect users to the Developer Tools page
  return null;
};

export default OptimizationCenter;
