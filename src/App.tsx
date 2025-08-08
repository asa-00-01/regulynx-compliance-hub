
import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppRoutes from "@/components/app/AppRoutes";
import { AppProviders } from "@/components/app/AppProviders";
import LoadingScreen from "@/components/app/LoadingScreen";
import AppInitializer from "@/components/app/AppInitializer";
import GlobalErrorBoundary from "@/components/common/GlobalErrorBoundary";
import EnhancedErrorTrackingService from "@/components/common/EnhancedErrorTrackingService";
import AnalyticsProvider from "@/components/app/AnalyticsProvider";
import ComplianceProvider from "@/components/app/ComplianceProvider";
import { auditLogger } from "@/services/auditLogger";

const App = () => {
  useEffect(() => {
    // Initialize application logging
    auditLogger.logSystemEvent('application_start', {
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      app_version: '1.0.0'
    });

    // Log when user leaves the page
    const handleBeforeUnload = () => {
      auditLogger.logSystemEvent('application_exit', {
        url: window.location.href,
        session_duration: Date.now() - performance.timeOrigin
      });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <GlobalErrorBoundary>
      <AppProviders>
        <TooltipProvider>
          <EnhancedErrorTrackingService context="app_providers">
            <Suspense fallback={<LoadingScreen />}>
              <AppInitializer />
              <AppRoutes />
            </Suspense>
          </EnhancedErrorTrackingService>
          <Toaster />
          <Sonner />
        </TooltipProvider>
      </AppProviders>
    </GlobalErrorBoundary>
  );
};

export default App;
