
import React from 'react';
import { Search, Bell, Settings, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
import LanguageSelector from '@/components/common/LanguageSelector';
import { TooltipHelp } from '@/components/ui/tooltip-custom';
import NotificationBell from './NotificationBell';
import UserNav from './UserNav';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search transactions, users, documents..."
            className="pl-10 w-full bg-muted/30 border-0 focus-visible:ring-1 focus-visible:ring-ring h-9"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-1 mr-2">
          <TooltipHelp content="Help & Documentation">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </TooltipHelp>
          
          <TooltipHelp content="System Settings">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Settings className="h-4 w-4" />
            </Button>
          </TooltipHelp>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-6 w-px bg-border mx-2" />
        
        {/* Language Selector */}
        <TooltipHelp content={t('layout.header.changeLanguageTooltip')}>
          <LanguageSelector />
        </TooltipHelp>
        
        {/* Notifications */}
        <NotificationBell />

        {/* User Menu */}
        <UserNav />
      </div>
    </header>
  );
};

export default Header;
