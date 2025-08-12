
import React, { useState } from 'react';
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

const SARCenter = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [riskLevelFilter, setRiskLevelFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ from: null, to: null });
  const [sortOrder, setSortOrder] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const sarData = [
    { id: 1, caseId: 'SAR-2023-001', subject: 'John Doe', dateFiled: '2023-01-15', status: 'pending', riskLevel: 'high', description: 'Suspicious transaction patterns.' },
    { id: 2, caseId: 'SAR-2023-002', subject: 'Jane Smith', dateFiled: '2023-02-20', status: 'reviewed', riskLevel: 'medium', description: 'Unexplained large deposit.' },
    { id: 3, caseId: 'SAR-2023-003', subject: 'Robert Jones', dateFiled: '2023-03-10', status: 'closed', riskLevel: 'low', description: 'Multiple transactions below reporting threshold.' },
  ];

  const filteredSARData = sarData.filter(sar => {
    const searchMatch = sar.subject.toLowerCase().includes(searchTerm.toLowerCase()) || sar.caseId.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || sar.status === statusFilter;
    const riskMatch = riskLevelFilter === 'all' || sar.riskLevel === riskLevelFilter;
    return searchMatch && statusMatch && riskMatch;
  });

  const sortedSARData = [...filteredSARData].sort((a, b) => {
    const dateA = new Date(a.dateFiled).getTime();
    const dateB = new Date(b.dateFiled).getTime();

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
          <Button>
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
            <div className="text-2xl font-bold">{sarData.length}</div>
            <p className="text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4 mr-2 inline-block" />
              12% increase from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{sarData.filter(sar => sar.status === 'pending').length}</div>
            <p className="text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 mr-2 inline-block" />
              3 new reports today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved SARs</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{sarData.filter(sar => sar.status === 'closed').length}</div>
            <p className="text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 mr-2 inline-block" />
              All reports closed within SLA
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="reviewed">Reviewed</TabsTrigger>
            <TabsTrigger value="closed">Closed</TabsTrigger>
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={riskLevelFilter} onValueChange={setRiskLevelFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Risk Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {sortedSARData.map(sar => (
              <Card key={sar.id}>
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {sar.subject}
                    <Badge variant="secondary">{sar.riskLevel}</Badge>
                  </CardTitle>
                  <CardDescription>Case ID: {sar.caseId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>{sar.description}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">Date Filed: {sar.dateFiled}</p>
                    <Badge variant="outline">{sar.status}</Badge>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SARCenter;
