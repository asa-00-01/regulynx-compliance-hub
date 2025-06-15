
import React, { Suspense } from 'react';
import { ComplianceProvider } from '@/context/ComplianceContext';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import ToastProvider from '@/components/common/ToastProvider';
import AnalyticsProvider from '@/components/common/AnalyticsProvider';
import AnalyticsDashboard from '@/components/common/AnalyticsDashboard';
import MockModeIndicator from '@/components/common/MockModeIndicator';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import DeveloperPanel from '@/components/dev/DeveloperPanel';

interface AppProvidersProps {
  children: React.ReactNode;
}

const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <ErrorBoundary>
      <AnalyticsProvider>
        <Suspense 
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" text="Loading application..." />
            </div>
          }
        >
          <ComplianceProvider>
            {children}
            <ToastProvider />
            <AnalyticsDashboard />
            <MockModeIndicator />
            <DeveloperPanel />
          </ComplianceProvider>
        </Suspense>
      </AnalyticsProvider>
    </ErrorBoundary>
  );
};

export default AppProviders;
