import React from 'react';
import {
  Users,
  Database,
  Zap,
  Code,
  Settings,
  BarChart3,
  Server,
  Shield,
  CreditCard,
  Monitor,
  Activity,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/RefactoredAuthContext';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { cn } from '@/lib/utils';
import LanguageSelector from '@/components/common/LanguageSelector';
import {
  useSidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';

const PlatformSidebar = () => {
  const { user } = useAuth();
  const { permissions } = useRoleBasedPermissions();
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const platformManagementItems = [
    {
      title: 'Platform Dashboard',
      href: '/platform/dashboard',
      icon: Monitor,
      show: permissions.canManagePlatform,
    },
    {
      title: 'User Management',
      href: '/platform/users',
      icon: Users,
      show: permissions.canManageUsers,
    },
    {
      title: 'Integration Management',
      href: '/integration',
      icon: Database,
      show: permissions.canManageIntegrations,
    },
    {
      title: 'Subscription Management',
      href: '/platform/subscriptions',
      icon: CreditCard,
      show: permissions.canManageSubscriptions,
    },
    {
      title: 'System Analytics',
      href: '/platform/analytics',
      icon: BarChart3,
      show: permissions.canManagePlatform,
    },
    {
      title: 'System Logs',
      href: '/platform/logs',
      icon: Activity,
      show: permissions.canViewSystemLogs,
    },
  ];

  const developerItems = [
    {
      title: 'Developer Tools',
      href: '/developer-tools',
      icon: Code,
      show: permissions.canViewDeveloperTools,
    },
    {
      title: 'Performance Optimization',
      href: '/optimization',
      icon: Zap,
      show: permissions.canViewDeveloperTools,
    },
    {
      title: 'API Documentation',
      href: '/platform/api-docs',
      icon: Server,
      show: permissions.canViewDeveloperTools,
    },
  ];

  const systemItems = [
    {
      title: 'Platform Settings',
      href: '/platform/settings',
      icon: Settings,
      show: permissions.canManagePlatform,
    },
    {
      title: 'Security Center',
      href: '/platform/security',
      icon: Shield,
      show: permissions.canManagePlatform,
    },
  ];

  if (!user) return null;

  return (
    <>
      <SidebarHeader className={cn('px-6 py-4', isCollapsed && "px-2 justify-center")}>
        <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">
          {isCollapsed ? "Platform" : "Platform Management"}
        </h1>
      </SidebarHeader>
      
      <SidebarContent className={cn(!isCollapsed && "p-2")}>
        {/* Platform Management */}
        <SidebarGroup>
          <SidebarGroupLabel>Platform Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {platformManagementItems.map((item) => {
                if (!item.show) return null;

                const isActive = location.pathname === item.href;

                return (
                  <SidebarMenuItem key={item.title} className={cn(isCollapsed && 'flex justify-center')}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <NavLink to={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Developer Tools */}
        <SidebarGroup>
          <SidebarGroupLabel>Developer Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {developerItems.map((item) => {
                if (!item.show) return null;

                const isActive = location.pathname === item.href;

                return (
                  <SidebarMenuItem key={item.title} className={cn(isCollapsed && 'flex justify-center')}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      size="sm"
                    >
                      <NavLink to={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* System Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => {
                if (!item.show) return null;

                const isActive = location.pathname === item.href;

                return (
                  <SidebarMenuItem key={item.title} className={cn(isCollapsed && 'flex justify-center')}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      size="sm"
                    >
                      <NavLink to={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarSeparator />
      
      <SidebarFooter className={cn(isCollapsed && "hidden")}>
        <LanguageSelector />
        <p className="text-xs text-sidebar-foreground/70 text-center">
          Platform Admin Panel
        </p>
      </SidebarFooter>
    </>
  );
};

export default PlatformSidebar;