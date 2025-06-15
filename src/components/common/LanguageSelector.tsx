
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Languages } from 'lucide-react';

const LanguageSelector = () => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <div className="flex items-center gap-2">
      <Languages className="w-4 h-4 text-sidebar-foreground/70" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[120px] h-8 bg-sidebar-accent border-sidebar-border text-sidebar-foreground focus:ring-sidebar-ring">
          <SelectValue placeholder={t('common.selectLanguage')} />
        </SelectTrigger>
        <SelectContent className="bg-sidebar border-sidebar-border text-sidebar-foreground">
          <SelectItem value="en" className="cursor-pointer focus:bg-sidebar-accent focus:text-sidebar-accent-foreground">
            English
          </SelectItem>
          <SelectItem value="sv" className="cursor-pointer focus:bg-sidebar-accent focus:text-sidebar-accent-foreground">
            Svenska
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
