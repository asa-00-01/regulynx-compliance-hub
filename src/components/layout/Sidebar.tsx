
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
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface NavItemProps {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  allowedRoles: string[];
}

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navigationItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      allowedRoles: ['admin', 'complianceOfficer', 'executive', 'support'],
    },
    {
      title: 'Compliance',
      href: '/compliance',
      icon: Shield,
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
    },
    {
      title: 'Compliance Cases',
      href: '/compliance-cases',
      icon: FileText,
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
    },
    {
      title: 'KYC Verification',
      href: '/kyc-verification',
      icon: UserCheck,
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
    },
    {
      title: 'Transactions',
      href: '/transactions',
      icon: CircleDollarSign,
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
    },
    {
      title: 'Documents',
      href: '/documents',
      icon: FileSearch,
      allowedRoles: ['admin', 'complianceOfficer', 'executive', 'support'],
    },
    {
      title: 'AML Monitoring',
      href: '/aml-monitoring',
      icon: LineChart,
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
    },
    {
      title: 'Risk Analysis',
      href: '/risk-analysis',
      icon: PieChart,
      allowedRoles: ['admin', 'complianceOfficer', 'executive'],
    },
    {
      title: 'SAR Center',
      href: '/sar-center',
      icon: FileWarning,
      allowedRoles: ['admin', 'complianceOfficer'],
    },
    {
      title: 'Users',
      href: '/users',
      icon: Users,
      allowedRoles: ['admin'],
    },
    {
      title: 'Audit Logs',
      href: '/audit-logs',
      icon: History,
      allowedRoles: ['admin', 'complianceOfficer'],
    },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50 border-r py-4">
      <div className="px-4 mb-4">
        <h1 className="text-lg font-bold">AML Compliance Tool</h1>
      </div>
      <nav className="flex-1">
        <ul>
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
                      "flex items-center px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200",
                      isActive ? "bg-gray-200" : "text-gray-700"
                    )
                  }
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.title}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto px-4 py-2 text-center text-muted-foreground">
        <p className="text-xs">
          © {new Date().getFullYear()} Company Inc.
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
