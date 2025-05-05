
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Flag, Eye, FilePenLine, Shield, Clock, AlertTriangle, Upload } from 'lucide-react';

// Mock compliance case data
const initialCases = [
  {
    id: '1',
    userId: '101',
    userName: 'John Doe',
    type: 'kyc',
    status: 'open',
    riskScore: 75,
    createdAt: '2025-05-01T08:30:00Z',
    description: 'Inconsistent identity information across documents',
    assignedTo: 'Alex Nordström',
    history: [
      {
        date: '2025-05-01T08:30:00Z',
        action: 'Case created',
        by: 'System'
      },
      {
        date: '2025-05-01T09:45:00Z',
        action: 'Assigned to compliance officer',
        by: 'System'
      }
    ]
  },
  {
    id: '2',
    userId: '105',
    userName: 'Sofia Rodriguez',
    type: 'aml',
    status: 'under-review',
    riskScore: 92,
    createdAt: '2025-05-02T10:15:00Z',
    description: 'Multiple high-value transactions from high-risk jurisdiction',
    assignedTo: 'Johan Berg',
    history: [
      {
        date: '2025-05-02T10:15:00Z',
        action: 'Case created',
        by: 'System'
      },
      {
        date: '2025-05-02T11:30:00Z',
        action: 'Escalated to senior compliance',
        by: 'Johan Berg'
      },
      {
        date: '2025-05-02T14:00:00Z',
        action: 'Status changed to Under Review',
        by: 'Johan Berg'
      }
    ]
  },
  {
    id: '3',
    userId: '107',
    userName: 'Alexander Petrov',
    type: 'sanctions',
    status: 'open',
    riskScore: 85,
    createdAt: '2025-05-02T14:45:00Z',
    description: 'Potential sanctions list match (86% confidence)',
    assignedTo: 'Alex Nordström',
    history: [
      {
        date: '2025-05-02T14:45:00Z',
        action: 'Case created',
        by: 'System'
      },
      {
        date: '2025-05-02T15:20:00Z',
        action: 'Additional verification requested',
        by: 'Alex Nordström'
      }
    ]
  },
  {
    id: '4',
    userId: '110',
    userName: 'Jane Smith',
    type: 'kyc',
    status: 'closed',
    riskScore: 45,
    createdAt: '2025-05-03T09:10:00Z',
    description: 'Address verification failed initial check',
    assignedTo: 'Alex Nordström',
    history: [
      {
        date: '2025-05-03T09:10:00Z',
        action: 'Case created',
        by: 'System'
      },
      {
        date: '2025-05-03T11:30:00Z',
        action: 'Additional proof of address requested',
        by: 'Alex Nordström'
      },
      {
        date: '2025-05-03T15:45:00Z',
        action: 'Customer provided updated documents',
        by: 'System'
      },
      {
        date: '2025-05-03T16:20:00Z',
        action: 'Case resolved - Address verified',
        by: 'Alex Nordström'
      }
    ]
  }
];

// Mock compliance officers
const complianceOfficers = [
  { id: '1', name: 'Alex Nordström' },
  { id: '2', name: 'Johan Berg' },
  { id: '3', name: 'Lena Wikström' }
];

