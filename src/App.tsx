
import { Suspense, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import AppRoutes from "@/components/app/AppRoutes";
import AuthProvider from "@/components/app/AuthProvider";
import SubscriptionProvider from "@/components/app/SubscriptionProvider";
import AnalyticsProvider from "@/components/app/AnalyticsProvider";
import ComplianceProvider from "@/components/app/ComplianceProvider";
import LoadingScreen from "@/components/app/LoadingScreen";
import AppInitializer from "@/components/app/AppInitializer";
import GlobalErrorBoundary from "@/components/common/GlobalErrorBoundary";
import EnhancedErrorTrackingService from "@/components/common/EnhancedErrorTrackingService";
import { auditLogger } from "@/services/auditLogger";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Initialize application logging
    auditLogger.logSystemEvent('application_start', {
      url: window.location.href,
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      app_version: '1.0.0' // You can make this dynamic
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
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <TooltipProvider>
              <EnhancedErrorTrackingService context="app_providers">
                <Suspense fallback={<LoadingScreen />}>
                  <AuthProvider>
                    <SubscriptionProvider>
                      <AnalyticsProvider>
                        <ComplianceProvider>
                          <AppInitializer>
                            <AppRoutes />
                          </AppInitializer>
                        </ComplianceProvider>
                      </AnalyticsProvider>
                    </SubscriptionProvider>
                  </AuthProvider>
                </Suspense>
              </EnhancedErrorTrackingService>
              <Toaster />
              <Sonner />
            </TooltipProvider>
          </ThemeProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </GlobalErrorBoundary>
  );
};

export default App;
