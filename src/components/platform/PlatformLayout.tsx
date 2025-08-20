
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Building2,
  Users,
  Activity,
  Plug,
  CreditCard,
  Code,
  Settings,
  Shield,
  BarChart3,
  Globe,
  Database,
  Cpu,
  HardDrive,
  Network,
  Clock,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Target,
  Award,
  Calendar,
  FileText,
  Clipboard,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Lock,
  Search,
  Filter,
  Download,
  Server,
  Key,
  Fingerprint,
  ShieldCheck,
  AlertCircle,
  LogOut
} from 'lucide-react';

interface PlatformLayoutProps {
  children: React.ReactNode;
}

const PlatformLayout: React.FC<PlatformLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navigation = [
    { 
      name: 'Platform Console', 
      href: '/platform/dashboard', 
      icon: LayoutDashboard,
      description: 'Main platform overview and metrics'
    },
    { 
      name: 'Customer Management', 
      href: '/platform/management', 
      icon: Building2,
      description: 'Manage customer organizations and subscriptions'
    },
    { 
      name: 'User Management', 
      href: '/platform/users', 
      icon: Users,
      description: 'Manage platform users and roles'
    },
    { 
      name: 'System Health', 
      href: '/platform/system-health', 
      icon: Activity,
      description: 'Monitor system performance and health'
    },
    { 
      name: 'Billing & Revenue', 
      href: '/platform/billing', 
      icon: CreditCard,
      description: 'Manage subscriptions and revenue tracking'
    },
    { 
      name: 'Security & Compliance', 
      href: '/platform/security', 
      icon: Shield,
      description: 'Security monitoring and compliance management'
    },
    { 
      name: 'Analytics & Reporting', 
      href: '/platform/analytics', 
      icon: BarChart3,
      description: 'Comprehensive analytics and reporting tools'
    },
    { 
      name: 'Integration', 
      href: '/platform/integration', 
      icon: Plug,
      description: 'API management and integrations'
    },
    { 
      name: 'Developer Tools', 
      href: '/platform/developer-tools', 
      icon: Code,
      description: 'Development and debugging tools'
    },
    { 
      name: 'Platform Settings', 
      href: '/platform/settings', 
      icon: Settings,
      description: 'Platform configuration and settings'
    },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar className="border-r border-border">
          <SidebarHeader className="border-b border-border p-4">
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-foreground">Platform Console</h1>
              <p className="text-sm text-muted-foreground">SaaS Management</p>
            </div>
          </SidebarHeader>

          <SidebarContent className="px-2 py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-2">
                <SidebarMenu className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton 
                          asChild 
                          isActive={isActive} 
                          className="w-full group"
                          title={item.description}
                        >
                          <Link 
                            to={item.href} 
                            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <item.icon className="h-4 w-4 flex-shrink-0" />
                            <span className="truncate">{item.name}</span>
                            {isActive && (
                              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                            )}
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Quick Stats Section */}
            <SidebarGroup className="mt-6">
              <SidebarGroupLabel className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Quick Stats
              </SidebarGroupLabel>
              <SidebarGroupContent className="mt-2 px-2">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">System Health</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">99.9%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Active Customers</span>
                    <span className="font-medium">24</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Security Score</span>
                    <span className="font-medium text-green-600">94/100</span>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                <AvatarFallback>
                  {user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.platform_roles?.includes('platform_admin') ? 'Platform Admin' : 'Platform User'}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1">
          {/* Header */}
          <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6" data-testid="platform-header">
            <SidebarTrigger className="-ml-2" />
            <div className="flex items-center gap-2 flex-1">
              <div className="h-6 w-px bg-border" />
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-foreground">Platform Console</h2>
                <p className="text-xs text-muted-foreground">SaaS Management Dashboard</p>
              </div>
            </div>
            
            {/* Header Actions */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6" data-testid="platform-main">
            <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default PlatformLayout;
