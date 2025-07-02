
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Package, 
  TrendingUp, 
  Settings,
  Eye
} from 'lucide-react';
import PerformanceOptimizer from './PerformanceOptimizer';
import BundleAnalyzer from './BundleAnalyzer';
import ProductionReadinessChecker from './ProductionReadinessChecker';
import config from '@/config/environment';

const OptimizationCenter: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  if (!config.isDevelopment && !config.features.enableDebugMode) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isVisible ? (
        <Button
          onClick={() => setIsVisible(true)}
          size="lg"
          className="shadow-lg"
        >
          <Zap className="h-5 w-5 mr-2" />
          Optimization Center
        </Button>
      ) : (
        <Card className="w-[90vw] max-w-6xl h-[80vh] shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Optimization Center
              </CardTitle>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                size="sm"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-full overflow-hidden">
            <Tabs defaultValue="performance" className="h-full flex flex-col">
              <TabsList className="mx-6 mb-4">
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

              <div className="flex-1 overflow-y-auto">
                <TabsContent value="performance" className="mt-0 h-full">
                  <PerformanceOptimizer />
                </TabsContent>

                <TabsContent value="bundle" className="mt-0 h-full">
                  <BundleAnalyzer />
                </TabsContent>

                <TabsContent value="production" className="mt-0 h-full">
                  <ProductionReadinessChecker />
                </TabsContent>
              </div>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OptimizationCenter;
