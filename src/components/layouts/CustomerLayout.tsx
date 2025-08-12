
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { isSubscriberRole } from '@/lib/auth/roles';
import { UserRole } from '@/types';
import {
  SidebarProvider,
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
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link, useLocation } from 'react-router-dom';
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
  LogOut 
} from 'lucide-react';

interface CustomerLayoutProps {
  children: React.ReactNode;
  requiredRoles?: readonly UserRole[];
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ 
  children,
  requiredRoles
}) => {
  const { user, logout, canAccess } = useAuth();
  const location = useLocation();

  // Check if user has subscriber role access
  if (!user || !isSubscriberRole(user.role as any)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the subscriber area.</p>
        </div>
      </div>
    );
  }

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
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Compliance', href: '/compliance', icon: Shield },
    { name: 'Compliance Cases', href: '/compliance-cases', icon: FileText },
    { name: 'KYC Verification', href: '/kyc-verification', icon: Shield },
    { name: 'Transactions', href: '/transactions', icon: CreditCard },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'AML Monitoring', href: '/aml-monitoring', icon: AlertTriangle },
    { name: 'Risk Analysis', href: '/risk-analysis', icon: TrendingUp },
    { name: 'SAR Center', href: '/sar-center', icon: Database },
    { name: 'Integration', href: '/integration', icon: Database },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Audit Logs', href: '/audit-logs', icon: History },
    { name: 'Users', href: '/users', icon: Users },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'AI Agent', href: '/ai-agent', icon: Bot },
    { name: 'News', href: '/news', icon: Newspaper },
    { name: 'Optimization', href: '/optimization', icon: Zap },
    { name: 'Developer Tools', href: '/developer-tools', icon: Code },
  ];

  // Helper function to get user role display name
  const getUserRoleDisplay = () => {
    if (!user) return 'User';
    
    // Check customer_roles array first
    if (user.customer_roles?.includes('customer_admin')) return 'Admin';
    if (user.customer_roles?.includes('customer_compliance')) return 'Compliance Officer';
    if (user.customer_roles?.includes('customer_executive')) return 'Executive';
    if (user.customer_roles?.includes('customer_support')) return 'Support';
    
    // Fallback to legacy role mapping
    if (user.role === 'admin') return 'Admin';
    if (user.role === 'complianceOfficer') return 'Compliance Officer';
    if (user.role === 'executive') return 'Executive';
    if (user.role === 'support') return 'Support';
    
    return 'User';
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar data-testid="customer-sidebar">
          <SidebarHeader className="border-b border-border">
            <div className="p-2">
              <h1 className="text-xl font-bold text-foreground">Compliance Platform</h1>
              <p className="text-sm text-muted-foreground">Subscriber Dashboard</p>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
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
          {/* Customer Header */}
          <header 
            data-testid="customer-header"
            className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6"
          >
            <SidebarTrigger />
            <div className="flex-1">
              <h2 className="text-lg font-semibold">Compliance Platform</h2>
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

export default CustomerLayout;
