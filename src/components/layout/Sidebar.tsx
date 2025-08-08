
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/context/AuthContext';
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
  Building2,
  CreditCard,
  UserCheck,
  DollarSign,
  Activity,
  Archive,
  Gauge,
  Plug
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Compliance', href: '/compliance', icon: Shield },
  { name: 'Compliance Cases', href: '/compliance-cases', icon: FileText },
  { name: 'KYC Verification', href: '/kyc-verification', icon: UserCheck, roles: ['admin', 'complianceOfficer'] },
  { name: 'Transactions', href: '/transactions', icon: DollarSign },
  { name: 'Documents', href: '/documents', icon: Archive },
  { name: 'AML Monitoring', href: '/aml-monitoring', icon: Activity },
  { name: 'Risk Analysis', href: '/risk-analysis', icon: AlertTriangle },
  { name: 'SAR Center', href: '/sar-center', icon: Shield, roles: ['admin', 'complianceOfficer'] },
  { name: 'Integration', href: '/integration', icon: Plug },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Audit Logs', href: '/audit-logs', icon: Search },
  { name: 'Users', href: '/users', icon: Users, roles: ['admin'] },
];

const secondaryNavigation = [
  { name: 'AI Agent', href: '/ai-agent', icon: Bot },
  { name: 'News', href: '/news', icon: Newspaper },
  { name: 'Optimization', href: '/optimization', icon: Gauge },
  { name: 'Developer Tools', href: '/developer-tools', icon: Code },
  { name: 'Platform Management', href: '/platform-management', icon: Building2 },
  { name: 'Pricing', href: '/pricing', icon: CreditCard },
];

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (href: string) => location.pathname === href;

  const hasAccess = (item: any) => {
    if (!item.roles) return true;
    return item.roles.includes(user?.role);
  };

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold text-gray-900">Regulynx</h1>
      </div>
      
      <ScrollArea className="flex-1 px-3">
        <nav className="flex flex-col space-y-1">
          {navigation.filter(hasAccess).map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive(item.href) && "bg-blue-50 text-blue-700"
                )}
              >
                <Link to={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
          
          <Separator className="my-4" />
          
          {secondaryNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.name}
                asChild
                variant={isActive(item.href) ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  isActive(item.href) && "bg-blue-50 text-blue-700"
                )}
              >
                <Link to={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  {item.name}
                </Link>
              </Button>
            );
          })}
          
          <Separator className="my-4" />
          
          <Button
            asChild
            variant={isActive('/profile') ? "secondary" : "ghost"}
            className={cn(
              "w-full justify-start",
              isActive('/profile') && "bg-blue-50 text-blue-700"
            )}
          >
            <Link to="/profile">
              <Settings className="mr-2 h-4 w-4" />
              Profile & Settings
            </Link>
          </Button>
        </nav>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
