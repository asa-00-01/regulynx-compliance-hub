import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Search,
  Calendar,
  User,
  ArrowUpRight,
  Eye
} from 'lucide-react';
import { useEscalation } from '@/hooks/useEscalation';
import { EscalationHistory, EscalationFilters } from '@/types/escalation';
import { format } from 'date-fns';

const EscalationHistoryComponent: React.FC = () => {
  const { escalationHistory, loadEscalationHistory, resolveEscalation, loading } = useEscalation();
  const [selectedEscalation, setSelectedEscalation] = useState<EscalationHistory | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [filters, setFilters] = useState<EscalationFilters>({});
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    loadEscalationHistory(filters);
  }, [filters, loadEscalationHistory]);

  const getEscalationLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-yellow-100 text-yellow-800';
      case 3: return 'bg-orange-100 text-orange-800';
      case 4: return 'bg-red-100 text-red-800';
      case 5: return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (resolvedAt?: string) => {
    return resolvedAt ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getStatusIcon = (resolvedAt?: string) => {
    return resolvedAt ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />;
  };

  const handleViewDetails = (escalation: EscalationHistory) => {
    setSelectedEscalation(escalation);
    setIsDetailDialogOpen(true);
  };

  const handleResolveEscalation = async () => {
    if (!selectedEscalation) return;

    try {
      await resolveEscalation({
        escalationHistoryId: selectedEscalation.id,
        resolutionNotes: resolutionNotes,
        newStatus: 'resolved'
      });
      
      setIsResolveDialogOpen(false);
      setResolutionNotes('');
      setSelectedEscalation(null);
      
      // Refresh the list
      loadEscalationHistory(filters);
    } catch (error) {
      console.error('Error resolving escalation:', error);
    }
  };

  const handleFilterChange = (key: keyof EscalationFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (loading.history) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Escalation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="space-y-2">
              {Array(5).fill(null).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Escalation History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="status-filter">Status</Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => handleFilterChange('status', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="level-filter">Escalation Level</Label>
                <Select
                  value={filters.escalationLevel?.toString() || ''}
                  onValueChange={(value) => handleFilterChange('escalationLevel', value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All levels</SelectItem>
                    <SelectItem value="1">Level 1</SelectItem>
                    <SelectItem value="2">Level 2</SelectItem>
                    <SelectItem value="3">Level 3</SelectItem>
                    <SelectItem value="4">Level 4</SelectItem>
                    <SelectItem value="5">Level 5</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date-from">From Date</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value || undefined)}
                />
              </div>
              
              <div>
                <Label htmlFor="date-to">To Date</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Table */}
          {escalationHistory.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No escalation history found</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Case ID</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Escalated To</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {escalationHistory.map((escalation) => (
                    <TableRow key={escalation.id}>
                      <TableCell className="font-mono text-sm">
                        {escalation.caseId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <Badge className={getEscalationLevelColor(escalation.escalationLevel)}>
                          Level {escalation.escalationLevel}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {escalation.reason}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(escalation.resolvedAt)}
                          <Badge className={getStatusColor(escalation.resolvedAt)}>
                            {escalation.resolvedAt ? 'Resolved' : 'Active'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="text-sm">
                            {escalation.escalatedToRole || 'Unassigned'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">
                            {format(new Date(escalation.escalationDate), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(escalation)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!escalation.resolvedAt && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedEscalation(escalation);
                                setIsResolveDialogOpen(true);
                              }}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Escalation Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5" />
              Escalation Details
            </DialogTitle>
            <DialogDescription>
              Detailed information about the escalation
            </DialogDescription>
          </DialogHeader>
          
          {selectedEscalation && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Case ID</label>
                  <p className="text-sm font-mono">{selectedEscalation.caseId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Escalation Level</label>
                  <Badge className={getEscalationLevelColor(selectedEscalation.escalationLevel)}>
                    Level {selectedEscalation.escalationLevel}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedEscalation.resolvedAt)}
                    <Badge className={getStatusColor(selectedEscalation.resolvedAt)}>
                      {selectedEscalation.resolvedAt ? 'Resolved' : 'Active'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Escalated To</label>
                  <p className="text-sm">{selectedEscalation.escalatedToRole || 'Unassigned'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Previous Priority</label>
                  <p className="text-sm">{selectedEscalation.previousPriority || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">New Priority</label>
                  <p className="text-sm">{selectedEscalation.newPriority || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Reason</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm">{selectedEscalation.reason}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Escalation Date</label>
                  <p className="text-sm">
                    {format(new Date(selectedEscalation.escalationDate), 'MMM dd, yyyy HH:mm:ss')}
                  </p>
                </div>
                {selectedEscalation.resolvedAt && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Resolved Date</label>
                    <p className="text-sm">
                      {format(new Date(selectedEscalation.resolvedAt), 'MMM dd, yyyy HH:mm:ss')}
                    </p>
                  </div>
                )}
              </div>
              
              {selectedEscalation.resolutionNotes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Resolution Notes</label>
                  <div className="mt-1 p-3 bg-green-50 rounded-md">
                    <p className="text-sm">{selectedEscalation.resolutionNotes}</p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Escalation Dialog */}
      <Dialog open={isResolveDialogOpen} onOpenChange={setIsResolveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Escalation</DialogTitle>
            <DialogDescription>
              Add resolution notes and mark this escalation as resolved
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="resolution-notes">Resolution Notes</Label>
              <Textarea
                id="resolution-notes"
                placeholder="Enter resolution details..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsResolveDialogOpen(false);
                  setResolutionNotes('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleResolveEscalation}>
                Resolve Escalation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EscalationHistoryComponent;
