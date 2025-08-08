
import React from 'react';
import { SidebarProvider, SidebarInset, Sidebar as ShadcnSidebar } from '@/components/ui/sidebar';
import LayoutSidebar from './Sidebar';
import Header from './Header';

interface DashboardShellProps {
  children: React.ReactNode;
}

const DashboardShell: React.FC<DashboardShellProps> = ({ children }) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <ShadcnSidebar collapsible="icon" className="border-r">
          <LayoutSidebar />
        </ShadcnSidebar>
        <SidebarInset className="flex-1">
          <Header />
          <main className="flex-1 overflow-y-auto bg-background p-6">
            <div className="container mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardShell;
