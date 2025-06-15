
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import CaseStatusBadge from './CaseStatusBadge';
import CaseTypeIcon from './CaseTypeIcon';

interface CaseItem {
  id: string;
  userId: string;
  userName: string;
  type: string;
  status: string;
  riskScore: number;
  createdAt: string;
  description: string;
  assignedTo: string;
}

interface CasesTableProps {
  cases: CaseItem[];
  onCaseClick: (caseItem: CaseItem) => void;
}

const CasesTable: React.FC<CasesTableProps> = ({ cases, onCaseClick }) => {
  return (
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
          {cases.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">No cases found</TableCell>
            </TableRow>
          ) : (
            cases.map((caseItem) => (
              <TableRow 
                key={caseItem.id}
                onClick={() => onCaseClick(caseItem)}
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
                    <CaseTypeIcon type={caseItem.type} />
                    <span className="ml-2 capitalize">{caseItem.type}</span>
                  </div>
                </TableCell>
                <TableCell>{caseItem.userName}</TableCell>
                <TableCell><CaseStatusBadge status={caseItem.status} /></TableCell>
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
  );
};

export default CasesTable;
