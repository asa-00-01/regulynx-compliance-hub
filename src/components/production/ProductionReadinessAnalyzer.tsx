
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Shield,
  Zap,
  Settings,
  Eye,
  Download
} from 'lucide-react';
import { useProductionReadiness } from '@/hooks/useProductionReadiness';
import { useOptimizationSuite } from '@/hooks/useOptimizationSuite';

const ProductionReadinessAnalyzer: React.FC = () => {
  const { report, isLoading, runChecks } = useProductionReadiness();
  const { 
    productionReport, 
    overallScore, 
    isAnalyzing, 
    runFullAnalysis, 
    exportReport 
  } = useOptimizationSuite();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security':
        return <Shield className="h-4 w-4" />;
      case 'performance':
        return <Zap className="h-4 w-4" />;
      case 'configuration':
        return <Settings className="h-4 w-4" />;
      case 'monitoring':
        return <Eye className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isProductionReady = report?.isReady && overallScore >= 80;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Production Readiness Analysis</h2>
          <p className="text-muted-foreground">
            Comprehensive analysis of your application's production readiness
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={runChecks} 
            disabled={isLoading}
            variant="outline"
          >
            Run Basic Checks
          </Button>
          <Button 
            onClick={runFullAnalysis} 
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analyzing...' : 'Full Analysis'}
          </Button>
          {(report || productionReport) && (
            <Button onClick={exportReport} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          )}
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Production Readiness Status
            {report && (
              <Badge 
                variant={isProductionReady ? 'default' : 'destructive'}
                className="ml-2"
              >
                {isProductionReady ? 'Ready for Production' : 'Not Ready'}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Configuration Score</span>
                <div className="flex items-center gap-2">
                  <Progress value={report.score} className="w-32" />
                  <span className={`font-bold ${getScoreColor(report.score)}`}>
                    {report.score}%
                  </span>
                </div>
              </div>
              
              {overallScore > 0 && (
                <div className="flex items-center justify-between">
                  <span>Overall Score</span>
                  <div className="flex items-center gap-2">
                    <Progress value={overallScore} className="w-32" />
                    <span className={`font-bold ${getScoreColor(overallScore)}`}>
                      {overallScore}%
                    </span>
                  </div>
                </div>
              )}

              {report.recommendations.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <div className="font-medium">Recommendations:</div>
                      {report.recommendations.map((rec, index) => (
                        <div key={index} className="text-sm">• {rec}</div>
                      ))}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Click "Run Basic Checks" or "Full Analysis" to analyze your application
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configuration Checks */}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration Checks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {report.checks.map((check, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-3 p-3 border rounded"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {getStatusIcon(check.status)}
                    {getCategoryIcon(check.category)}
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{check.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {check.message}
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">
                    {check.category}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Production Optimization Report */}
      {productionReport && (
        <Card>
          <CardHeader>
            <CardTitle>Production Optimization Report</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{productionReport.summary.total}</div>
                  <div className="text-sm text-muted-foreground">Total Issues</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {productionReport.summary.critical}
                  </div>
                  <div className="text-sm text-muted-foreground">Critical</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {productionReport.summary.high}
                  </div>
                  <div className="text-sm text-muted-foreground">High</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {productionReport.summary.medium}
                  </div>
                  <div className="text-sm text-muted-foreground">Medium</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {productionReport.summary.fixed}
                  </div>
                  <div className="text-sm text-muted-foreground">Fixed</div>
                </div>
              </div>

              {/* Opportunities */}
              <div className="space-y-3">
                {productionReport.opportunities
                  .filter(opp => !opp.isFixed)
                  .slice(0, 10) // Show top 10 issues
                  .map((opportunity, index) => (
                    <div 
                      key={index} 
                      className="flex items-start gap-3 p-3 border rounded"
                    >
                      <Badge 
                        variant={
                          opportunity.severity === 'critical' ? 'destructive' :
                          opportunity.severity === 'high' ? 'destructive' :
                          opportunity.severity === 'medium' ? 'default' : 'secondary'
                        }
                      >
                        {opportunity.severity}
                      </Badge>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{opportunity.title}</div>
                        <div className="text-sm text-muted-foreground mb-2">
                          {opportunity.description}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Impact:</span> {opportunity.impact}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Recommendation:</span> {opportunity.recommendation}
                        </div>
                        {opportunity.estimatedSavings && (
                          <div className="text-sm text-green-600">
                            <span className="font-medium">Potential Savings:</span> {opportunity.estimatedSavings}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {opportunity.category}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      {productionReport?.metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {productionReport.metrics.bundleSize && (
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {productionReport.metrics.bundleSize}KB
                  </div>
                  <div className="text-sm text-muted-foreground">Bundle Size</div>
                </div>
              )}
              {productionReport.metrics.loadTime && (
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {Math.round(productionReport.metrics.loadTime)}ms
                  </div>
                  <div className="text-sm text-muted-foreground">Load Time</div>
                </div>
              )}
              {productionReport.metrics.memoryCoverage && (
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {productionReport.metrics.memoryCoverage.toFixed(1)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Memory Usage</div>
                </div>
              )}
              {productionReport.metrics.securityScore && (
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {productionReport.metrics.securityScore}
                  </div>
                  <div className="text-sm text-muted-foreground">Security Score</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProductionReadinessAnalyzer;
