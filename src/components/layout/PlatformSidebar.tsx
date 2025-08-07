import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  LayoutDashboard,
  Settings,
  Users,
  Database,
  Shield,
  BarChart3,
  Code,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/auth/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

interface PlatformSidebarProps extends React.HTMLAttributes<HTMLElement> {
  className?: string;
}

const PlatformSidebar = React.forwardRef<HTMLElement, PlatformSidebarProps>(
  ({ className, ...props }, ref) => {
    const { isPlatformUser } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const platformRoutes = [
      {
        icon: LayoutDashboard,
        label: 'Dashboard',
        href: '/dashboard',
      },
      {
        icon: Users,
        label: 'User Management',
        href: '/users',
      },
      {
        icon: Database,
        label: 'Data Management',
        href: '/data',
      },
      {
        icon: Shield,
        label: 'Security',
        href: '/security',
      },
      {
        icon: BarChart3,
        label: 'Analytics',
        href: '/analytics',
      },
      {
        icon: Code,
        label: 'Developer Tools',
        href: '/developer',
      },
      {
        icon: Zap,
        label: 'Integrations',
        href: '/integrations',
      },
      {
        icon: Settings,
        label: 'Settings',
        href: '/settings',
      },
    ];

    if (!isPlatformUser) {
      return null;
    }

    return (
      <div
        className={cn(
          'flex h-full w-[280px] flex-col border-r bg-secondary',
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="px-6 py-4">
          <Button variant="ghost" className="font-bold">
            Platform Admin
          </Button>
        </div>
        <ScrollArea className="flex-1 space-y-2 px-3">
          {platformRoutes.map((route) => (
            <Button
              variant="ghost"
              className={cn(
                'w-full justify-start gap-2',
                location.pathname === route.href
                  ? 'bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
              key={route.href}
              onClick={() => navigate(route.href)}
            >
              <route.icon className="h-4 w-4" />
              <span>{route.label}</span>
            </Button>
          ))}
        </ScrollArea>
      </div>
    );
  }
);
PlatformSidebar.displayName = 'PlatformSidebar';

export { PlatformSidebar };
