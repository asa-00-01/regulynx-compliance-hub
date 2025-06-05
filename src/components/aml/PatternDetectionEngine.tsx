
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, AlertTriangle, TrendingUp, Clock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockTransactions } from './mockTransactionData';
import { AMLTransaction } from '@/types/aml';

interface DetectedPattern {
  id: string;
  name: string;
  description: string;
  category: 'structuring' | 'high_risk_corridor' | 'time_pattern' | 'velocity';
  severity: 'low' | 'medium' | 'high';
  matchCount: number;
  lastDetected: string;
  transactions: AMLTransaction[];
}

const PatternDetectionEngine: React.FC = () => {
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const runPatternAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      // Simulate pattern detection analysis
      await new Promise(resolve => setTimeout(resolve, 2000));

      const detectedPatterns: DetectedPattern[] = [
        {
          id: 'struct_001',
          name: 'Potential Structuring',
          description: 'Multiple transactions just below $10,000 threshold',
          category: 'structuring',
          severity: 'high',
          matchCount: 12,
          lastDetected: new Date().toISOString(),
          transactions: mockTransactions.filter(t => t.senderAmount > 9000 && t.senderAmount < 10000)
        },
        {
          id: 'corridor_001',
          name: 'High-Risk Corridor Activity',
          description: 'Increased activity to sanctioned jurisdictions',
          category: 'high_risk_corridor',
          severity: 'medium',
          matchCount: 8,
          lastDetected: new Date().toISOString(),
          transactions: mockTransactions.filter(t => ['AF', 'IR', 'KP'].includes(t.receiverCountryCode))
        },
        {
          id: 'velocity_001',
          name: 'High Transaction Velocity',
          description: 'Unusual number of transactions in short time period',
          category: 'velocity',
          severity: 'medium',
          matchCount: 15,
          lastDetected: new Date().toISOString(),
          transactions: mockTransactions.slice(0, 15)
        },
        {
          id: 'time_001',
          name: 'Off-Hours Trading Pattern',
          description: 'Transactions occurring during unusual hours',
          category: 'time_pattern',
          severity: 'low',
          matchCount: 6,
          lastDetected: new Date().toISOString(),
          transactions: mockTransactions.filter(t => {
            const hour = new Date(t.timestamp).getHours();
            return hour < 6 || hour > 22;
          })
        }
      ];

      setPatterns(detectedPatterns);
      
      toast({
        title: 'Pattern Analysis Complete',
        description: `Detected ${detectedPatterns.length} suspicious patterns`,
      });
    } catch (error) {
      toast({
        title: 'Analysis Error',
        description: 'Failed to complete pattern analysis',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'structuring':
        return <TrendingUp className="h-4 w-4" />;
      case 'high_risk_corridor':
        return <AlertTriangle className="h-4 w-4" />;
      case 'time_pattern':
        return <Clock className="h-4 w-4" />;
      case 'velocity':
        return <Search className="h-4 w-4" />;
      default:
        return <Search className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'warning';
      case 'low':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Real-Time Pattern Detection Engine
            </CardTitle>
            <Button 
              onClick={runPatternAnalysis}
              disabled={isAnalyzing}
              className="flex items-center gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Run Analysis
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Advanced machine learning algorithms detect suspicious transaction patterns in real-time.
          </p>

          {patterns.length === 0 && !isAnalyzing && (
            <div className="text-center py-8">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Analysis Run Yet</h3>
              <p className="text-muted-foreground">
                Click "Run Analysis" to detect suspicious patterns in transaction data.
              </p>
            </div>
          )}

          {isAnalyzing && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Analyzing Transaction Patterns</h3>
              <p className="text-muted-foreground">
                Processing transaction data for suspicious patterns...
              </p>
            </div>
          )}

          {patterns.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map((pattern) => (
                <Card key={pattern.id} className="border-l-4 border-l-orange-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(pattern.category)}
                        <h4 className="font-semibold">{pattern.name}</h4>
                      </div>
                      <Badge variant={getSeverityColor(pattern.severity)}>
                        {pattern.severity}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-3">
                      {pattern.description}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Matches:</span>
                        <div className="font-semibold">{pattern.matchCount}</div>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Category:</span>
                        <div className="font-semibold capitalize">{pattern.category}</div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          Last detected: {new Date(pattern.lastDetected).toLocaleString()}
                        </span>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pattern Statistics */}
      {patterns.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Patterns</p>
                  <p className="text-2xl font-bold">{patterns.length}</p>
                </div>
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">High Severity</p>
                  <p className="text-2xl font-bold text-red-600">
                    {patterns.filter(p => p.severity === 'high').length}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Matches</p>
                  <p className="text-2xl font-bold">
                    {patterns.reduce((sum, p) => sum + p.matchCount, 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Categories</p>
                  <p className="text-2xl font-bold">
                    {new Set(patterns.map(p => p.category)).size}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default PatternDetectionEngine;
