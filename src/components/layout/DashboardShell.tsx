
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  LayoutDashboard,
  Shield,
  FileText,
  CreditCard,
  Database,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  History,
  Users,
  User,
  Bot,
  Newspaper,
  Zap,
  Code,
  Settings,
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { UserRole } from '@/types';

interface DashboardShellProps {
  children: React.ReactNode;
  requiredRoles?: readonly UserRole[];
}

const DashboardShell: React.FC<DashboardShellProps> = ({ 
  children,
  requiredRoles
}) => {
  const { user, logout, canAccess } = useAuth();
  const location = useLocation();

  // Check access if required roles are specified
  if (requiredRoles && !canAccess(requiredRoles as UserRole[])) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const navigation = [
    { name: 'Platform Dashboard', href: '/platform/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/platform/users', icon: Users },
    { name: 'System Health', href: '/platform/system-health', icon: Activity },
    { name: 'Billing', href: '/platform/billing', icon: CreditCard },
    { name: 'Settings', href: '/platform/settings', icon: Settings },
    { name: 'Developer Tools', href: '/platform/developer-tools', icon: Code },
  ];

  // Helper function to get user role display name
  const getUserRoleDisplay = () => {
    if (!user) return 'User';
    
    // Check platform roles
    if (user.isPlatformOwner) return 'Platform Owner';
    if (user.platform_roles?.includes('platform_admin')) return 'Platform Admin';
    if (user.platform_roles?.includes('platform_support')) return 'Platform Support';
    
    return 'User';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar data-testid="management-sidebar">
          <SidebarHeader className="border-b border-border">
            <div className="p-2">
              <h1 className="text-xl font-bold text-foreground">Platform Console</h1>
              <p className="text-sm text-muted-foreground">Management Area</p>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Platform Management</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton asChild isActive={isActive}>
                          <Link to={item.href}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback>
                    {user?.name?.charAt(0) || user?.email?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name || user?.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {getUserRoleDisplay()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="w-full justify-start"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          {/* Management Header */}
          <header 
            data-testid="shell-header"
            className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6"
          >
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Platform Console</h2>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardShell;
