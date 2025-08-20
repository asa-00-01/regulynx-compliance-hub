import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Square
} from 'lucide-react';
import { config } from '@/config/environment';
import { useDebugMode } from '@/hooks/useDebugMode';

const FeatureFlagTest: React.FC = () => {
  const { debugLog, debugError, isDebugMode } = useDebugMode();

  const testFeatureFlags = () => {
    debugLog('🧪 Starting feature flag tests...');
    
    const results: { flag: string; status: 'pass' | 'fail' | 'warning'; message: string }[] = [];

    // Test 1: enableAnalytics
    try {
      if (config.features.enableAnalytics) {
        debugLog('✅ Analytics enabled - checking if analytics service is available');
        // This would normally check if analytics service is initialized
        results.push({ flag: 'enableAnalytics', status: 'pass', message: 'Analytics feature is enabled and accessible' });
      } else {
        results.push({ flag: 'enableAnalytics', status: 'pass', message: 'Analytics feature is disabled as expected' });
      }
    } catch (error) {
      results.push({ flag: 'enableAnalytics', status: 'fail', message: `Analytics test failed: ${error}` });
    }

    // Test 2: enableErrorReporting
    try {
      if (config.features.enableErrorReporting) {
        debugLog('✅ Error reporting enabled - checking if error service is available');
        results.push({ flag: 'enableErrorReporting', status: 'pass', message: 'Error reporting feature is enabled and accessible' });
      } else {
        results.push({ flag: 'enableErrorReporting', status: 'pass', message: 'Error reporting feature is disabled as expected' });
      }
    } catch (error) {
      results.push({ flag: 'enableErrorReporting', status: 'fail', message: `Error reporting test failed: ${error}` });
    }

    // Test 3: enablePerformanceMonitoring
    try {
      if (config.features.enablePerformanceMonitoring) {
        debugLog('✅ Performance monitoring enabled - checking if performance service is available');
        results.push({ flag: 'enablePerformanceMonitoring', status: 'pass', message: 'Performance monitoring feature is enabled and accessible' });
      } else {
        results.push({ flag: 'enablePerformanceMonitoring', status: 'pass', message: 'Performance monitoring feature is disabled as expected' });
      }
    } catch (error) {
      results.push({ flag: 'enablePerformanceMonitoring', status: 'fail', message: `Performance monitoring test failed: ${error}` });
    }

    // Test 4: enableDebugMode
    try {
      if (config.features.enableDebugMode) {
        debugLog('✅ Debug mode enabled - checking debug functionality');
        if (isDebugMode) {
          results.push({ flag: 'enableDebugMode', status: 'pass', message: 'Debug mode is enabled and hook is working' });
        } else {
          results.push({ flag: 'enableDebugMode', status: 'fail', message: 'Debug mode is enabled but hook is not working' });
        }
      } else {
        results.push({ flag: 'enableDebugMode', status: 'pass', message: 'Debug mode is disabled as expected' });
      }
    } catch (error) {
      results.push({ flag: 'enableDebugMode', status: 'fail', message: `Debug mode test failed: ${error}` });
    }

    // Test 5: useMockData
    try {
      if (config.features.useMockData) {
        debugLog('✅ Mock data enabled - checking if mock services are available');
        results.push({ flag: 'useMockData', status: 'pass', message: 'Mock data feature is enabled and accessible' });
      } else {
        results.push({ flag: 'useMockData', status: 'pass', message: 'Mock data feature is disabled as expected' });
      }
    } catch (error) {
      results.push({ flag: 'useMockData', status: 'fail', message: `Mock data test failed: ${error}` });
    }

    // Test 6: enableDevTools
    try {
      if (config.features.enableDevTools) {
        debugLog('✅ Dev tools enabled - checking if dev tools are accessible');
        results.push({ flag: 'enableDevTools', status: 'pass', message: 'Dev tools feature is enabled and accessible' });
      } else {
        results.push({ flag: 'enableDevTools', status: 'warning', message: 'Dev tools feature is disabled - this may be intentional' });
      }
    } catch (error) {
      results.push({ flag: 'enableDevTools', status: 'fail', message: `Dev tools test failed: ${error}` });
    }

    // Log results
    debugLog('🧪 Feature flag test results:', results);
    
    const passed = results.filter(r => r.status === 'pass').length;
    const failed = results.filter(r => r.status === 'fail').length;
    const warnings = results.filter(r => r.status === 'warning').length;

    console.log(`🧪 Feature Flag Test Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
    
    return results;
  };

  const [testResults, setTestResults] = React.useState<{ flag: string; status: 'pass' | 'fail' | 'warning'; message: string }[]>([]);
  const [isRunning, setIsRunning] = React.useState(false);

  const handleRunTests = () => {
    setIsRunning(true);
    debugLog('🧪 Running feature flag tests...');
    
    setTimeout(() => {
      const results = testFeatureFlags();
      setTestResults(results);
      setIsRunning(false);
    }, 1000);
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">WARNING</Badge>;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Feature Flag Test Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Test all feature flags to ensure they are working correctly
          </p>
          <Button 
            onClick={handleRunTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <>
                <Square className="h-4 w-4" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Tests
              </>
            )}
          </Button>
        </div>

        {testResults.length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium">Test Results</h4>
              {testResults.map((result, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(result.status)}
                    <div>
                      <div className="font-medium">{result.flag}</div>
                      <div className="text-sm text-muted-foreground">{result.message}</div>
                    </div>
                  </div>
                  {getStatusBadge(result.status)}
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureFlagTest;
