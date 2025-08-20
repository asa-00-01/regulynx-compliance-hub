
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ComplianceProvider } from "@/context/ComplianceContext";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import AppRoutes from "@/components/app/AppRoutes";
import DebugModeIndicator from "@/components/common/DebugModeIndicator";
import MockModeIndicator from "@/components/common/MockModeIndicator";
import AdminOnlyDevTools from "@/components/common/AdminOnlyDevTools";
import '@/i18n/config';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <ComplianceProvider>
                <AppRoutes />
                <Toaster />
                <Sonner />
                {/* Development indicators and tools */}
                <DebugModeIndicator />
                <MockModeIndicator />
                <AdminOnlyDevTools />
              </ComplianceProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
