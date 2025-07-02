import { useEffect, useRef } from 'react';
import config from '@/config/environment';
import { analytics } from '@/services/analytics';

interface MemorySnapshot {
  timestamp: number;
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export const useMemoryLeakDetector = (componentName: string, interval = 30000) => {
  const snapshots = useRef<MemorySnapshot[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!config.features.enablePerformanceMonitoring || typeof window === 'undefined') {
      return;
    }

    // Only track in development or when debug mode is enabled
    if (!config.isDevelopment && !config.features.enableDebugMode) {
      return;
    }

    // Check if performance.memory is available
    if (!('memory' in performance)) {
      console.warn('Memory monitoring not available in this browser');
      return;
    }

    const takeSnapshot = () => {
      const memInfo = (performance as any).memory;
      const snapshot: MemorySnapshot = {
        timestamp: Date.now(),
        usedJSHeapSize: memInfo.usedJSHeapSize,
        totalJSHeapSize: memInfo.totalJSHeapSize,
        jsHeapSizeLimit: memInfo.jsHeapSizeLimit,
      };

      snapshots.current.push(snapshot);

      // Keep only last 20 snapshots
      if (snapshots.current.length > 20) {
        snapshots.current = snapshots.current.slice(-20);
      }

      // Analyze for potential memory leaks
      if (snapshots.current.length >= 5) {
        analyzeMemoryTrend();
      }
    };

    const analyzeMemoryTrend = () => {
      const recent = snapshots.current.slice(-5);
      const growth = recent[recent.length - 1].usedJSHeapSize - recent[0].usedJSHeapSize;
      const timeSpan = recent[recent.length - 1].timestamp - recent[0].timestamp;
      const growthRate = growth / (timeSpan / 1000); // bytes per second

      // If memory is growing consistently at more than 1MB per minute
      if (growthRate > 17000) { // ~1MB/minute in bytes/second
        console.warn(`🚨 Potential memory leak detected in ${componentName}:`, {
          growthRate: `${(growthRate / 1024).toFixed(2)} KB/s`,
          totalGrowth: `${(growth / 1024).toFixed(2)} KB`,
          timeSpan: `${(timeSpan / 1000).toFixed(2)}s`,
        });

        if (config.features.enableAnalytics) {
          analytics.track('memory_leak_detected', {
            component: componentName,
            growth_rate_kb_per_second: growthRate / 1024,
            total_growth_kb: growth / 1024,
            time_span_seconds: timeSpan / 1000,
          });
        }
      }
    };

    // Take initial snapshot
    takeSnapshot();

    // Set up interval for periodic snapshots
    intervalRef.current = setInterval(takeSnapshot, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [componentName, interval]);

  const getMemoryStats = () => {
    if (snapshots.current.length === 0) return null;

    const latest = snapshots.current[snapshots.current.length - 1];
    const earliest = snapshots.current[0];
    const growth = latest.usedJSHeapSize - earliest.usedJSHeapSize;

    return {
      current: {
        used: Math.round(latest.usedJSHeapSize / 1024 / 1024), // MB
        total: Math.round(latest.totalJSHeapSize / 1024 / 1024), // MB
        limit: Math.round(latest.jsHeapSizeLimit / 1024 / 1024), // MB
      },
      growth: {
        absolute: Math.round(growth / 1024), // KB
        percentage: ((growth / earliest.usedJSHeapSize) * 100).toFixed(2),
      },
      snapshots: snapshots.current.length,
    };
  };

  return { getMemoryStats };
};
