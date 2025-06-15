
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';

interface KYCUserTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  flaggedUsersCount: number;
}

const KYCUserTabs: React.FC<KYCUserTabsProps> = ({
  activeTab,
  setActiveTab,
  flaggedUsersCount
}) => {
  const { t } = useTranslation();
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">{t('kyc.tabs.allUsers')}</TabsTrigger>
        <TabsTrigger value="pep">{t('kyc.tabs.pepUsers')}</TabsTrigger>
        <TabsTrigger value="sanctioned">{t('kyc.tabs.sanctioned')}</TabsTrigger>
        <TabsTrigger value="high_risk">{t('kyc.tabs.highRisk')}</TabsTrigger>
        <TabsTrigger value="incomplete">{t('kyc.tabs.incompleteKyc')}</TabsTrigger>
        <TabsTrigger value="flagged">
          {t('kyc.tabs.flagged')}
          {flaggedUsersCount > 0 && (
            <Badge variant="secondary" className="ml-2">{flaggedUsersCount}</Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default KYCUserTabs;
