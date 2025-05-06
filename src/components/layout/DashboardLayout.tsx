
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const DashboardLayout = ({ children, requiredRoles = [] }: DashboardLayoutProps) => {
  const { isAuthenticated, canAccess } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (requiredRoles.length > 0 && !canAccess(requiredRoles)) {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, navigate, canAccess, requiredRoles]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar with fixed positioning */}
      <div 
        className={`fixed inset-y-0 left-0 z-20 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <Sidebar isOpen={sidebarOpen} />
      </div>
      
      {/* Main content area with dynamic margin */}
      <div 
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "ml-64" : "ml-16"
        }`}
      >
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
