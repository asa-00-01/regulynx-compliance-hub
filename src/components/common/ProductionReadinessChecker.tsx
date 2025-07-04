import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  TrendingUp,
  Shield,
  Zap,
  Search,
  Eye,
  ChevronDown,
  ChevronUp,
  Info,
  Star
} from 'lucide-react';
import config from '@/config/environment';
import { analyzeProductionReadiness, OptimizationReport, OptimizationOpportunity } from '@/utils/productionOptimization';
import { getPerformanceScore, performanceMonitor } from '@/services/performanceMonitor';
import OptimizationStatus from './OptimizationStatus';

const ProductionReadinessChecker: React.FC = () => {
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(0);
  const [expandedOpportunities, setExpandedOpportunities] = useState<Set<string>>(new Set());

  useEffect(() => {
    runAnalysis();
    
    // Update performance score periodically
    const interval = setInterval(() => {
      setPerformanceScore(getPerformanceScore());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const analysisReport = await analyzeProductionReadiness();
      setReport(analysisReport);
      setPerformanceScore(getPerformanceScore());
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleOpportunityExpansion = (opportunityId: string) => {
    setExpandedOpportunities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(opportunityId)) {
        newSet.delete(opportunityId);
      } else {
        newSet.add(opportunityId);
      }
      return newSet;
    });
  };

  const getSeverityIcon = (severity: OptimizationOpportunity['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: OptimizationOpportunity['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getSeverityBadgeVariant = (severity: OptimizationOpportunity['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive' as const;
      case 'high':
        return 'secondary' as const;
      case 'medium':
        return 'outline' as const;
      case 'low':
        return 'default' as const;
    }
  };

  const getCategoryIcon = (category: OptimizationOpportunity['category']) => {
    switch (category) {
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'bundle':
        return <TrendingUp className="h-4 w-4" />;
      case 'seo':
        return <Search className="h-4 w-4" />;
      case 'accessibility':
        return <Eye className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getReadinessStatus = (score: number) => {
    if (score >= 90) return { status: 'Ready', color: 'text-green-600' };
    if (score >= 70) return { status: 'Nearly Ready', color: 'text-yellow-600' };
    return { status: 'Not Ready', color: 'text-red-600' };
  };

  if (!config.isDevelopment && !config.features.enableDebugMode) {
    return (
      <div className="p-6 text-center">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Production Readiness Checker is only available in development mode or when debug mode is enabled.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const readinessStatus = report ? getReadinessStatus(report.score) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold">Production Readiness Analysis</h2>
          <p className="text-muted-foreground text-sm">
            Comprehensive analysis of your application for production deployment
          </p>
          {readinessStatus && (
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">Status: </span>
              <span className={`font-semibold ${readinessStatus.color}`}>
                {readinessStatus.status}
              </span>
            </div>
          )}
        </div>
        <Button onClick={runAnalysis} disabled={isAnalyzing} className="flex-shrink-0">
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
        </Button>
      </div>

      <OptimizationStatus />

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Readiness Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                    {report.score}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {readinessStatus?.status}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Progress value={report.score} className="w-16 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Performance Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
                    {Math.round(performanceScore)}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Fixed Issues</p>
                  <p className="text-2xl font-bold text-green-600">
                    {report.summary.fixed}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Remaining Issues</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {report.summary.total - report.summary.fixed}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-muted-foreground">Total Analyzed</p>
                  <p className="text-2xl font-bold">
                    {report.summary.total}
                  </p>
                </div>
                <Star className="h-8 w-8 text-blue-500 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {report?.metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {report.metrics.bundleSize && (
                <div>
                  <p className="text-muted-foreground">Bundle Size</p>
                  <p className="font-semibold">{Math.round(report.metrics.bundleSize)}KB</p>
                </div>
              )}
              {report.metrics.loadTime && (
                <div>
                  <p className="text-muted-foreground">Load Time</p>
                  <p className="font-semibold">{Math.round(report.metrics.loadTime)}ms</p>
                </div>
              )}
              {report.metrics.memoryCoverage && (
                <div>
                  <p className="text-muted-foreground">Memory Usage</p>
                  <p className="font-semibold">{report.metrics.memoryCoverage.toFixed(1)}%</p>
                </div>
              )}
              {report.metrics.securityScore && (
                <div>
                  <p className="text-muted-foreground">Security Score</p>
                  <p className="font-semibold">{report.metrics.securityScore}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {report && report.opportunities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>
              Analysis Results ({report.opportunities.length} items) 
              {report.summary.fixed > 0 && (
                <Badge variant="default" className="ml-2 bg-green-100 text-green-800 border-green-200">
                  {report.summary.fixed} Fixed
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.opportunities
              .sort((a, b) => {
                // Show fixed items first, then sort by severity
                if (a.isFixed && !b.isFixed) return -1;
                if (!a.isFixed && b.isFixed) return 1;
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
              })
              .map((opportunity, index) => (
                <Collapsible key={opportunity.id}>
                  <Alert className={`border ${getSeverityColor(opportunity.severity)} ${opportunity.isFixed ? 'bg-green-50 border-green-200' : ''}`}>
                    <CollapsibleTrigger 
                      className="w-full"
                      onClick={() => toggleOpportunityExpansion(opportunity.id)}
                    >
                      <div className="flex items-start gap-3 w-full text-left">
                        <div className="flex items-center gap-2 mt-1 flex-shrink-0">
                          {opportunity.isFixed ? 
                            <CheckCircle className="h-4 w-4 text-green-500" /> :
                            getSeverityIcon(opportunity.severity)
                          }
                          {getCategoryIcon(opportunity.category)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 mb-1 min-w-0 flex-1">
                              <h4 className="font-medium">{opportunity.title}</h4>
                              <div className="flex gap-1 flex-shrink-0">
                                {opportunity.isFixed ? (
                                  <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                                    Fixed
                                  </Badge>
                                ) : (
                                  <Badge variant={getSeverityBadgeVariant(opportunity.severity)} className="text-xs">
                                    {opportunity.severity}
                                  </Badge>
                                )}
                                <Badge variant="outline" className="capitalize text-xs">
                                  {opportunity.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              {expandedOpportunities.has(opportunity.id) ? 
                                <ChevronUp className="h-4 w-4" /> : 
                                <ChevronDown className="h-4 w-4" />
                              }
                            </div>
                          </div>
                          <AlertDescription className="text-sm">
                            {opportunity.description}
                          </AlertDescription>
                        </div>
                      </div>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent className="mt-3">
                      <div className="pl-9 space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-red-600">Impact: </span>
                          {opportunity.impact}
                        </div>
                        <div>
                          <span className="font-medium text-green-600">Recommendation: </span>
                          {opportunity.recommendation}
                        </div>
                        {opportunity.estimatedSavings && (
                          <div>
                            <span className="font-medium text-blue-600">Potential Savings: </span>
                            {opportunity.estimatedSavings}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={
                            opportunity.implementation === 'easy' ? 'default' :
                            opportunity.implementation === 'medium' ? 'secondary' : 'destructive'
                          }>
                            {opportunity.implementation} to implement
                          </Badge>
                          {opportunity.isFixed && (
                            <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                              ✓ Applied
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Alert>
                </Collapsible>
              ))}
          </CardContent>
        </Card>
      )}

      {report && report.opportunities.filter(o => !o.isFixed).length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            🎉 Excellent! Your application is production-ready with all major optimization opportunities addressed.
            All systems are properly configured for deployment.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProductionReadinessChecker;
