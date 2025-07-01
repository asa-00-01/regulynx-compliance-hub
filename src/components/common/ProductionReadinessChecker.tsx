
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw, 
  TrendingUp,
  Shield,
  Zap,
  Search,
  Eye
} from 'lucide-react';
import config from '@/config/environment';
import { analyzeProductionReadiness, OptimizationReport, OptimizationOpportunity } from '@/utils/productionOptimization';
import { getPerformanceScore, performanceMonitor } from '@/services/performanceMonitor';

const ProductionReadinessChecker: React.FC = () => {
  const [report, setReport] = useState<OptimizationReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [performanceScore, setPerformanceScore] = useState(0);

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

  const getSeverityIcon = (severity: OptimizationOpportunity['severity']) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getSeverityColor = (severity: OptimizationOpportunity['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
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

  if (!config.isDevelopment && !config.features.enableDebugMode) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Production Readiness</h2>
          <p className="text-muted-foreground">
            Analyze your application for production deployment
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={isAnalyzing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </Button>
      </div>

      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overall Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                    {report.score}
                  </p>
                </div>
                <div className="text-right">
                  <Progress value={report.score} className="w-16 h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Performance Score</p>
                  <p className={`text-2xl font-bold ${getScoreColor(performanceScore)}`}>
                    {Math.round(performanceScore)}
                  </p>
                </div>
                <Zap className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                  <p className="text-2xl font-bold text-red-600">
                    {report.summary.critical}
                  </p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold">
                    {report.summary.total}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500" />
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
            <CardTitle>Optimization Opportunities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {report.opportunities
              .sort((a, b) => {
                const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
              })
              .map((opportunity, index) => (
                <Alert key={index} className={`border ${getSeverityColor(opportunity.severity)}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 mt-1">
                      {getSeverityIcon(opportunity.severity)}
                      {getCategoryIcon(opportunity.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{opportunity.title}</h4>
                        <Badge variant="outline" className={getSeverityColor(opportunity.severity)}>
                          {opportunity.severity}
                        </Badge>
                        <Badge variant="outline">
                          {opportunity.category}
                        </Badge>
                      </div>
                      <AlertDescription className="text-sm mb-2">
                        {opportunity.description}
                      </AlertDescription>
                      <div className="text-sm space-y-1">
                        <p><strong>Impact:</strong> {opportunity.impact}</p>
                        <p><strong>Recommendation:</strong> {opportunity.recommendation}</p>
                        {opportunity.estimatedSavings && (
                          <p><strong>Potential Savings:</strong> {opportunity.estimatedSavings}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant={
                            opportunity.implementation === 'easy' ? 'default' :
                            opportunity.implementation === 'medium' ? 'secondary' : 'destructive'
                          }>
                            {opportunity.implementation} to implement
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
          </CardContent>
        </Card>
      )}

      {report && report.opportunities.length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            🎉 Congratulations! Your application appears to be production-ready with no major issues detected.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ProductionReadinessChecker;
