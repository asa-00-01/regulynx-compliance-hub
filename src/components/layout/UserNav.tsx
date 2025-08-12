
import React from 'react';
import { LogOut, Settings, User, Shield, Bell, HelpCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const UserNav = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (!user) {
    return null;
  }

  const getRoleDisplay = () => {
    if (user.isPlatformOwner) return 'Platform Owner';
    if (user.customer_roles?.includes('customer_admin')) return 'Admin';
    if (user.customer_roles?.includes('customer_compliance')) return 'Compliance Officer';
    if (user.customer_roles?.includes('customer_executive')) return 'Executive';
    return 'User';
  };

  const getRoleBadgeVariant = () => {
    if (user.isPlatformOwner) return 'default';
    if (user.customer_roles?.includes('customer_admin')) return 'destructive';
    if (user.customer_roles?.includes('customer_compliance')) return 'secondary';
    return 'outline';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-accent">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatarUrl} alt={user.name || user.email} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {user.name?.charAt(0) || user.email?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatarUrl} alt={user.name || user.email} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                  {user.name?.charAt(0) || user.email?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-none truncate">
                  {user.name || 'User'}
                </p>
                <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                  {user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getRoleBadgeVariant()} className="text-xs">
                {getRoleDisplay()}
              </Badge>
              {user.riskScore !== undefined && (
                <Badge variant="outline" className="text-xs">
                  Risk: {user.riskScore}%
                </Badge>
              )}
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        {(user.isPlatformOwner || user.customer_roles?.includes('customer_admin')) && (
          <DropdownMenuItem onClick={() => navigate('/users')} className="cursor-pointer">
            <Shield className="mr-2 h-4 w-4" />
            <span>User Management</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notification Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer">
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserNav;
