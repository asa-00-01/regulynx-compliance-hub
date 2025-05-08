
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

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
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
      <TabsList>
        <TabsTrigger value="all">All Users</TabsTrigger>
        <TabsTrigger value="pep">PEP Users</TabsTrigger>
        <TabsTrigger value="sanctioned">Sanctioned</TabsTrigger>
        <TabsTrigger value="high_risk">High Risk</TabsTrigger>
        <TabsTrigger value="incomplete">Incomplete KYC</TabsTrigger>
        <TabsTrigger value="flagged">
          Flagged
          {flaggedUsersCount > 0 && (
            <Badge variant="secondary" className="ml-2">{flaggedUsersCount}</Badge>
          )}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default KYCUserTabs;
