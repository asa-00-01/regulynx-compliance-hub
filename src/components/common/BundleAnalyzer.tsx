
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Package, 
  TrendingDown, 
  FileText, 
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Code
} from 'lucide-react';
import config from '@/config/environment';

interface BundleAsset {
  name: string;
  size: number;
  type: 'js' | 'css' | 'image' | 'font' | 'other';
  compressed?: boolean;
  critical?: boolean;
}

interface BundleAnalysis {
  totalSize: number;
  compressedSize: number;
  assets: BundleAsset[];
  recommendations: string[];
  compressionRatio: number;
  score: number;
}

const BundleAnalyzer: React.FC = () => {
  const [analysis, setAnalysis] = useState<BundleAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeBundleSize = async () => {
    setIsAnalyzing(true);

    try {
      const assets: BundleAsset[] = [];
      let totalSize = 0;
      let compressedSize = 0;

      // Analyze JavaScript files
      const scripts = document.querySelectorAll('script[src]');
      for (const script of scripts) {
        const src = script.getAttribute('src');
        if (src && !src.startsWith('http')) {
          try {
            const response = await fetch(src, { method: 'HEAD' });
            const size = parseInt(response.headers.get('content-length') || '0');
            const compressed = response.headers.get('content-encoding') !== null;
            
            assets.push({
              name: src.split('/').pop() || src,
              size,
              type: 'js',
              compressed,
              critical: script.hasAttribute('defer') || script.hasAttribute('async') ? false : true,
            });
            
            totalSize += size;
            if (compressed) compressedSize += size;
          } catch (error) {
            // Estimate size for local development
            const estimatedSize = src.includes('vendor') ? 500000 : 100000;
            assets.push({
              name: src.split('/').pop() || src,
              size: estimatedSize,
              type: 'js',
              compressed: false,
              critical: true,
            });
            totalSize += estimatedSize;
          }
        }
      }

      // Analyze CSS files
      const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
      for (const stylesheet of stylesheets) {
        const href = stylesheet.getAttribute('href');
        if (href && !href.startsWith('http')) {
          try {
            const response = await fetch(href, { method: 'HEAD' });
            const size = parseInt(response.headers.get('content-length') || '0');
            const compressed = response.headers.get('content-encoding') !== null;
            
            assets.push({
              name: href.split('/').pop() || href,
              size,
              type: 'css',
              compressed,
              critical: true,
            });
            
            totalSize += size;
            if (compressed) compressedSize += size;
          } catch (error) {
            // Estimate size for local development
            const estimatedSize = 50000;
            assets.push({
              name: href.split('/').pop() || href,
              size: estimatedSize,
              type: 'css',
              compressed: false,
              critical: true,
            });
            totalSize += estimatedSize;
          }
        }
      }

      // Analyze images
      const images = document.querySelectorAll('img[src]');
      for (const img of Array.from(images).slice(0, 10)) { // Limit to first 10 images
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:') && !src.startsWith('http')) {
          const estimatedSize = 100000; // Estimate 100KB per image
          assets.push({
            name: src.split('/').pop() || src,
            size: estimatedSize,
            type: 'image',
            compressed: false,
            critical: false,
          });
          totalSize += estimatedSize;
        }
      }

      // Generate recommendations
      const recommendations: string[] = [];
      const jsAssets = assets.filter(a => a.type === 'js');
      const largeAssets = assets.filter(a => a.size > 500000); // > 500KB
      const uncompressedAssets = assets.filter(a => !a.compressed && a.size > 10000); // > 10KB

      if (totalSize > 2000000) { // > 2MB
        recommendations.push('Bundle size is large (>2MB). Consider code splitting and lazy loading.');
      }

      if (jsAssets.length > 5) {
        recommendations.push(`Too many JavaScript files (${jsAssets.length}). Consider bundling to reduce HTTP requests.`);
      }

      if (largeAssets.length > 0) {
        recommendations.push(`Found ${largeAssets.length} large asset(s). Consider optimization or splitting.`);
      }

      if (uncompressedAssets.length > 0) {
        recommendations.push(`${uncompressedAssets.length} assets are not compressed. Enable gzip/brotli compression.`);
      }

      if (assets.filter(a => a.type === 'image').length > 0) {
        recommendations.push('Consider optimizing images with WebP format and proper sizing.');
      }

      const compressionRatio = totalSize > 0 ? (compressedSize / totalSize) * 100 : 0;
      const score = Math.max(0, 100 - Math.floor(totalSize / 50000)); // Decrease score for every 50KB

      setAnalysis({
        totalSize,
        compressedSize,
        assets,
        recommendations,
        compressionRatio,
        score,
      });

    } catch (error) {
      console.error('Bundle analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (config.isDevelopment || config.features.enableDebugMode) {
      // Auto-analyze on mount with delay
      const timer = setTimeout(analyzeBundleSize, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getAssetIcon = (type: BundleAsset['type']) => {
    switch (type) {
      case 'js':
        return <Code className="h-4 w-4 text-yellow-500" />;
      case 'css':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'image':
        return <Download className="h-4 w-4 text-green-500" />;
      case 'font':
        return <FileText className="h-4 w-4 text-purple-500" />;
      default:
        return <Package className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!config.isDevelopment && !config.features.enableDebugMode) {
    return null;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Package className="h-6 w-6" />
            Bundle Analyzer
          </h2>
          <p className="text-muted-foreground">
            Analyze your application's bundle size and optimize loading performance
          </p>
        </div>
        <Button onClick={analyzeBundleSize} disabled={isAnalyzing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
          {isAnalyzing ? 'Analyzing...' : 'Analyze Bundle'}
        </Button>
      </div>

      {analysis && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bundle Score</p>
                    <p className={`text-2xl font-bold ${getScoreColor(analysis.score)}`}>
                      {analysis.score}
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
                    <p className="text-sm text-muted-foreground">Total Size</p>
                    <p className="text-2xl font-bold">{formatSize(analysis.totalSize)}</p>
                  </div>
                  <Package className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Compression</p>
                    <p className="text-2xl font-bold">{analysis.compressionRatio.toFixed(1)}%</p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Assets</p>
                    <p className="text-2xl font-bold">{analysis.assets.length}</p>
                  </div>
                  <FileText className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assets List */}
          <Card>
            <CardHeader>
              <CardTitle>Bundle Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.assets
                  .sort((a, b) => b.size - a.size)
                  .slice(0, 10)
                  .map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getAssetIcon(asset.type)}
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <div className="flex gap-2 mt-1">
                            <Badge variant="outline">{asset.type.toUpperCase()}</Badge>
                            {asset.compressed && (
                              <Badge className="bg-green-100 text-green-800">Compressed</Badge>
                            )}
                            {asset.critical && (
                              <Badge className="bg-orange-100 text-orange-800">Critical</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatSize(asset.size)}</p>
                        <div className="w-24 mt-1">
                          <Progress 
                            value={(asset.size / Math.max(...analysis.assets.map(a => a.size))) * 100} 
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Optimization Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {analysis.recommendations.length === 0 && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                🎉 Great! Your bundle is well optimized with no major issues detected.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {!analysis && !isAnalyzing && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Bundle Analysis</h3>
            <p className="text-muted-foreground mb-4">
              Analyze your application's bundle to identify optimization opportunities
            </p>
            <Button onClick={analyzeBundleSize}>
              Start Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BundleAnalyzer;
