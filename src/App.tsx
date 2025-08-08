import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/hooks/use-toast';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import DashboardLayout from '@/components/layout/DashboardLayout';
import AppRoutes from '@/components/app/AppRoutes';
import AppInitializer from '@/components/app/AppInitializer';
import SecurityProvider from '@/components/security/SecurityProvider';
import EnvironmentChecker from '@/components/common/EnvironmentChecker';
import EnhancedErrorBoundary from '@/components/common/EnhancedErrorBoundary';
import { useErrorTracking } from '@/hooks/useErrorTracking';

function App() {
  const { logError } = useErrorTracking();

  // Global error handler for unhandled promise rejections
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      logError(new Error(event.reason || 'Unhandled Promise Rejection'), 'global_promise_rejection', 'high');
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      logError(event.error || new Error(event.message), 'global_error', 'high');
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, [logError]);

  return (
    <EnhancedErrorBoundary context="App">
      <div className="min-h-screen bg-background font-sans antialiased">
        <SecurityProvider>
          <AuthProvider>
            <ToastProvider>
              <AppInitializer>
                <Router>
                  <EnvironmentChecker />
                  <SiteHeader />
                  <DashboardLayout>
                    <AppRoutes />
                  </DashboardLayout>
                  <SiteFooter />
                </Router>
              </AppInitializer>
            </ToastProvider>
          </AuthProvider>
        </SecurityProvider>
      </div>
    </EnhancedErrorBoundary>
  );
}

export default App;
