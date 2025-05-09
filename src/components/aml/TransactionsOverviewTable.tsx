
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Eye, Flag, FileText } from 'lucide-react';
import { AMLTransaction } from '@/types/aml';
import { Badge } from '@/components/ui/badge';
import RiskBadge from '@/components/common/RiskBadge';
import { useCompliance } from '@/context/ComplianceContext';
import { useNavigate } from 'react-router-dom';

interface TransactionsOverviewTableProps {
  transactions: AMLTransaction[];
  onViewDetails: (transaction: AMLTransaction) => void;
  onFlagTransaction: (transaction: AMLTransaction) => void;
  onCreateCase: (transaction: AMLTransaction) => void;
  showUserColumn?: boolean;
}

const TransactionsOverviewTable: React.FC<TransactionsOverviewTableProps> = ({ 
  transactions, 
  onViewDetails, 
  onFlagTransaction,
  onCreateCase,
  showUserColumn = true
}) => {
  const navigate = useNavigate();
  const { setSelectedUser } = useCompliance();
  
  const handleUserClick = (userId: string) => {
    setSelectedUser(userId);
    navigate(`/user-case/${userId}`);
  };
  
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Transaction ID</TableHead>
            {showUserColumn && <TableHead>Sender</TableHead>}
            <TableHead>Amount</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Risk Score</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showUserColumn ? 8 : 7} className="text-center h-24">
                No transactions found with the current filters.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map(transaction => (
              <TableRow 
                key={transaction.id}
                className={transaction.isSuspect ? "bg-red-50/30" : undefined}
              >
                <TableCell className="font-medium">
                  {transaction.id.substring(0, 8)}...
                </TableCell>
                
                {showUserColumn && (
                  <TableCell>
                    <Button
                      variant="link"
                      className="h-auto p-0"
                      onClick={() => handleUserClick(transaction.senderUserId)}
                    >
                      {transaction.senderName}
                    </Button>
                  </TableCell>
                )}
                
                <TableCell>
                  {transaction.senderAmount} {transaction.senderCurrency}
                </TableCell>
                
                <TableCell>
                  {transaction.receiverCountryCode}
                </TableCell>
                
                <TableCell>
                  {new Date(transaction.timestamp).toLocaleDateString()}
                </TableCell>
                
                <TableCell>
                  <Badge
                    variant={
                      transaction.status === 'completed'
                        ? 'default'
                        : transaction.status === 'flagged'
                        ? 'destructive'
                        : transaction.status === 'failed'
                        ? 'secondary'
                        : 'outline'
                    }
                  >
                    {transaction.status}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <RiskBadge score={transaction.riskScore} />
                </TableCell>
                
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewDetails(transaction)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    
                    <Button 
                      variant={transaction.isSuspect ? "default" : "outline"} 
                      size="sm"
                      onClick={() => onFlagTransaction(transaction)}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      {transaction.isSuspect ? 'Flagged' : 'Flag'}
                    </Button>
                    
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => onCreateCase(transaction)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Case
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionsOverviewTable;
