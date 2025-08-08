import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
import { User } from '@/types';

const ComplianceCases = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewCaseDialog, setShowNewCaseDialog] = useState(false);
  const [initialCaseData, setInitialCaseData] = useState<any>(null);
  const { t } = useTranslation();
  
  const location = useLocation();
  
  // Convert ExtendedUser to User for compatibility
  const compatibleUser: User | undefined = user ? {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    riskScore: user.riskScore,
    status: user.status,
    avatarUrl: user.avatarUrl,
    title: user.title,
    department: user.department,
    phone: user.phone,
    location: user.location,
    preferences: user.preferences,
    customer_id: user.customer_id,
    platform_roles: user.platform_roles,
    customer_roles: user.customer_roles,
    customer: user.customer,
    isPlatformOwner: user.isPlatformOwner,
  } : undefined;
  
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
  } = useComplianceCases(compatibleUser);
  
  // Check for location state actions
  useEffect(() => {
    if (location.state?.createCase && location.state?.userData) {
      setInitialCaseData(location.state.userData);
      setShowNewCaseDialog(true);
      // Clear the location state to prevent modal reopening on refresh
      window.history.replaceState({}, document.title);
    } else if (location.state?.caseId && cases.length > 0) {
      const caseToSelect = cases.find(c => c.id === location.state.caseId);
      if (caseToSelect) {
        selectCase(caseToSelect);
        setActiveTab('details');
        // Clear the location state to prevent re-triggering
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, cases, selectCase]);
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
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
              summary={caseSummary} 
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
                currentUser={compatibleUser}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <NewCaseDialog 
        open={showNewCaseDialog}
        onOpenChange={setShowNewCaseDialog}
        onCreateCase={createCase}
        currentUser={compatibleUser}
        initialData={initialCaseData}
      />
    </DashboardLayout>
  );
};

export default ComplianceCases;
