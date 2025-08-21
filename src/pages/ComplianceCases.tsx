
import React, { useState, useEffect } from 'react';
import { useComplianceCases } from '@/hooks/useComplianceCases';
import { useAuth } from '@/context/AuthContext';
import CasesList from '@/components/cases/CasesList';
import CaseDetailView from '@/components/cases/CaseDetailView';
import CasesFilters from '@/components/cases/CasesFilters';
import CaseDashboard from '@/components/cases/CaseDashboard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import NewCaseDialog from '@/components/cases/NewCaseDialog';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ComplianceCaseDetails, CaseFilters, CaseSummary } from '@/types/case';

const ComplianceCases = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewCaseDialog, setShowNewCaseDialog] = useState(false);
  const [initialCaseData, setInitialCaseData] = useState<{
    userId: string;
    userName: string;
    description: string;
    type: 'kyc' | 'aml' | 'sanctions';
    source: string;
    riskScore: number;
  } | null>(null);
  const { t } = useTranslation();
  
  const location = useLocation();
  
  const {
    cases,
    caseActions,
    caseSummary,
    filters,
    selectedCase,
    loading,
    setFilters,
    selectCase,
    addCaseNote,
    updateCaseStatus,
    assignCase,
    createCase,
    fetchCases,
  } = useComplianceCases(user?.id);
  
  // Handle case updates from action buttons
  const handleCaseUpdated = () => {
    console.log('Case updated, refreshing data...');
    fetchCases();
  };
  
  // Check for location state actions
  useEffect(() => {
    if (location.state?.createCase && location.state?.userData) {
      setInitialCaseData(location.state.userData);
      setShowNewCaseDialog(true);
      window.history.replaceState({}, document.title);
    } else if (location.state?.caseId && cases.length > 0) {
      const caseToSelect = cases.find(c => c.id === location.state.caseId);
      if (caseToSelect) {
        selectCase(caseToSelect);
        setActiveTab('details');
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, cases, selectCase]);

  // Create a proper case summary that matches the expected interface
  const dashboardSummary: CaseSummary = {
    totalCases: cases.length,
    openCases: cases.filter(c => c.status === 'open').length,
    highRiskCases: cases.filter(c => c.riskScore >= 75).length,
    escalatedCases: cases.filter(c => c.status === 'escalated').length,
    resolvedLastWeek: cases.filter(c => 
      c.status === 'closed' && 
      new Date(c.updatedAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length,
    averageResolutionDays: 3.5, // Mock value
    casesByType: {
      kyc: cases.filter(c => c.type === 'kyc').length,
      aml: cases.filter(c => c.type === 'aml').length,
      sanctions: cases.filter(c => c.type === 'sanctions').length,
    },
    casesByStatus: {
      open: cases.filter(c => c.status === 'open').length,
      under_review: cases.filter(c => c.status === 'under_review').length,
      escalated: cases.filter(c => c.status === 'escalated').length,
      pending_info: cases.filter(c => c.status === 'pending_info').length,
      closed: cases.filter(c => c.status === 'closed').length,
    }
  };
  
  return (
    <div className="h-full p-6">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('navigation.complianceCases')}</h1>
            <p className="text-muted-foreground">
              {t('complianceCases.description')}
            </p>
          </div>
          <Button onClick={() => setShowNewCaseDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            {t('complianceCases.newCaseButton')}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">{t('navigation.dashboard')}</TabsTrigger>
            <TabsTrigger value="cases">{t('complianceCases.tabCases')}</TabsTrigger>
            {selectedCase && <TabsTrigger value="details">{t('complianceCases.tabCaseDetails')}</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="dashboard" className="space-y-4">
            <CaseDashboard 
              summary={dashboardSummary} 
              loading={loading} 
              onViewAllCases={() => setActiveTab('cases')}
            />
          </TabsContent>
          
          <TabsContent value="cases" className="space-y-4">
            <CasesFilters filters={filters} setFilters={setFilters} />
            <CasesList 
              cases={cases}
              loading={loading}
              onSelectCase={(caseItem) => {
                selectCase(caseItem);
                setActiveTab('details');
              }}
              onCaseUpdated={handleCaseUpdated}
              onUpdateStatus={updateCaseStatus}
            />
          </TabsContent>
          
          <TabsContent value="details" className="space-y-4">
            {selectedCase && (
              <CaseDetailView
                caseItem={selectedCase}
                caseActions={caseActions}
                onAddNote={addCaseNote}
                onUpdateStatus={updateCaseStatus}
                onAssign={assignCase}
                onBackToList={() => setActiveTab('cases')}
                currentUser={user}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <NewCaseDialog 
        open={showNewCaseDialog}
        onOpenChange={setShowNewCaseDialog}
        onCreateCase={createCase}
        currentUser={user}
        initialData={initialCaseData}
      />
    </div>
  );
};

export default ComplianceCases;
