
import React, { useState, memo, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';
import { useIsMobile } from '@/hooks/useIsMobile';
import ErrorBoundary from '../common/ErrorBoundary';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const DashboardLayout = memo(({ children, requiredRoles = [] }: DashboardLayoutProps) => {
  const { isAuthenticated, canAccess } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, navigate, canAccess, requiredRoles]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Auto-hide sidebar on mobile
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background overflow-hidden">
        {/* Sidebar with improved responsive behavior */}
        <div 
          className={`
            fixed inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out
            ${sidebarOpen ? "w-64" : "w-16"}
            ${isMobile && sidebarOpen ? "shadow-lg" : ""}
          `}
        >
          <Sidebar />
        </div>
        
        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={toggleSidebar}
          />
        )}
        
        {/* Main content area with improved responsiveness */}
        <div 
          className={`
            flex flex-col flex-1 w-full transition-all duration-300 ease-in-out
            ${sidebarOpen ? "ml-64" : "ml-16"}
            ${isMobile ? "ml-0" : ""}
          `}
        >
          <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 bg-background min-h-full">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
});

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
