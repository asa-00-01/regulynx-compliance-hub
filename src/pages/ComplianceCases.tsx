
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

const ComplianceCases = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showNewCaseDialog, setShowNewCaseDialog] = useState(false);
  const [initialCaseData, setInitialCaseData] = useState<any>(null);
  
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
  } = useComplianceCases(user);
  
  // Check if we need to create a case based on location state
  useEffect(() => {
    if (location.state?.createCase && location.state?.userData) {
      setInitialCaseData(location.state.userData);
      setShowNewCaseDialog(true);
      // Clear the location state to prevent modal reopening on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  return (
    <DashboardLayout requiredRoles={['complianceOfficer', 'admin', 'executive']}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compliance Cases</h1>
            <p className="text-muted-foreground">
              Manage and track compliance cases
            </p>
          </div>
          <Button onClick={() => setShowNewCaseDialog(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            New Case
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            {selectedCase && <TabsTrigger value="details">Case Details</TabsTrigger>}
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
    </DashboardLayout>
  );
};

export default ComplianceCases;
