
import React from 'react';
import LanguageSelector from '@/components/common/LanguageSelector';
import { TooltipHelp } from '@/components/ui/tooltip-custom';
import NotificationBell from './NotificationBell';
import HeaderSearch from './HeaderSearch';
import UserNav from './UserNav';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <HeaderSearch />

      <div className="flex items-center gap-2 ml-auto">
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
