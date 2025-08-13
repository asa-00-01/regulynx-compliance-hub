
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useRoleBasedAccess } from '@/hooks/permissions/useRoleBasedAccess';
import { usePlatformRoleAccess } from '@/hooks/permissions/usePlatformRoleAccess';
import { 
  LayoutDashboard, 
  Shield, 
  Users, 
  FileText, 
  AlertTriangle,
  BarChart3,
  Settings,
  Search,
  Bot,
  Newspaper,
  Zap,
  Code,
  UserCheck,
  DollarSign,
  Activity,
  Archive,
  Gauge,
  Plug,
  ChevronRight,
  Building2
} from 'lucide-react';

const primaryNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Overview & metrics' },
];

const complianceNavigation = [
  { name: 'Compliance', href: '/compliance', icon: Shield, description: 'Compliance overview' },
  { name: 'Compliance Cases', href: '/compliance-cases', icon: FileText, description: 'Active cases', badge: 5 },
  { 
    name: 'KYC Verification', 
    href: '/kyc-verification', 
    icon: UserCheck, 
    description: 'Identity verification',
    requiredPermissions: ['document:approve', 'customer:compliance', 'customer:admin']
  },
  { 
    name: 'SAR Center', 
    href: '/sar-center', 
    icon: Shield, 
    description: 'Suspicious activity reports',
    requiredPermissions: ['document:approve', 'customer:compliance', 'customer:admin']
  },
  { name: 'AML Monitoring', href: '/aml-monitoring', icon: Activity, description: 'Anti-money laundering' },
  { name: 'Risk Analysis', href: '/risk-analysis', icon: AlertTriangle, description: 'Risk assessment', badge: 12 },
];

const dataNavigation = [
  { name: 'Transactions', href: '/transactions', icon: DollarSign, description: 'Transaction history' },
  { name: 'Documents', href: '/documents', icon: Archive, description: 'Document management' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, description: 'Data insights' },
  { name: 'Audit Logs', href: '/audit-logs', icon: Search, description: 'System audit trail' },
];

const systemNavigation = [
  { name: 'Integration', href: '/platform/integration', icon: Plug, description: 'API & integrations' },
  { 
    name: 'Users', 
    href: '/users', 
    icon: Users, 
    description: 'User management',
    requiredPermissions: ['user:create', 'user:update', 'customer:admin']
  },
];

const toolsNavigation = [
  { name: 'AI Agent', href: '/ai-agent', icon: Bot, description: 'AI assistance', isNew: true },
  { name: 'News', href: '/news', icon: Newspaper, description: 'Industry updates' },
  { name: 'Optimization', href: '/optimization', icon: Gauge, description: 'Performance tools' },
  { name: 'Developer Tools', href: '/developer-tools', icon: Code, description: 'Development utilities' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { hasPermission, hasAnyPermission } = useRoleBasedAccess();
  const { isPlatformOwner, isPlatformAdmin } = usePlatformRoleAccess();

  const isActive = (href: string) => location.pathname === href;

  const hasAccess = (item: any) => {
    // Platform owners and admins have access to everything
    if (isPlatformOwner() || isPlatformAdmin()) return true;
    
    // If no specific permissions required, allow access
    if (!item.requiredPermissions) return true;
    
    // Check if user has any of the required permissions
    return hasAnyPermission(item.requiredPermissions);
  };

  const NavigationSection = ({ title, items, className = "" }: { title: string; items: any[]; className?: string }) => {
    const accessibleItems = items.filter(hasAccess);
    
    // Don't render section if no items are accessible
    if (accessibleItems.length === 0) return null;
    
    return (
      <div className={cn("space-y-1", className)}>
        <div className="px-3 py-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        </div>
        <div className="space-y-1">
          {accessibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Button
                key={item.name}
                asChild
                variant="ghost"
                className={cn(
                  "w-full justify-start h-auto p-0 hover:bg-accent/50 transition-all duration-200",
                  active && "bg-accent text-accent-foreground shadow-sm"
                )}
              >
                <Link to={item.href} className="flex items-center gap-3 px-3 py-3 rounded-md group">
                  <div className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    active 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted group-hover:bg-accent-foreground/10"
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium truncate">{item.name}</span>
                      <div className="flex items-center gap-1">
                        {item.isNew && (
                          <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                            New
                          </Badge>
                        )}
                        {item.badge && (
                          <Badge variant="destructive" className="h-5 px-1.5 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight className={cn(
                          "h-3 w-3 transition-transform opacity-0 group-hover:opacity-100",
                          active && "opacity-100"
                        )} />
                      </div>
                    </div>
                    {item.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {item.description}
                      </p>
                    )}
                  </div>
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full w-72 flex-col bg-card border-r border-border shadow-sm">
      {/* Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary rounded-lg">
            <Building2 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Regulynx</h1>
            <p className="text-xs text-muted-foreground">Compliance Platform</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-6">
          <NavigationSection title="Overview" items={primaryNavigation} />
          <NavigationSection title="Compliance" items={complianceNavigation} />
          <NavigationSection title="Data & Analytics" items={dataNavigation} />
          <NavigationSection title="System" items={systemNavigation} />
          <NavigationSection title="Tools" items={toolsNavigation} />
          
          <div className="border-t border-border pt-4">
            <Button
              asChild
              variant="ghost"
              className={cn(
                "w-full justify-start h-auto p-0 hover:bg-accent/50",
                isActive('/profile') && "bg-accent text-accent-foreground"
              )}
            >
              <Link to="/profile" className="flex items-center gap-3 px-3 py-3 rounded-md group">
                <div className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isActive('/profile') 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted group-hover:bg-accent-foreground/10"
                )}>
                  <Settings className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium">Profile & Settings</span>
                  <p className="text-xs text-muted-foreground mt-0.5">Account management</p>
                </div>
                <ChevronRight className={cn(
                  "h-3 w-3 transition-transform opacity-0 group-hover:opacity-100",
                  isActive('/profile') && "opacity-100"
                )} />
              </Link>
            </Button>
          </div>
        </nav>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
