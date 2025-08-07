import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Users,
  FileText,
  Shield,
  TrendingUp,
  Settings,
  AlertTriangle,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  BarChart3,
  Bell,
  Mail,
  Newspaper,
} from 'lucide-react';
import { useAuth } from '@/context/auth/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const CustomerSidebar: React.FC<SidebarProps> = React.memo(({ className, ...props }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLinkActive = (href: string) => {
    return location.pathname === href;
  };

  const SidebarLink = React.forwardRef<
    HTMLAnchorElement,
    React.PropsWithChildren<{
      href: string;
      icon: React.ReactNode;
      label: string;
    }>
  >(({ href, icon, label, children, ...props }, ref) => {
    const isActive = isLinkActive(href);
    return (
      <Button
        variant="ghost"
        as="a"
        href={href}
        className={cn(
          'justify-start px-4',
          isActive ? 'bg-secondary text-foreground hover:bg-secondary/80' : 'hover:bg-accent hover:text-accent-foreground'
        )}
        ref={ref}
        {...props}
      >
        {icon}
        <span>{label}</span>
      </Button>
    );
  });
  SidebarLink.displayName = 'SidebarLink';

  return (
    <div className={cn('flex flex-col space-y-4 w-64 border-r bg-secondary h-full', className)} {...props}>
      <div className="px-4 py-6">
        <Button variant="ghost" className="gap-2 h-auto p-0 font-normal text-lg">
          <Shield className="h-6 w-6" />
          <span>{user?.companyName || 'ComplianceOS'}</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 space-y-2 px-3">
        <SidebarLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
        <SidebarLink href="/compliance" icon={<AlertTriangle className="h-4 w-4" />} label="Compliance" />
        <SidebarLink href="/cases" icon={<FileText className="h-4 w-4" />} label="Cases" />
        <SidebarLink href="/customers" icon={<Users className="h-4 w-4" />} label="Customers" />
        <SidebarLink href="/documents" icon={<FileText className="h-4 w-4" />} label="Documents" />
        <SidebarLink href="/transactions" icon={<DollarSign className="h-4 w-4" />} label="Transactions" />
        <SidebarLink href="/reports" icon={<BarChart3 className="h-4 w-4" />} label="Reports" />
        <SidebarLink href="/notifications" icon={<Bell className="h-4 w-4" />} label="Notifications" />
        <SidebarLink href="/analytics" icon={<TrendingUp className="h-4 w-4" />} label="Analytics" />
        <SidebarLink href="/profile?tab=profile" icon={<Settings className="h-4 w-4" />} label="Settings" />
      </ScrollArea>
    </div>
  );
});

CustomerSidebar.displayName = 'CustomerSidebar';

export default CustomerSidebar;
