
import { useState, useEffect } from 'react';
import { usePerformanceAnalytics } from './usePerformanceAnalytics';
import { analyzeProductionReadiness, OptimizationReport } from '@/utils/productionOptimization';
import { analytics } from '@/services/analytics';
import config from '@/config/environment';

interface OptimizationSuite {
  performanceData: any;
  productionReport: OptimizationReport | null;
  isAnalyzing: boolean;
  overallScore: number;
  runFullAnalysis: () => Promise<void>;
  exportReport: () => void;
}

export const useOptimizationSuite = (): OptimizationSuite => {
  const { analytics: performanceData, isAnalyzing: perfAnalyzing, analyzePerformance } = usePerformanceAnalytics();
  const [productionReport, setProductionReport] = useState<OptimizationReport | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  const runFullAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Run performance analysis
      await analyzePerformance();
      
      // Run production readiness analysis
      const report = await analyzeProductionReadiness();
      setProductionReport(report);
      
      // Calculate overall score
      const perfScore = calculatePerformanceScore(performanceData);
      const prodScore = report.score;
      const combined = Math.round((perfScore + prodScore) / 2);
      setOverallScore(combined);
      
      // Track analysis completion
      if (config.features.enableAnalytics) {
        analytics.track('optimization_analysis_completed', {
          performance_score: perfScore,
          production_score: prodScore,
          overall_score: combined,
          total_issues: report.summary.total,
          critical_issues: report.summary.critical,
        });
      }
      
    } catch (error) {
      console.error('Optimization analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculatePerformanceScore = (data: any): number => {
    if (!data?.coreWebVitals) return 0;
    
    let score = 100;
    const vitals = Object.values(data.coreWebVitals).filter(Boolean) as any[];
    
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

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      performance: performanceData,
      production: productionReport,
      overallScore,
      environment: config.app.environment,
    };
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `optimization-report-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    if (config.features.enableAnalytics) {
      analytics.track('optimization_report_exported', {
        overall_score: overallScore,
        has_performance_data: !!performanceData,
        has_production_data: !!productionReport,
      });
    }
  };

  // Auto-run analysis on mount
  useEffect(() => {
    if (config.features.enablePerformanceMonitoring || config.features.enableDebugMode) {
      const timer = setTimeout(runFullAnalysis, 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    performanceData,
    productionReport,
    isAnalyzing: isAnalyzing || perfAnalyzing,
    overallScore,
    runFullAnalysis,
    exportReport,
  };
};
