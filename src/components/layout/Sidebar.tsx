
import React from 'react';
import {
  Home,
  Shield,
  Users,
  FileText,
  FileSearch,
  CircleDollarSign,
  LineChart,
  PieChart,
  FileWarning,
  History,
  UserCheck,
  User,
  Bot,
  Newspaper,
  Zap,
  Code,
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
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

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  const navigationItems = [
    {
      title: t('navigation.dashboard'),
      href: '/dashboard',
      icon: Home,
      allowedRoles: ['admin', 'complianceOfficer', 'executive', 'support'],
    },
    {
      title: t('navigation.aiAgent'),
      href: '/ai-agent',
      icon: Bot,
      allowedRoles: ['admin', 'complianceOfficer', 'executive', 'support'],
    },
    {
      title: t('navigation.news'),
      href: '/news',
      icon: Newspaper,
      allowedRoles: ['admin', 'complianceOfficer', 'executive', 'support'],
    },
    {
      title: 'Performance Optimization',
      href: '/optimization',
      icon: Zap,
      allowedRoles: ['admin', 'complianceOfficer', 'executive', 'support'],
    },
    {
      title: 'Developer Tools',
      href: '/developer-tools',
      icon: Code,
      allowedRoles: ['admin'],
    },
    {
      title: t('navigation.compliance'),
      href: '/compliance',
      icon: Shield,
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
    },
    {
      title: t('navigation.complianceCases'),
      href: '/compliance-cases',
      icon: FileText,
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
    },
    {
      title: t('navigation.kycVerification'),
      href: '/kyc-verification',
      icon: UserCheck,
      allowedRoles: ['admin', 'complianceOfficer'],
    },
    {
      title: t('navigation.transactions'),
      href: '/transactions',
      icon: CircleDollarSign,
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
    },
    {
      title: t('navigation.documents'),
      href: '/documents',
      icon: FileSearch,
      allowedRoles: ['admin', 'complianceOfficer', 'support'],
    },
    {
      title: t('navigation.amlMonitoring'),
      href: '/aml-monitoring',
      icon: LineChart,
      allowedRoles: ['admin', 'complianceOfficer'],
    },
    {
      title: t('navigation.riskAnalysis'),
      href: '/risk-analysis',
      icon: PieChart,
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
    },
    {
      title: t('navigation.sarCenter'),
      href: '/sar-center',
      icon: FileWarning,
      allowedRoles: ['admin', 'complianceOfficer'],
    },
    {
      title: t('navigation.auditLogs'),
      href: '/audit-logs',
      icon: History,
      allowedRoles: ['admin', 'complianceOfficer'],
    },
    {
      title: t('navigation.users'),
      href: '/users',
      icon: Users,
      allowedRoles: ['admin'],
    },
    {
      title: t('navigation.profile'),
      href: '/profile',
      icon: User,
      allowedRoles: ['admin', 'complianceOfficer', 'executive', 'support'],
    },
  ];

  return (
    <>
      <SidebarHeader className={cn('px-6 py-4', isCollapsed && "px-2 justify-center")}>
        <h1 className="text-lg font-bold text-sidebar-foreground tracking-tight">
          {isCollapsed ? "AML" : t('layout.sidebar.title')}
        </h1>
      </SidebarHeader>
      
      <SidebarContent className={cn(!isCollapsed && "p-2")}>
        <SidebarMenu>
          {navigationItems.map((item) => {
            if (!user || !item.allowedRoles.includes(user.role)) {
              return null;
            }

            const isActive = location.pathname.startsWith(item.href);

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

export default Sidebar;
