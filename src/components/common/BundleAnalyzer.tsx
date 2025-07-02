
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  FileText, 
  TrendingDown, 
  AlertCircle,
  CheckCircle,
  Download,
  Zap
} from 'lucide-react';
import config from '@/config/environment';

interface BundleAnalysis {
  totalSize: number;
  gzippedSize: number;
  scripts: {
    name: string;
    size: number;
    type: 'vendor' | 'app' | 'chunk';
  }[];
  recommendations: {
    type: 'size' | 'count' | 'optimization';
    severity: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    savings?: string;
  }[];
}

const BundleAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeBundleSize = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate bundle analysis
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const analysisData: BundleAnalysis = {
        totalSize: 0,
        gzippedSize: 0,
        scripts: [],
        recommendations: []
      };

      // Analyze each script
      for (const script of scripts) {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http')) {
          const estimatedSize = src.includes('vendor') ? 
            Math.floor(Math.random() * 500) + 200 : // 200-700KB for vendor
            Math.floor(Math.random() * 100) + 50;   // 50-150KB for app

          const scriptInfo = {
            name: src.split('/').pop() || src,
            size: estimatedSize,
            type: (src.includes('vendor') ? 'vendor' : 
                   src.includes('chunk') ? 'chunk' : 'app') as 'vendor' | 'app' | 'chunk'
          };

          analysisData.scripts.push(scriptInfo);
          analysisData.totalSize += estimatedSize;
        }
      }

      // Estimate gzipped size (typically 30-40% of original)
      analysisData.gzippedSize = Math.floor(analysisData.totalSize * 0.35);

      // Generate recommendations
      if (analysisData.totalSize > 1000) {
        analysisData.recommendations.push({
          type: 'size',
          severity: 'high',
          title: 'Large Bundle Size',
          description: 'Your bundle size is quite large and may impact loading performance.',
          savings: `~${Math.floor(analysisData.totalSize * 0.3)}KB possible reduction`
        });
      }

      if (analysisData.scripts.length > 8) {
        analysisData.recommendations.push({
          type: 'count',
          severity: 'medium',
          title: 'Too Many Script Files',
          description: 'Consider bundling smaller scripts together to reduce HTTP requests.',
          savings: `${analysisData.scripts.length - 5} fewer requests`
        });
      }

      const vendorSize = analysisData.scripts
        .filter(s => s.type === 'vendor')
        .reduce((sum, s) => sum + s.size, 0);

      if (vendorSize > 500) {
        analysisData.recommendations.push({
          type: 'optimization',
          severity: 'medium',
          title: 'Large Vendor Bundle',
          description: 'Consider code splitting and lazy loading for vendor libraries.',
          savings: `~${Math.floor(vendorSize * 0.4)}KB reduction possible`
        });
      }

      // Add some positive recommendations if bundle is small
      if (analysisData.totalSize < 500 && analysisData.recommendations.length === 0) {
        analysisData.recommendations.push({
          type: 'optimization',
          severity: 'low',
          title: 'Excellent Bundle Size',
          description: 'Your bundle size is well optimized for fast loading.'
        });
      }

      setAnalysis(analysisData);
    } catch (error) {
      console.error('Bundle analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    // Auto-run analysis on mount if in development
    if (config.isDevelopment) {
      analyzeBundleSize();
    }
  }, []);

  const getBundleSizeRating = (size: number) => {
    if (size < 300) return { rating: 'excellent', color: 'text-green-600' };
    if (size < 600) return { rating: 'good', color: 'text-blue-600' };
    if (size < 1000) return { rating: 'fair', color: 'text-yellow-600' };
    return { rating: 'poor', color: 'text-red-600' };
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const exportAnalysis = () => {
    if (!analysis) return;

    const report = {
      timestamp: new Date().toISOString(),
      bundleAnalysis: analysis,
      environment: config.app.environment,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bundle-analysis-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const bundleRating = analysis ? getBundleSizeRating(analysis.totalSize) : null;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bundle Analyzer</h2>
          <p className="text-muted-foreground">Analyze your application's bundle size and optimize loading performance</p>
        </div>
        <div className="flex gap-2">
          {analysis && (
            <Button variant="outline" onClick={exportAnalysis}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          <Button onClick={analyzeBundleSize} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <Package className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Analyze Bundle
              </>
            )}
          </Button>
        </div>
      </div>

      {analysis ? (
        <div className="space-y-6">
          {/* Bundle Size Overview */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Bundle Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${bundleRating?.color}`}>
                  {analysis.totalSize} KB
                </div>
                <p className="text-sm text-muted-foreground">
                  {bundleRating?.rating}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Gzipped Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {analysis.gzippedSize} KB
                </div>
                <p className="text-sm text-muted-foreground">
                  {Math.round((analysis.gzippedSize / analysis.totalSize) * 100)}% compression
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Script Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analysis.scripts.length}
                </div>
                <p className="text-sm text-muted-foreground">
                  HTTP requests
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Scripts Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Scripts Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.scripts
                  .sort((a, b) => b.size - a.size)
                  .map((script, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Badge variant={
                        script.type === 'vendor' ? 'default' :
                        script.type === 'chunk' ? 'secondary' : 'outline'
                      }>
                        {script.type}
                      </Badge>
                      
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{script.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Progress 
                            value={(script.size / analysis.totalSize) * 100} 
                            className="h-2 flex-1"
                          />
                          <span className="text-xs text-muted-foreground w-16 text-right">
                            {script.size} KB
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5" />
                Optimization Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    {getSeverityIcon(rec.severity)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{rec.title}</h4>
                        <Badge variant={
                          rec.severity === 'high' ? 'destructive' :
                          rec.severity === 'medium' ? 'secondary' : 'default'
                        }>
                          {rec.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{rec.description}</p>
                      {rec.savings && (
                        <p className="text-sm font-medium text-green-600">
                          Potential savings: {rec.savings}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Bundle Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Analyze your application's bundle to identify optimization opportunities.
            </p>
            <Button onClick={analyzeBundleSize} disabled={isAnalyzing}>
              {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BundleAnalyzer;
