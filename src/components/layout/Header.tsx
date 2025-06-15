
import React from 'react';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LanguageSelector from '@/components/common/LanguageSelector';
import { TooltipHelp } from '@/components/ui/tooltip-custom';
import NotificationBell from './NotificationBell';
import HeaderSearch from './HeaderSearch';
import UserNav from './UserNav';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header = ({ toggleSidebar, sidebarOpen }: HeaderProps) => {
  const { t } = useTranslation();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <TooltipHelp content={sidebarOpen ? t('layout.header.closeMenu') : t('layout.header.openMenu')}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t('layout.header.toggleMenu')}</span>
        </Button>
      </TooltipHelp>
      <TooltipHelp content={sidebarOpen ? t('layout.header.collapseSidebar') : t('layout.header.expandSidebar')}>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t('layout.header.toggleMenu')}</span>
        </Button>
      </TooltipHelp>

      <HeaderSearch />

      <div className="flex items-center gap-2">
        <TooltipHelp content={t('layout.header.changeLanguageTooltip')}>
          <LanguageSelector />
        </TooltipHelp>
        
        <NotificationBell />

        <UserNav />
      </div>
    </header>
  );
};

export default Header;