const ComplianceCaseManagement = () => {
  const [cases, setCases] = useState(initialCases);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [newNote, setNewNote] = useState('');
  const [uploadedEvidence, setUploadedEvidence] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Filter cases based on status
  const filteredCases = statusFilter === 'all' 
    ? cases 
    : cases.filter(c => c.status === statusFilter);

  // Handle case selection
  const handleCaseClick = (caseItem: any) => {
    setSelectedCase(caseItem);
  };

  // Handle adding a note
  const handleAddNote = () => {
    if (!newNote || !selectedCase) return;

    const updatedCase = {
      ...selectedCase,
      history: [
        ...selectedCase.history,
        {
          date: new Date().toISOString(),
          action: `Note added: ${newNote}`,
          by: 'Alex Nordström' // Current user mock
        }
      ]
    };

    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    setSelectedCase(updatedCase);
    setNewNote('');

    toast({
      title: "Note added",
      description: "Your note has been added to the case"
    });
  };

  // Handle upload evidence
  const handleEvidenceUpload = () => {
    // Mock file upload - in a real app this would handle actual file upload
    setUploadedEvidence("evidence_file.pdf");
    
    if (selectedCase) {
      const updatedCase = {
        ...selectedCase,
        history: [
          ...selectedCase.history,
          {
            date: new Date().toISOString(),
            action: `Supporting evidence uploaded: evidence_file.pdf`,
            by: 'Alex Nordström' // Current user mock
          }
        ]
      };

      setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
      setSelectedCase(updatedCase);
      
      toast({
        title: "Evidence uploaded",
        description: "Your file has been uploaded and attached to the case"
      });
    }
  };

  // Handle changing case status
  const handleStatusChange = (newStatus: string) => {
    if (!selectedCase) return;

    const updatedCase = {
      ...selectedCase,
      status: newStatus,
      history: [
        ...selectedCase.history,
        {
          date: new Date().toISOString(),
          action: `Status changed to ${newStatus.replace('-', ' ')}`,
          by: 'Alex Nordström' // Current user mock
        }
      ]
    };

    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    setSelectedCase(updatedCase);
    setDialogOpen(false);

    toast({
      title: "Status updated",
      description: `Case status has been updated to ${newStatus.replace('-', ' ')}`
    });
  };

  // Handle assigning case
  const handleAssignCase = (officerId: string) => {
    if (!selectedCase) return;
    
    const officer = complianceOfficers.find(o => o.id === officerId);
    if (!officer) return;

    const updatedCase = {
      ...selectedCase,
      assignedTo: officer.name,
      history: [
        ...selectedCase.history,
        {
          date: new Date().toISOString(),
          action: `Case assigned to ${officer.name}`,
          by: 'Alex Nordström' // Current user mock
        }
      ]
    };

    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    setSelectedCase(updatedCase);

    toast({
      title: "Case assigned",
      description: `Case has been assigned to ${officer.name}`
    });
  };

  // Helper function to get status badge color
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Open</Badge>;
      case 'under-review':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Under Review</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Helper function to get case type icon
  const getCaseTypeIcon = (type: string) => {
    switch (type) {
      case 'kyc':
        return <FilePenLine className="h-4 w-4 text-blue-500" />;
      case 'aml':
        return <Flag className="h-4 w-4 text-red-500" />;
      case 'sanctions':
        return <Shield className="h-4 w-4 text-orange-500" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Compliance Cases</CardTitle>
          <CardDescription>
            Manage and track compliance cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cases</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under-review">Under Review</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cases Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-center">Risk Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">No cases found</TableCell>
                  </TableRow>
                ) : (
                  filteredCases.map((caseItem) => (
                    <TableRow 
                      key={caseItem.id}
                      onClick={() => handleCaseClick(caseItem)}
                      className="cursor-pointer hover:bg-gray-50"
                    >
                      <TableCell>
                        <div className="font-medium">#{caseItem.id}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {caseItem.description}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getCaseTypeIcon(caseItem.type)}
                          <span className="ml-2 capitalize">{caseItem.type}</span>
                        </div>
                      </TableCell>
                      <TableCell>{caseItem.userName}</TableCell>
                      <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
                      <TableCell>{new Date(caseItem.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                            caseItem.riskScore > 70
                              ? "bg-red-100 text-red-800"
                              : caseItem.riskScore > 30
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {caseItem.riskScore}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Selected Case Details */}
      {selectedCase && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  Case #{selectedCase.id} - {selectedCase.userName}
                </CardTitle>
                <CardDescription>
                  {new Date(selectedCase.createdAt).toLocaleString()} | Assigned to: {selectedCase.assignedTo}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(selectedCase.status)}
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    selectedCase.riskScore > 70
                      ? "bg-red-100 text-red-800"
                      : selectedCase.riskScore > 30
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  Risk: {selectedCase.riskScore}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm">{selectedCase.description}</p>
            </div>

            {/* Case History Timeline */}
            <div>
              <h3 className="text-sm font-medium mb-2">Case History</h3>
              <div className="space-y-3">
                {selectedCase.history.map((item: any, index: number) => (
                  <div key={index} className="flex">
                    <div className="mr-4 flex items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mt-1"></div>
                      <div className="h-full w-0.5 bg-gray-200 ml-1"></div>
                    </div>
                    <div className="pb-4">
                      <div className="text-sm">{item.action}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(item.date).toLocaleString()} by {item.by}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add Note Form */}
            <div>
              <h3 className="text-sm font-medium mb-2">Add Note</h3>
              <div className="flex space-x-2">
                <Textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Enter case note..."
                  className="flex-1"
                />
                <Button onClick={handleAddNote}>Add Note</Button>
              </div>
            </div>

            {/* Upload Evidence */}
            <div>
              <h3 className="text-sm font-medium mb-2">Upload Supporting Evidence</h3>
              <div className="flex items-center space-x-2">
                <Input type="file" className="flex-1" />
                <Button onClick={handleEvidenceUpload}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload
                </Button>
              </div>
              {uploadedEvidence && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Uploaded: {uploadedEvidence}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <Select onValueChange={handleAssignCase}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Assign to..." />
                </SelectTrigger>
                <SelectContent>
                  {complianceOfficers.map((officer) => (
                    <SelectItem key={officer.id} value={officer.id}>
                      {officer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex space-x-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>Change Status</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Update Case Status</DialogTitle>
                    <DialogDescription>
                      Select a new status for this case
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Select onValueChange={handleStatusChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select new status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="under-review">Under Review</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ComplianceCaseManagement;
