
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  FileText, 
  Shield, 
  Users, 
  BarChart2, 
  Settings, 
  Clock, 
  AlertCircle,
  BarChart,
  FileSearch
} from 'lucide-react';
import { UserRole } from '@/types';

interface SidebarProps {
  isOpen: boolean;
}

const roleBasedNavItems: Record<UserRole, { path: string; label: string; icon: React.ReactNode }[]> = {
  complianceOfficer: [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/documents', label: 'Documents', icon: <FileText className="h-5 w-5" /> },
    { path: '/transactions', label: 'Transactions', icon: <BarChart className="h-5 w-5" /> },
    { path: '/compliance', label: 'Compliance', icon: <Shield className="h-5 w-5" /> },
    { path: '/sar-center', label: 'SAR Center', icon: <FileSearch className="h-5 w-5" /> },
    { path: '/customers', label: 'Customers', icon: <Users className="h-5 w-5" /> },
    { path: '/reports', label: 'Reports', icon: <BarChart2 className="h-5 w-5" /> },
  ],
  admin: [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/transactions', label: 'Transactions', icon: <BarChart className="h-5 w-5" /> },
    { path: '/sar-center', label: 'SAR Center', icon: <FileSearch className="h-5 w-5" /> },
    { path: '/users', label: 'User Management', icon: <Users className="h-5 w-5" /> },
    { path: '/reports', label: 'Reports', icon: <BarChart2 className="h-5 w-5" /> },
    { path: '/settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
    { path: '/audit-logs', label: 'Audit Logs', icon: <Clock className="h-5 w-5" /> },
  ],
  executive: [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/transactions', label: 'Transactions', icon: <BarChart className="h-5 w-5" /> },
    { path: '/reports', label: 'Reports', icon: <BarChart2 className="h-5 w-5" /> },
    { path: '/compliance', label: 'Compliance Overview', icon: <Shield className="h-5 w-5" /> },
  ],
  support: [
    { path: '/dashboard', label: 'Dashboard', icon: <Home className="h-5 w-5" /> },
    { path: '/customers', label: 'Customers', icon: <Users className="h-5 w-5" /> },
    { path: '/documents', label: 'Documents', icon: <FileText className="h-5 w-5" /> },
    { path: '/alerts', label: 'Alerts', icon: <AlertCircle className="h-5 w-5" /> },
  ],
};

const Sidebar = ({ isOpen }: SidebarProps) => {
  const { user } = useAuth();
  
  if (!user) return null;
  
  const navItems = user ? roleBasedNavItems[user.role] : [];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-20 flex w-64 flex-col border-r bg-sidebar transition-all duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16"
      )}
    >
      <div className="flex h-16 items-center border-b border-sidebar-border px-6">
        <div className={cn(
          "flex items-center",
          isOpen ? "justify-start" : "justify-center w-full"
        )}>
          {isOpen ? (
            <>
              <div className="text-sidebar-foreground font-bold text-xl tracking-tight">
                Regulynx
              </div>
            </>
          ) : (
            <div className="text-sidebar-foreground font-bold text-xl">R</div>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-2 gap-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )
              }
            >
              {item.icon}
              {isOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="border-t border-sidebar-border p-4">
        <div className={cn(
          "flex items-center gap-3",
          isOpen ? "justify-start" : "justify-center"
        )}>
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-sidebar-accent-foreground">
            {user?.name?.substring(0, 1).toUpperCase()}
          </div>
          {isOpen && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-sidebar-foreground">
                {user?.name}
              </p>
              <p className="text-xs text-sidebar-foreground/70">{user?.role}</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
