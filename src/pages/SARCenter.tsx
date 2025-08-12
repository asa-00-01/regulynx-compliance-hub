
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
  TrendingUp
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSARData } from '@/hooks/useSARData';
import SARList from '@/components/sar/SARList';
import { SAR } from '@/types/sar';
import { useToast } from '@/hooks/use-toast';

const SARCenter = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  
  const location = useLocation();
  const { toast } = useToast();
  const { sars, loading, createSAR } = useSARData();

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
    const newSarData: Omit<SAR, 'id'> = {
      userId: userData?.id || caseData.userId || '',
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
    // Create a blank SAR draft
    const newSarData: Omit<SAR, 'id'> = {
      userId: '',
      userName: '',
      dateSubmitted: new Date().toISOString(),
      dateOfActivity: new Date().toISOString(),
      status: 'draft',
      summary: '',
      transactions: [],
      documents: [],
      notes: []
    };

    createSAR(newSarData);
    
    toast({
      title: 'New SAR Draft',
      description: 'A new SAR draft has been created',
    });
  };

  const handleViewSAR = (id: string) => {
    // Navigate to SAR details view
    toast({
      title: 'SAR Details',
      description: `Viewing SAR ${id}`,
    });
  };

  const handleEditDraft = (sar: SAR) => {
    // Navigate to SAR edit mode
    toast({
      title: 'Edit SAR Draft',
      description: `Editing SAR ${sar.id}`,
    });
  };

  const filteredSARData = sars.filter(sar => {
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
          <Button variant="outline">
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>

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
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          <SARList
            sars={sortedSARData}
            onViewSAR={handleViewSAR}
            onCreateNewSAR={handleCreateNewSAR}
            onEditDraft={handleEditDraft}
            loading={loading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SARCenter;
