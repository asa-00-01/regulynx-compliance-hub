
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSARData } from '@/hooks/useSARData';
import SARList from '@/components/sar/SARList';
import SARForm from '@/components/sar/SARForm';
import PatternCard from '@/components/sar/PatternCard';
import MatchesList from '@/components/sar/MatchesList';
import GoAMLReporting from '@/components/sar/GoAMLReporting';
import { SAR, PatternMatch } from '@/types/sar';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/use-mobile';
import { useTranslation } from 'react-i18next';

const SARCenter = () => {
  const { sars, patterns, loading, createSAR, updateSAR, getPatternMatches, createAlertFromMatch, createSARFromMatch } = useSARData();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<string>('sar-list');
  const [selectedSARId, setSelectedSARId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  const [patternMatches, setPatternMatches] = useState<PatternMatch[]>([]);
  const [isMatchesLoading, setIsMatchesLoading] = useState(false);
  
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  const selectedSAR = selectedSARId ? sars.find(sar => sar.id === selectedSARId) : null;
  
  const handleViewSAR = (id: string) => {
    setSelectedSARId(id);
    setIsFormOpen(true);
  };
  
  const handleCreateNewSAR = () => {
    setSelectedSARId(null);
    setIsFormOpen(true);
  };
  
  const handleSARSubmit = (sarData: Omit<SAR, 'id'>, isDraft: boolean) => {
    if (selectedSARId) {
      updateSAR({ id: selectedSARId, updates: sarData });
    } else {
      createSAR(sarData);
    }
    
    setIsFormOpen(false);
  };
  
  const handleCancelForm = () => {
    setIsFormOpen(false);
    setSelectedSARId(null);
  };
  
  const handleViewMatches = async (patternId: string) => {
    setSelectedPattern(patternId);
    setIsMatchesLoading(true);
    const matches = await getPatternMatches(patternId);
    setPatternMatches(matches);
    setIsMatchesLoading(false);
  };
  
  const handleCloseMatchesDialog = () => {
    setSelectedPattern(null);
    setPatternMatches([]);
  };
  
  const handleCreateAlert = (match: PatternMatch) => {
    createAlertFromMatch(match);
  };
  
  const handleCreateSAR = (match: PatternMatch) => {
    createSARFromMatch(match);
    setSelectedPattern(null);
    setActiveTab('sar-list');
  };

  const FormWrapper = ({ children }: { children: React.ReactNode }) => {
    return isDesktop ? (
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSARId ? t('sarCenter.editSAR') : t('sarCenter.createSAR')}</DialogTitle>
            <DialogDescription>
              {selectedSARId 
                ? t('sarCenter.editSARDesc')
                : t('sarCenter.createSARDesc')}
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    ) : (
      <Drawer open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{selectedSARId ? t('sarCenter.editSAR') : t('sarCenter.createSAR')}</DrawerTitle>
            <DrawerDescription>
              {selectedSARId 
                ? t('sarCenter.editSARDesc')
                : t('sarCenter.createSARDesc')}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4 overflow-y-auto">{children}</div>
          <DrawerFooter className="pt-2 px-0"></DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{t('sarCenter.title')}</h1>
          <p className="text-muted-foreground">
            {t('sarCenter.description')}
          </p>
        </div>

        <Tabs
          defaultValue="sar-list"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
            <TabsTrigger value="sar-list">{t('navigation.sarCenter')}</TabsTrigger>
            <TabsTrigger value="pattern-explorer">{t('sarCenter.patternExplorer')}</TabsTrigger>
            <TabsTrigger value="goaml-reporting">{t('sarCenter.goamlReporting')}</TabsTrigger>
          </TabsList>

          <TabsContent value="sar-list" className="space-y-4">
            <SARList
              sars={sars}
              onViewSAR={handleViewSAR}
              onCreateNewSAR={handleCreateNewSAR}
              loading={loading}
            />
          </TabsContent>

          <TabsContent value="pattern-explorer" className="space-y-6">
            <h2 className="text-2xl font-semibold mb-4">{t('sarCenter.transactionPatternAnalysis')}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {patterns.map(pattern => (
                <PatternCard
                  key={pattern.id}
                  pattern={pattern}
                  onViewMatches={handleViewMatches}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="goaml-reporting" className="space-y-4">
            <GoAMLReporting sars={sars} />
          </TabsContent>
        </Tabs>
      </div>

      {/* SAR Form in Dialog/Drawer */}
      <FormWrapper>
        <SARForm
          initialData={selectedSAR}
          onSubmit={handleSARSubmit}
          onCancel={handleCancelForm}
          isSubmitting={loading}
        />
      </FormWrapper>

      {/* Pattern Matches Dialog */}
      <Dialog open={!!selectedPattern} onOpenChange={(isOpen) => !isOpen && handleCloseMatchesDialog()}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPattern && patterns.find(p => p.id === selectedPattern)?.name}
            </DialogTitle>
            <DialogDescription>
              {t('sarCenter.matchesDialogDesc')}
            </DialogDescription>
          </DialogHeader>
          <MatchesList
            matches={patternMatches}
            onCreateAlert={handleCreateAlert}
            onCreateSAR={handleCreateSAR}
            isLoading={isMatchesLoading}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SARCenter;
