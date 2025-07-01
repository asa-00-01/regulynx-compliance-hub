
import React from 'react';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import { ToastProvider } from '@/components/common/ToastProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import AuthProvider from './AuthProvider';
import ComplianceProvider from './ComplianceProvider';
import AnalyticsProvider from './AnalyticsProvider';
import AnalyticsDashboard from '@/components/common/AnalyticsDashboard';
import DeveloperPanel from '@/components/dev/DeveloperPanel';
import EnvironmentChecker from '@/components/common/EnvironmentChecker';
import MockModeIndicator from '@/components/common/MockModeIndicator';
import HelpPanel from '@/components/common/HelpPanel';
import SecurityProvider from '@/components/security/SecurityProvider';
import SecurityMonitor from '@/components/security/SecurityMonitor';
import SecurityAuditLog from '@/components/security/SecurityAuditLog';

interface AppProvidersProps {
  children: React.ReactNode;
}

const queryClient = new QueryClient();

const ErrorFallback = ({ error }: { error: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center p-8 max-w-md">
      <h2 className="text-2xl font-bold text-destructive mb-4">Something went wrong</h2>
      <p className="text-muted-foreground mb-4">{error.message}</p>
      <button 
        onClick={() => window.location.reload()} 
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Reload page
      </button>
    </div>
  </div>
);

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <SecurityProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <ComplianceProvider>
                <AnalyticsProvider>
                  <ToastProvider />
                  {children}
                  <AnalyticsDashboard />
                  <DeveloperPanel />
                  <EnvironmentChecker />
                  <MockModeIndicator />
                  <HelpPanel />
                  <SecurityMonitor />
                  <SecurityAuditLog />
                </AnalyticsProvider>
              </ComplianceProvider>
            </QueryClientProvider>
          </AuthProvider>
        </SecurityProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;
