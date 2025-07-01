import React from 'react';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ToastProvider } from '@/components/ui/toast';
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

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
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
