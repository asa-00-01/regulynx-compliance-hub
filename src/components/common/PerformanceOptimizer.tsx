
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Gauge,
  Eye,
  Layout
} from 'lucide-react';
import { usePerformanceAnalytics } from '@/hooks/usePerformanceAnalytics';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import config from '@/config/environment';

const PerformanceOptimizer: React.FC = () => {
  const { analytics: performanceData, isAnalyzing, analyzePerformance } = usePerformanceAnalytics();
  const { measureComponentRender } = usePerformanceMonitor();
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null);

  useEffect(() => {
    const measurement = measureComponentRender('PerformanceOptimizer');
    measurement.start();
    return () => measurement.end();
  }, [measureComponentRender]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBadgeVariant = (rating: string) => {
    switch (rating) {
      case 'good': return 'default';
      case 'needs-improvement': return 'secondary';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  const getRecommendations = () => {
    if (!performanceData?.coreWebVitals) return [];

    const recommendations = [];
    const vitals = performanceData.coreWebVitals;

    if (vitals.lcp && vitals.lcp.rating === 'poor') {
      recommendations.push({
        metric: 'LCP',
        issue: 'Largest Contentful Paint is too slow',
        suggestion: 'Optimize images, remove render-blocking resources, and improve server response times',
        priority: 'high'
      });
    }

    if (vitals.fid && vitals.fid.rating === 'poor') {
      recommendations.push({
        metric: 'FID',
        issue: 'First Input Delay is too high',
        suggestion: 'Reduce JavaScript execution time, split large tasks, and use web workers',
        priority: 'high'
      });
    }

    if (vitals.cls && vitals.cls.rating === 'poor') {
      recommendations.push({
        metric: 'CLS',
        issue: 'Cumulative Layout Shift is causing instability',
        suggestion: 'Set dimensions for images and videos, avoid inserting content above existing content',
        priority: 'medium'
      });
    }

    if (performanceData.resourceTiming.totalSize > 2000) {
      recommendations.push({
        metric: 'Bundle Size',
        issue: 'Total resource size is large',
        suggestion: 'Enable compression, optimize images, and implement code splitting',
        priority: 'medium'
      });
    }

    return recommendations;
  };

  const calculateOverallScore = () => {
    if (!performanceData?.coreWebVitals) return 0;

    let score = 100;
    const vitals = Object.values(performanceData.coreWebVitals).filter(Boolean);
    
    vitals.forEach((vital: any) => {
      switch (vital.rating) {
        case 'poor':
          score -= 20;
          break;
        case 'needs-improvement':
          score -= 10;
          break;
      }
    });

    return Math.max(0, score);
  };

  const overallScore = calculateOverallScore();
  const recommendations = getRecommendations();

  if (!config.features.enablePerformanceMonitoring) {
    return (
      <div className="p-6 text-center">
        <p className="text-muted-foreground">Performance monitoring is disabled</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Optimizer</h2>
          <p className="text-muted-foreground">Analyze and optimize your application's performance</p>
        </div>
        <Button onClick={analyzePerformance} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4 mr-2" />
              Run Analysis
            </>
          )}
        </Button>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Performance Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className="flex-1">
              <Progress value={overallScore} className="h-3" />
              <p className="text-sm text-muted-foreground mt-1">
                {overallScore >= 90 ? 'Excellent' : overallScore >= 70 ? 'Good' : 'Needs Improvement'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="metrics" className="space-y-4">
        <TabsList>
          <TabsTrigger value="metrics">Core Web Vitals</TabsTrigger>
          <TabsTrigger value="resources">Resource Analysis</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>

        <TabsContent value="metrics" className="space-y-4">
          {performanceData?.coreWebVitals ? (
            <div className="grid gap-4 md:grid-cols-2">
              {Object.entries(performanceData.coreWebVitals).map(([key, vital]) => {
                if (!vital) return null;
                
                return (
                  <Card key={key} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-medium">
                          {vital.name}
                        </CardTitle>
                        <Badge variant={getScoreBadgeVariant(vital.rating)}>
                          {vital.rating}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {typeof vital.value === 'number' ? vital.value.toFixed(0) : vital.value}
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {key === 'cls' ? '' : 'ms'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No performance data available. Run an analysis to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          {performanceData?.resourceTiming ? (
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Layout className="h-4 w-4" />
                    Total Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.resourceTiming.totalResources}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Total Size
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.resourceTiming.totalSize} KB
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Cache Hit Ratio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {performanceData.resourceTiming.cacheHitRatio.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No resource data available. Run an analysis to get started.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {rec.priority === 'high' ? (
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        ) : (
                          <CheckCircle className="h-5 w-5 text-yellow-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{rec.metric}</h4>
                          <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                            {rec.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{rec.issue}</p>
                        <p className="text-sm">{rec.suggestion}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="font-medium mb-2">Great Performance!</h3>
                <p className="text-muted-foreground">
                  No performance issues detected. Your application is running optimally.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceOptimizer;
