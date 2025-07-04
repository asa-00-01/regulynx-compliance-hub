
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

  // If embedded, show content without extra card wrapper
  if (embedded) {
    return (
      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="mb-4">
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

        <TabsContent value="performance" className="mt-0">
          <PerformanceOptimizer />
        </TabsContent>

        <TabsContent value="bundle" className="mt-0">
          <BundleAnalyzer />
        </TabsContent>

        <TabsContent value="production" className="mt-0">
          <ProductionReadinessChecker />
        </TabsContent>
      </Tabs>
    );
  }

  // Don't show floating version anymore - redirect users to the Developer Tools page
  return null;
};

export default OptimizationCenter;
