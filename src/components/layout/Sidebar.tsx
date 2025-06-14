
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
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import LanguageSelector from '@/components/common/LanguageSelector';

interface NavItemProps {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  allowedRoles: string[];
}

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

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
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
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
      allowedRoles: ['admin', 'complianceOfficer', 'executive', 'support'],
    },
    {
      title: t('navigation.amlMonitoring'),
      href: '/aml-monitoring',
      icon: LineChart,
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
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
      title: t('navigation.users'),
      href: '/users',
      icon: Users,
      allowedRoles: ['admin'],
    },
    {
      title: t('navigation.auditLogs'),
      href: '/audit-logs',
      icon: History,
      allowedRoles: ['admin', 'complianceOfficer'],
    },
    {
      title: t('navigation.profile'),
      href: '/profile',
      icon: User,
      allowedRoles: ['admin', 'complianceOfficer', 'executive', 'support'],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-r border-border shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border">
        <h1 className="text-lg font-bold text-foreground tracking-tight">
          AML Compliance Tool
        </h1>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navigationItems.map((item) => {
            if (!user || !item.allowedRoles.includes(user.role)) {
              return null;
            }

            return (
              <li key={item.title}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 group",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:text-foreground"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.title}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* Language Selector */}
      <div className="px-6 py-4 border-t border-border">
        <LanguageSelector />
      </div>
      
      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()} Company Inc.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
