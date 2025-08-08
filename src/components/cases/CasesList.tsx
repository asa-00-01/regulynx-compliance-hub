
import React from 'react';
import { ComplianceCaseDetails } from '@/types/case';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { FileTextIcon, AlertTriangleIcon, ShieldIcon } from 'lucide-react';
import { format } from 'date-fns';
import CaseActionButtons from './CaseActionButtons';

interface CasesListProps {
  cases: ComplianceCaseDetails[];
  loading: boolean;
  onSelectCase: (caseItem: ComplianceCaseDetails) => void;
  onCaseUpdated?: () => void;
}

const CasesList: React.FC<CasesListProps> = ({ 
  cases, 
  loading, 
  onSelectCase, 
  onCaseUpdated 
}) => {
  const getCaseTypeIcon = (type: string) => {
    switch (type) {
      case 'kyc':
        return <FileTextIcon className="h-4 w-4 text-blue-500" />;
      case 'aml':
        return <AlertTriangleIcon className="h-4 w-4 text-red-500" />;
      case 'sanctions':
        return <ShieldIcon className="h-4 w-4 text-orange-500" />;
      default:
        return <FileTextIcon className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Open</Badge>;
      case 'under_review':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Under Review</Badge>;
      case 'escalated':
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Escalated</Badge>;
      case 'pending_info':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Pending Info</Badge>;
      case 'closed':
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <Badge className="bg-red-500">{priority}</Badge>;
      case 'high':
        return <Badge className="bg-orange-500">{priority}</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500">{priority}</Badge>;
      case 'low':
        return <Badge className="bg-green-500">{priority}</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy-MM-dd HH:mm');
  };

  if (loading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(null).map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                <TableCell><Skeleton className="h-6 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-8 w-32" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <div className="border rounded-md p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No cases found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or create a new case</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((caseItem) => (
            <TableRow key={caseItem.id}>
              <TableCell className="font-medium">{caseItem.id}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {getCaseTypeIcon(caseItem.type)}
                  <span className="capitalize">{caseItem.type}</span>
                </div>
              </TableCell>
              <TableCell>{caseItem.userName}</TableCell>
              <TableCell>{getStatusBadge(caseItem.status)}</TableCell>
              <TableCell>{getPriorityBadge(caseItem.priority)}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    caseItem.riskScore > 70
                      ? "bg-red-100 text-red-800"
                      : caseItem.riskScore > 40
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {caseItem.riskScore}
                </span>
              </TableCell>
              <TableCell>{formatDate(caseItem.createdAt)}</TableCell>
              <TableCell>
                <CaseActionButtons 
                  caseItem={caseItem} 
                  onCaseUpdated={onCaseUpdated}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CasesList;
