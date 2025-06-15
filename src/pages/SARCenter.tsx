import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSARData } from '@/hooks/useSARData';
import SARList from '@/components/sar/SARList';
import SARForm from '@/components/sar/SARForm';
import PatternCard from '@/components/sar/PatternCard';
import MatchesList from '@/components/sar/MatchesList';
import GoAMLReporting from '@/components/sar/GoAMLReporting';
import { SAR } from '@/types/sar';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from '@/components/ui/drawer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useMediaQuery } from '@/hooks/use-mobile';

const SARCenter = () => {
  const { sars, patterns, loading, createSAR, updateSAR, getPatternMatches, createAlertFromMatch, createSARFromMatch } = useSARData();
  
  const [activeTab, setActiveTab] = useState<string>('sar-list');
  const [selectedSARId, setSelectedSARId] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);
  
  const isDesktop = useMediaQuery("(min-width: 768px)");
  
  // Get the currently selected SAR, if any
  const selectedSAR = selectedSARId ? sars.find(sar => sar.id === selectedSARId) : null;
  
  // Get matches for the selected pattern
  const patternMatches = selectedPattern ? getPatternMatches(selectedPattern) : [];
  
  // Handle SAR actions
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
      // Update existing SAR
      updateSAR(selectedSARId, sarData);
    } else {
      // Create new SAR
      createSAR(sarData);
    }
    
    setIsFormOpen(false);
  };
  
  const handleCancelForm = () => {
    setIsFormOpen(false);
    setSelectedSARId(null);
  };
  
  // Handle pattern matches
  const handleViewMatches = (patternId: string) => {
    setSelectedPattern(patternId);
  };
  
  const handleCloseMatchesDialog = () => {
    setSelectedPattern(null);
  };
  
  const handleCreateAlert = (matchId: string) => {
    createAlertFromMatch(matchId);
    setSelectedPattern(null);
  };
  
  const handleCreateSAR = (matchId: string) => {
    createSARFromMatch(matchId);
    setSelectedPattern(null);
    setActiveTab('sar-list');
  };

  const FormWrapper = ({ children }: { children: React.ReactNode }) => {
    return isDesktop ? (
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{selectedSARId ? 'Edit SAR' : 'Create New SAR'}</DialogTitle>
            <DialogDescription>
              {selectedSARId 
                ? 'Update the suspicious activity report details below' 
                : 'Fill in the details to create a new suspicious activity report'}
            </DialogDescription>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    ) : (
      <Drawer open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DrawerContent>
          <DrawerHeader className="text-left">
            <DrawerTitle>{selectedSARId ? 'Edit SAR' : 'Create New SAR'}</DrawerTitle>
            <DrawerDescription>
              {selectedSARId 
                ? 'Update the suspicious activity report details below' 
                : 'Fill in the details to create a new suspicious activity report'}
            </DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-4">{children}</div>
          <DrawerFooter className="pt-2 px-0"></DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  };

  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Suspicious Activity Reporting</h1>
          <p className="text-muted-foreground">
            Monitor, report, and analyze suspicious activities and transaction patterns
          </p>
        </div>

        <Tabs
          defaultValue="sar-list"
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
            <TabsTrigger value="sar-list">SAR Center</TabsTrigger>
            <TabsTrigger value="pattern-explorer">Pattern Explorer</TabsTrigger>
            <TabsTrigger value="goaml-reporting">goAML Reporting</TabsTrigger>
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
            <h2 className="text-2xl font-semibold mb-4">Transaction Pattern Analysis</h2>
            
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
            <GoAMLReporting />
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
      <Dialog open={!!selectedPattern} onOpenChange={() => setSelectedPattern(null)}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {selectedPattern && patterns.find(p => p.id === selectedPattern)?.name}
            </DialogTitle>
            <DialogDescription>
              Review transactions matching this pattern and take appropriate actions
            </DialogDescription>
          </DialogHeader>
          <MatchesList
            matches={patternMatches}
            onCreateAlert={handleCreateAlert}
            onCreateSAR={handleCreateSAR}
          />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default SARCenter;
