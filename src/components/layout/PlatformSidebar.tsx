
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
  Building,
  Globe,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/context/auth/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  className?: string;
}

export const PlatformSidebar: React.FC<SidebarProps> = ({ className }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLinkActive = (href: string) => {
    return location.pathname === href;
  };

  const SidebarLink: React.FC<{
    href: string;
    icon: React.ReactNode;
    label: string;
  }> = ({ href, icon, label }) => {
    const isActive = isLinkActive(href);
    return (
      <Button
        variant="ghost"
        onClick={() => navigate(href)}
        className={cn(
          'justify-start px-4 w-full',
          isActive ? 'bg-secondary text-foreground hover:bg-secondary/80' : 'hover:bg-accent hover:text-accent-foreground'
        )}
      >
        {icon}
        <span>{label}</span>
      </Button>
    );
  };

  return (
    <div className={cn('flex flex-col space-y-4 w-64 border-r bg-secondary h-full', className)}>
      <div className="px-4 py-6">
        <Button variant="ghost" className="gap-2 h-auto p-0 font-normal text-lg">
          <Globe className="h-6 w-6" />
          <span>Platform Admin</span>
        </Button>
      </div>
      <ScrollArea className="flex-1 space-y-2 px-3">
        <SidebarLink href="/dashboard" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
        <SidebarLink href="/customers" icon={<Building className="h-4 w-4" />} label="Customers" />
        <SidebarLink href="/users" icon={<Users className="h-4 w-4" />} label="Users" />
        <SidebarLink href="/analytics" icon={<BarChart3 className="h-4 w-4" />} label="Analytics" />
        <SidebarLink href="/integration" icon={<Globe className="h-4 w-4" />} label="Integrations" />
        <SidebarLink href="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
      </ScrollArea>
    </div>
  );
};

export default PlatformSidebar;
