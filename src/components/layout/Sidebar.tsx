import React from 'react';
import {
  Home,
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  HelpCircle,
  LogOut,
  Server,
  Activity,
  TrendingUp,
  UserCog,
  Mailbox,
  LucideIcon
} from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from 'react-router-dom';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles?: string[];
}

interface SidebarSection {
  title: string;
  items: NavItem[];
}

const sidebarItems = [
  {
    title: 'Main',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
      {
        name: 'Cases',
        href: '/cases',
        icon: FileText,
      },
    ]
  },
  {
    title: 'Customers',
    items: [
      {
        name: 'Customer List',
        href: '/customers',
        icon: Users,
      },
    ]
  },
  {
    title: 'Compliance',
    items: [
      {
        name: 'Transaction Alerts',
        href: '/alerts',
        icon: Activity,
      },
      {
        name: 'Trends',
        href: '/trends',
        icon: TrendingUp,
      },
    ]
  },
  {
    title: 'Administration',
    items: [
      {
        name: 'User Management',
        href: '/users',
        icon: UserCog,
        roles: ['admin'],
      },
      {
        name: 'Email Management',
        href: '/emails',
        icon: Mailbox,
        roles: ['admin'],
      },
      {
        name: 'Production Monitor',
        href: '/production-monitor',
        icon: Server,
        roles: ['admin'],
      },
    ]
  },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out."
      });
      navigate('/login');
    } catch (error) {
      console.error("Sign out failed:", error);
      toast({
        title: "Sign Out Failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const renderSidebarSection = (section: SidebarSection, index: number) => (
    <div key={index} className="pb-4">
      <div className="text-sm font-semibold text-muted-foreground px-4 py-2">{section.title}</div>
      {section.items.map((item) => {
        if (item.roles && !item.roles.includes(user?.role || '')) {
          return null;
        }
        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={`flex items-center text-sm font-medium py-2 px-4 rounded-md transition-colors hover:bg-secondary hover:text-foreground ${location.pathname === item.href ? 'bg-secondary text-foreground' : 'text-muted-foreground'}`}
          >
            <item.icon className="mr-2 h-4 w-4" />
            {item.name}
          </NavLink>
        );
      })}
    </div>
  );

  return (
    <div className="flex flex-col h-full border-r bg-secondary/50">
      <div className="flex-1 px-6 py-4">
        <NavLink to="/" className="flex items-center py-3">
          <Home className="mr-2 h-6 w-6" />
          <span className="text-lg font-semibold">Compliance Portal</span>
        </NavLink>
        <ScrollArea className="flex-1">
          <div className="space-y-1">
            {sidebarItems.map(renderSidebarSection)}
          </div>
        </ScrollArea>
      </div>
      <div className="border-t p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center gap-2 w-full rounded-md p-2 text-sm font-normal focus:outline-none">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.image} alt={user?.name} />
                <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-left">
                <span>{user?.name}</span>
                <Badge variant="secondary">{user?.role}</Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Sidebar;
