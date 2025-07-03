
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { useOptimizationSuite } from '@/hooks/useOptimizationSuite';
import { useNavigate } from 'react-router-dom';

const PerformanceOverviewCard: React.FC = () => {
  const { performanceData, overallScore, isAnalyzing } = useOptimizationSuite();
  const navigate = useNavigate();

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Improvement';
  };

  const getCoreWebVitalsStatus = () => {
    if (!performanceData?.coreWebVitals) return null;
    
    const vitals = Object.values(performanceData.coreWebVitals).filter(Boolean);
    const poorCount = vitals.filter((vital: any) => vital.rating === 'poor').length;
    const needsImprovementCount = vitals.filter((vital: any) => vital.rating === 'needs-improvement').length;
    
    if (poorCount > 0) return { status: 'poor', count: poorCount };
    if (needsImprovementCount > 0) return { status: 'needs-improvement', count: needsImprovementCount };
    return { status: 'good', count: vitals.length };
  };

  const vitalStatus = getCoreWebVitalsStatus();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            Performance Overview
          </CardTitle>
          {isAnalyzing && (
            <Badge variant="secondary" className="animate-pulse">
              Analyzing...
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Overall Score</p>
            <div className={`text-2xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <p className="text-xs text-muted-foreground">
              {getScoreStatus(overallScore)}
            </p>
          </div>
          <div className="w-20">
            <Progress value={overallScore} className="h-2" />
          </div>
        </div>

        {/* Core Web Vitals Status */}
        {vitalStatus && (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Core Web Vitals</p>
              <div className="flex items-center gap-2 mt-1">
                {vitalStatus.status === 'good' ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm">
                  {vitalStatus.status === 'good' 
                    ? 'All metrics good' 
                    : `${vitalStatus.count} metrics need attention`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/optimization')}
            className="flex-1"
          >
            <TrendingUp className="h-4 w-4 mr-1" />
            Optimize
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/optimization')}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceOverviewCard;
