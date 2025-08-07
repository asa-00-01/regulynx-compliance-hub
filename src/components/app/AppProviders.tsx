
import React, { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/context/auth/AuthContext';
import { SubscriptionProvider } from '@/context/SubscriptionContext';
import { ComplianceProvider } from '@/context/compliance/ComplianceProvider';
import { ThemeProvider } from '@/components/common/ThemeProvider';
import ToastProvider from '@/components/common/ToastProvider';
import '@/i18n/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SubscriptionProvider>
            <ComplianceProvider>
              <ToastProvider />
              {children}
            </ComplianceProvider>
          </SubscriptionProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};
