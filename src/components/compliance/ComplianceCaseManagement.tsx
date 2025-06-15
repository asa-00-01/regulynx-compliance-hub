
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import CasesTable from './components/CasesTable';
import CaseDetailsCard from './components/CaseDetailsCard';

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
  const [uploadedEvidence, setUploadedEvidence] = useState<string | null>(null);
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
  const handleAddNote = (note: string) => {
    if (!selectedCase) return;

    const updatedCase = {
      ...selectedCase,
      history: [
        ...selectedCase.history,
        {
          date: new Date().toISOString(),
          action: `Note added: ${note}`,
          by: 'Alex Nordström' // Current user mock
        }
      ]
    };

    setCases(prev => prev.map(c => c.id === updatedCase.id ? updatedCase : c));
    setSelectedCase(updatedCase);

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

          <CasesTable cases={filteredCases} onCaseClick={handleCaseClick} />
        </CardContent>
      </Card>

      {/* Selected Case Details */}
      {selectedCase && (
        <CaseDetailsCard
          selectedCase={selectedCase}
          complianceOfficers={complianceOfficers}
          onStatusChange={handleStatusChange}
          onAssignCase={handleAssignCase}
          onAddNote={handleAddNote}
          onUploadEvidence={handleEvidenceUpload}
          uploadedEvidence={uploadedEvidence}
        />
      )}
    </div>
  );
};

export default ComplianceCaseManagement;
