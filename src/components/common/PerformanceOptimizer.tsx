
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  TrendingUp, 
  Clock, 
  Download,
  Image,
  Code,
  Wifi,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { usePerformanceAnalytics } from '@/hooks/usePerformanceAnalytics';
import config from '@/config/environment';

interface OptimizationTip {
  category: 'images' | 'code' | 'network' | 'caching' | 'rendering';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  effort: 'easy' | 'medium' | 'hard';
  estimatedGain: string;
}

const PerformanceOptimizer: React.FC = () => {
  const { analytics, isAnalyzing, analyzePerformance } = usePerformanceAnalytics();
  const [optimizationTips, setOptimizationTips] = useState<OptimizationTip[]>([]);
  const [performanceScore, setPerformanceScore] = useState(0);

  useEffect(() => {
    if (analytics) {
      generateOptimizationTips();
      calculatePerformanceScore();
    }
  }, [analytics]);

  const generateOptimizationTips = () => {
    if (!analytics) return;

    const tips: OptimizationTip[] = [];
    const { coreWebVitals, resourceTiming, loadTimes } = analytics;

    // LCP optimization tips
    if (coreWebVitals.lcp && coreWebVitals.lcp.rating !== 'good') {
      tips.push({
        category: 'images',
        title: 'Optimize Largest Contentful Paint (LCP)',
        description: 'Your LCP is slow. Consider optimizing images, preloading critical resources, or using a CDN.',
        impact: 'high',
        effort: 'medium',
        estimatedGain: '1-3s faster load time',
      });
    }

    // FID optimization tips
    if (coreWebVitals.fid && coreWebVitals.fid.rating !== 'good') {
      tips.push({
        category: 'code',
        title: 'Reduce First Input Delay (FID)',
        description: 'Break up long JavaScript tasks and defer non-essential scripts.',
        impact: 'high',
        effort: 'medium',
        estimatedGain: '50-200ms faster interaction',
      });
    }

    // CLS optimization tips
    if (coreWebVitals.cls && coreWebVitals.cls.rating !== 'good') {
      tips.push({
        category: 'rendering',
        title: 'Fix Cumulative Layout Shift (CLS)',
        description: 'Add dimensions to images and reserve space for dynamic content.',
        impact: 'medium',
        effort: 'easy',
        estimatedGain: 'Better visual stability',
      });
    }

    // Resource optimization
    if (resourceTiming.totalSize > 2000) { // > 2MB
      tips.push({
        category: 'network',
        title: 'Reduce Bundle Size',
        description: `Your total resource size is ${resourceTiming.totalSize}KB. Consider code splitting and compression.`,
        impact: 'high',
        effort: 'hard',
        estimatedGain: `${Math.round(resourceTiming.totalSize * 0.3)}KB reduction possible`,
      });
    }

    // Cache optimization
    if (resourceTiming.cacheHitRatio < 50) {
      tips.push({
        category: 'caching',
        title: 'Improve Cache Strategy',
        description: `Only ${resourceTiming.cacheHitRatio.toFixed(1)}% cache hit ratio. Implement better caching headers.`,
        impact: 'medium',
        effort: 'medium',
        estimatedGain: '30-50% faster repeat visits',
      });
    }

    // Generic optimizations based on load times
    if (loadTimes.domContentLoaded > 3000) {
      tips.push({
        category: 'code',
        title: 'Optimize Critical Rendering Path',
        description: 'DOM Content Loaded is slow. Minimize critical CSS and defer non-essential JavaScript.',
        impact: 'high',
        effort: 'medium',
        estimatedGain: '1-2s faster initial render',
      });
    }

    setOptimizationTips(tips);
  };

  const calculatePerformanceScore = () => {
    if (!analytics) return;

    let score = 100;
    const { coreWebVitals } = analytics;

    // Deduct points based on Core Web Vitals
    Object.values(coreWebVitals).forEach((metric) => {
      if (metric) {
        switch (metric.rating) {
          case 'poor':
            score -= 20;
            break;
          case 'needs-improvement':
            score -= 10;
            break;
        }
      }
    });

    setPerformanceScore(Math.max(0, score));
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getMetricIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: OptimizationTip['category']) => {
    switch (category) {
      case 'images':
        return <Image className="h-4 w-4" />;
      case 'code':
        return <Code className="h-4 w-4" />;
      case 'network':
        return <Wifi className="h-4 w-4" />;
      case 'caching':
        return <Download className="h-4 w-4" />;
      case 'rendering':
        return <Eye className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: OptimizationTip['impact']) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  const getEffortColor = (effort: OptimizationTip['effort']) => {
    switch (effort) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
    }
  };

  if (!config.isDevelopment && !config.features.enableDebugMode) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Performance Optimizer
          </h2>
          <p className="text-muted-foreground">
            Analyze and optimize your application's performance
          </p>
        </div>
        <Button onClick={analyzePerformance} disabled={isAnalyzing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      {analytics && (
        <>
          {/* Performance Score */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Performance Score</h3>
                  <p className={`text-3xl font-bold ${getScoreColor(performanceScore)}`}>
                    {performanceScore}
                  </p>
                </div>
                <div className="text-right">
                  <Progress value={performanceScore} className="w-32 h-3" />
                  <p className="text-sm text-muted-foreground mt-1">
                    {performanceScore >= 90 ? 'Excellent' : 
                     performanceScore >= 70 ? 'Good' : 'Needs Work'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="metrics" className="space-y-4">
            <TabsList>
              <TabsTrigger value="metrics">Core Web Vitals</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="optimization">Optimization Tips</TabsTrigger>
            </TabsList>

            <TabsContent value="metrics">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(analytics.coreWebVitals).map(([key, metric]) => {
                  if (!metric) return null;
                  
                  return (
                    <Card key={key}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{metric.name}</h4>
                          {getMetricIcon(metric.rating)}
                        </div>
                        <p className="text-2xl font-bold">
                          {key === 'cls' ? metric.value.toFixed(3) : `${Math.round(metric.value)}ms`}
                        </p>
                        <Badge className={`mt-2 ${
                          metric.rating === 'good' ? 'bg-green-100 text-green-800' :
                          metric.rating === 'needs-improvement' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {metric.rating.replace('-', ' ')}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="resources">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Resource Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Total Resources:</span>
                        <span className="font-medium">{analytics.resourceTiming.totalResources}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Size:</span>
                        <span className="font-medium">{analytics.resourceTiming.totalSize}KB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cache Hit Ratio:</span>
                        <span className="font-medium">{analytics.resourceTiming.cacheHitRatio.toFixed(1)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h4 className="font-medium mb-2">Load Times</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>DOM Content Loaded:</span>
                        <span className="font-medium">{Math.round(analytics.loadTimes.domContentLoaded)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Window Load:</span>
                        <span className="font-medium">{Math.round(analytics.loadTimes.windowLoad)}ms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="optimization">
              <div className="space-y-4">
                {optimizationTips.length === 0 ? (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      🎉 Great job! No optimization issues detected. Your app is performing well!
                    </AlertDescription>
                  </Alert>
                ) : (
                  optimizationTips.map((tip, index) => (
                    <Card key={index}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg mt-1">
                            {getCategoryIcon(tip.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{tip.title}</h4>
                              <Badge className={getImpactColor(tip.impact)}>
                                {tip.impact} impact
                              </Badge>
                              <Badge className={getEffortColor(tip.effort)}>
                                {tip.effort}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {tip.description}
                            </p>
                            <p className="text-sm font-medium text-green-600">
                              💡 Potential gain: {tip.estimatedGain}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </>
      )}

      {!analytics && !isAnalyzing && (
        <Alert>
          <TrendingUp className="h-4 w-4" />
          <AlertDescription>
            Click "Analyze" to start performance monitoring and get optimization recommendations.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default PerformanceOptimizer;
