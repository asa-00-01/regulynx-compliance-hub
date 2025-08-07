import React from 'react';
import {
  Home,
  Shield,
  FileText,
  CircleDollarSign,
  LineChart,
  PieChart,
  FileWarning,
  UserCheck,
  FileSearch,
  BarChart3,
  History,
  Bot,
  Newspaper,
  User,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/RefactoredAuthContext';
import { useRoleBasedPermissions } from '@/hooks/useRoleBasedPermissions';
import { useTranslation } from 'react-i18next';
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
} from '@/components/ui/sidebar';

const CustomerSidebar = () => {
  const { user } = useAuth();
  const { permissions } = useRoleBasedPermissions();
  const location = useLocation();
  const { t } = useTranslation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const customerNavigationItems = [
    {
      title: t('navigation.dashboard'),
      href: '/dashboard',
      icon: Home,
      show: true,
    },
    {
      title: t('navigation.aiAgent'),
      href: '/ai-agent',
      icon: Bot,
      show: true,
    },
    {
      title: t('navigation.news'),
      href: '/news',
      icon: Newspaper,
      show: true,
    },
    {
      title: t('navigation.compliance'),
      href: '/compliance',
      icon: Shield,
      show: permissions.canViewCompliance,
    },
    {
      title: t('navigation.complianceCases'),
      href: '/compliance-cases',
      icon: FileText,
      show: permissions.canManageCases,
    },
    {
      title: t('navigation.kycVerification'),
      href: '/kyc-verification',
      icon: UserCheck,
      show: permissions.canManageKYC,
    },
    {
      title: t('navigation.transactions'),
      href: '/transactions',
      icon: CircleDollarSign,
      show: permissions.canViewTransactions,
    },
    {
      title: t('navigation.documents'),
      href: '/documents',
      icon: FileSearch,
      show: permissions.canManageDocuments,
    },
    {
      title: t('navigation.amlMonitoring'),
      href: '/aml-monitoring',
      icon: LineChart,
      show: permissions.canViewCompliance,
    },
    {
      title: t('navigation.riskAnalysis'),
      href: '/risk-analysis',
      icon: PieChart,
      show: permissions.canViewCompliance,
    },
    {
      title: t('navigation.sarCenter'),
      href: '/sar-center',
      icon: FileWarning,
      show: permissions.canManageCases,
    },
    {
      title: 'Usage Analytics',
      href: '/analytics',
      icon: BarChart3,
      show: permissions.canViewAnalytics,
    },
    {
      title: t('navigation.auditLogs'),
      href: '/audit-logs',
      icon: History,
      show: permissions.canViewReports,
    },
    {
      title: t('navigation.profile'),
      href: '/profile',
      icon: User,
      show: true,
    },
  ];

  if (!user) return null;

  return (
    <>
      <SidebarHeader className={cn('px-6 py-4', isCollapsed && "px-2 justify-center")}>
        <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">
          {isCollapsed ? "AML" : t('layout.sidebar.title')}
        </h1>
      </SidebarHeader>
      
      <SidebarContent className={cn(!isCollapsed && "p-2")}>
        <SidebarMenu>
          {customerNavigationItems.map((item) => {
            if (!item.show) return null;

            const isActive = location.pathname === item.href || 
              (item.href === '/dashboard' && location.pathname === '/');

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
      </SidebarContent>
      
      <SidebarSeparator />
      
      <SidebarFooter className={cn(isCollapsed && "hidden")}>
        <LanguageSelector />
        <p className="text-xs text-sidebar-foreground/70 text-center">
          {t('layout.sidebar.footer', { year: new Date().getFullYear() })}
        </p>
      </SidebarFooter>
    </>
  );
};

export default CustomerSidebar;