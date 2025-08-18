
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  Search,
  Filter,
  Download,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  FileText,
  TrendingUp,
  ArrowLeft,
  Edit,
  Trash2,
  BarChart3,
  Settings
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSARData } from '@/hooks/useSARData';
import SARList from '@/components/sar/SARList';
import SARDetailsModal from '@/components/sar/SARDetailsModal';
import SARForm from '@/components/sar/SARForm';
import SARAdvancedFilters, { SARFilters } from '@/components/sar/SARAdvancedFilters';
import SARWorkflowManager from '@/components/sar/SARWorkflowManager';
import SARAnalytics from '@/components/sar/SARAnalytics';
import { SAR, SARStatus } from '@/types/sar';
import { useToast } from '@/hooks/use-toast';
import { SARFormData } from '@/utils/sarFormHelpers';

type ViewMode = 'list' | 'create' | 'edit' | 'details' | 'workflow' | 'analytics';

const SARCenter = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedSAR, setSelectedSAR] = useState<SAR | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<SARFilters>({
    searchTerm: '',
    status: 'all',
    dateRange: { start: '', end: '' },
    riskLevel: 'all',
    transactionCount: 'all',
    hasDocuments: false,
    hasNotes: false
  });
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  
  const location = useLocation();
  const { toast } = useToast();
  const { sars, loading, createSAR, updateSAR, deleteSAR } = useSARData();

  // Handle creating SAR from case data
  useEffect(() => {
    if (location.state?.createSAR && location.state?.caseData) {
      const caseData = location.state.caseData;
      const userData = location.state.userData;
      
      // Pre-populate SAR creation with case data
      handleCreateSARFromCase(caseData, userData);
    }
  }, [location.state]);

  const handleCreateSARFromCase = (caseData: any, userData: any) => {
    // Validate that we have a proper user ID (UUID)
    const userId = userData?.id || caseData.userId;
    if (!userId || userId === '') {
      toast({
        title: 'Error Creating SAR',
        description: 'Invalid user ID. Cannot create SAR without a valid user.',
        variant: 'destructive',
      });
      return;
    }

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      toast({
        title: 'Error Creating SAR',
        description: 'Invalid user ID format. Please ensure the user data is properly loaded.',
        variant: 'destructive',
      });
      return;
    }

    const newSarData: Omit<SAR, 'id'> = {
      userId: userId,
      userName: userData?.fullName || caseData.userName || 'Unknown User',
      dateSubmitted: new Date().toISOString(),
      dateOfActivity: new Date().toISOString(),
      status: 'draft',
      summary: `SAR created from compliance case: ${caseData.description || 'Case investigation'}`,
      transactions: caseData.relatedTransactions || [],
      documents: caseData.documents || [],
      notes: [`Created from compliance case ${caseData.id}`, `Case type: ${caseData.type}`, `Risk score: ${caseData.riskScore}`]
    };

    createSAR(newSarData);
    
    toast({
      title: 'SAR Draft Created',
      description: 'A new SAR draft has been created from the case data',
    });
  };

  const handleCreateNewSAR = () => {
    setViewMode('create');
    setSelectedSAR(null);
  };

  const handleViewSAR = (id: string) => {
    const sar = sars.find(s => s.id === id);
    if (sar) {
      setSelectedSAR(sar);
      setShowDetailsModal(true);
    }
  };

  const handleEditDraft = (sar: SAR) => {
    setSelectedSAR(sar);
    setViewMode('edit');
  };

  const handleDeleteSAR = async (sar: SAR) => {
    if (window.confirm(`Are you sure you want to delete SAR ${sar.id}? This action cannot be undone.`)) {
      try {
        await deleteSAR(sar.id);
        toast({
          title: 'SAR Deleted',
          description: 'SAR has been deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error Deleting SAR',
          description: 'Failed to delete SAR',
          variant: 'destructive',
        });
      }
    }
  };

  const handleWorkflowAction = async (sarId: string, newStatus: SARStatus, notes?: string) => {
    await updateSAR({
      id: sarId,
      updates: {
        status: newStatus,
        notes: notes ? [...(selectedSAR?.notes || []), `[${newStatus.toUpperCase()}] ${notes}`] : selectedSAR?.notes
      }
    });
    
    setShowWorkflowModal(false);
    setSelectedSAR(null);
  };

  const handleFormSubmit = async (formData: SARFormData) => {
    try {
      if (viewMode === 'create') {
        const newSarData: Omit<SAR, 'id'> = {
          userId: formData.userId,
          userName: formData.userName,
          dateSubmitted: new Date().toISOString(),
          dateOfActivity: formData.dateOfActivity,
          status: formData.status,
          summary: formData.summary,
          transactions: formData.transactions,
          documents: [],
          notes: formData.notes || []
        };
        await createSAR(newSarData);
      } else if (viewMode === 'edit' && selectedSAR) {
        await updateSAR({
          id: selectedSAR.id,
          updates: {
            userId: formData.userId,
            userName: formData.userName,
            dateOfActivity: formData.dateOfActivity,
            status: formData.status,
            summary: formData.summary,
            transactions: formData.transactions,
            notes: formData.notes || []
          }
        });
      }
      
      setViewMode('list');
      setSelectedSAR(null);
      
      toast({
        title: `SAR ${formData.status === 'draft' ? 'Draft Saved' : 'Submitted'}`,
        description: `SAR has been ${formData.status === 'draft' ? 'saved as draft' : 'submitted successfully'}`,
      });
    } catch (error) {
      toast({
        title: 'Error Saving SAR',
        description: 'Failed to save SAR',
        variant: 'destructive',
      });
    }
  };

  const handleFormCancel = () => {
    setViewMode('list');
    setSelectedSAR(null);
  };

  const handleExportData = () => {
    const csvContent = generateCSVExport();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sar-reports-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    toast({
      title: 'Export Complete',
      description: 'SAR data has been exported to CSV',
    });
  };

  const generateCSVExport = () => {
    const headers = ['ID', 'User Name', 'Date of Activity', 'Date Submitted', 'Status', 'Summary', 'Transaction Count', 'Notes Count'];
    const rows = filteredSARData.map(sar => [
      sar.id,
      sar.userName,
      new Date(sar.dateOfActivity).toLocaleDateString(),
      new Date(sar.dateSubmitted).toLocaleDateString(),
      sar.status,
      sar.summary,
      sar.transactions?.length || 0,
      sar.notes?.length || 0
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const applyAdvancedFilters = (sars: SAR[]) => {
    return sars.filter(sar => {
      // Search term
      if (advancedFilters.searchTerm && !sar.userName.toLowerCase().includes(advancedFilters.searchTerm.toLowerCase()) &&
          !sar.summary.toLowerCase().includes(advancedFilters.searchTerm.toLowerCase())) {
        return false;
      }

      // Status filter
      if (advancedFilters.status !== 'all' && sar.status !== advancedFilters.status) {
        return false;
      }

      // Date range
      if (advancedFilters.dateRange.start) {
        const sarDate = new Date(sar.dateSubmitted);
        const startDate = new Date(advancedFilters.dateRange.start);
        if (sarDate < startDate) return false;
      }

      if (advancedFilters.dateRange.end) {
        const sarDate = new Date(sar.dateSubmitted);
        const endDate = new Date(advancedFilters.dateRange.end);
        if (sarDate > endDate) return false;
      }

      // Transaction count
      if (advancedFilters.transactionCount !== 'all') {
        const txCount = sar.transactions?.length || 0;
        switch (advancedFilters.transactionCount) {
          case '0':
            if (txCount !== 0) return false;
            break;
          case '1-5':
            if (txCount < 1 || txCount > 5) return false;
            break;
          case '6-10':
            if (txCount < 6 || txCount > 10) return false;
            break;
          case '10+':
            if (txCount <= 10) return false;
            break;
        }
      }

      // Has documents
      if (advancedFilters.hasDocuments && (!sar.documents || sar.documents.length === 0)) {
        return false;
      }

      // Has notes
      if (advancedFilters.hasNotes && (!sar.notes || sar.notes.length === 0)) {
        return false;
      }

      return true;
    });
  };

  const filteredSARData = applyAdvancedFilters(sars).filter(sar => {
    const searchMatch = sar.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       sar.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       sar.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || sar.status === statusFilter;
    return searchMatch && statusMatch;
  });

  const sortedSARData = [...filteredSARData].sort((a, b) => {
    const dateA = new Date(a.dateSubmitted).getTime();
    const dateB = new Date(b.dateSubmitted).getTime();

    if (sortOrder === 'date') {
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
    }

    return 0;
  });

  // Render analytics view
  if (viewMode === 'analytics') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SAR Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Comprehensive analysis and reporting of SAR data
            </p>
          </div>
        </div>

        <SARAnalytics
          sars={sars}
          timeRange={analyticsTimeRange}
          onTimeRangeChange={setAnalyticsTimeRange}
        />
      </div>
    );
  }

  // Render form view
  if (viewMode === 'create' || viewMode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={handleFormCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {viewMode === 'create' ? 'Create New SAR' : 'Edit SAR'}
            </h1>
            <p className="text-muted-foreground mt-2">
              {viewMode === 'create' 
                ? 'Create a new Suspicious Activity Report' 
                : 'Edit existing SAR details'
              }
            </p>
          </div>
        </div>

        <SARForm
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          initialData={viewMode === 'edit' && selectedSAR ? {
            userId: selectedSAR.userId,
            userName: selectedSAR.userName,
            dateOfActivity: selectedSAR.dateOfActivity,
            summary: selectedSAR.summary,
            transactions: selectedSAR.transactions,
            notes: selectedSAR.notes,
            status: selectedSAR.status as 'draft' | 'submitted'
          } : undefined}
        />
      </div>
    );
  }

  // Render list view
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SAR (Suspicious Activity Report) Center</h1>
          <p className="text-muted-foreground mt-2">
            Manage and review suspicious activity reports.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setViewMode('analytics')}>
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={handleCreateNewSAR}>
            <Plus className="h-4 w-4 mr-2" />
            Create New SAR
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total SARs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sars.length}</div>
            <p className="text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-2 inline-block" />
              Active reports in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Draft SARs</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {sars.filter(sar => sar.status === 'draft').length}
            </div>
            <p className="text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 mr-2 inline-block" />
              Pending completion
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted SARs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {sars.filter(sar => sar.status === 'submitted').length}
            </div>
            <p className="text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 mr-2 inline-block" />
              Filed with authorities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected SARs</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {sars.filter(sar => sar.status === 'rejected').length}
            </div>
            <p className="text-sm text-muted-foreground">
              <XCircle className="h-4 w-4 mr-2 inline-block" />
              Require revision
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Filters */}
      <SARAdvancedFilters
        filters={advancedFilters}
        onFiltersChange={setAdvancedFilters}
        onClearFilters={() => setAdvancedFilters({
          searchTerm: '',
          status: 'all',
          dateRange: { start: '', end: '' },
          riskLevel: 'all',
          transactionCount: 'all',
          hasDocuments: false,
          hasNotes: false
        })}
        isOpen={showAdvancedFilters}
        onToggle={() => setShowAdvancedFilters(!showAdvancedFilters)}
      />

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="draft">Draft</TabsTrigger>
            <TabsTrigger value="submitted">Submitted</TabsTrigger>
            <TabsTrigger value="filed">Filed</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="filed">Filed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortDirection} onValueChange={setSortDirection}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">Newest First</SelectItem>
                <SelectItem value="asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          <SARList
            sars={sortedSARData}
            onViewSAR={handleViewSAR}
            onCreateNewSAR={handleCreateNewSAR}
            onEditDraft={handleEditDraft}
            onDeleteSAR={handleDeleteSAR}
            loading={loading}
          />
        </TabsContent>
      </Tabs>

      {/* SAR Details Modal */}
      <SARDetailsModal
        sar={selectedSAR}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      {/* SAR Workflow Modal */}
      {selectedSAR && (
        <SARDetailsModal
          sar={selectedSAR}
          open={showWorkflowModal}
          onOpenChange={setShowWorkflowModal}
        />
      )}
    </div>
  );
};

export default SARCenter;
