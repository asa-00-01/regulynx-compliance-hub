
import React from 'react';
import { PatternMatch } from '@/types/sar';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

interface MatchesListProps {
  matches: PatternMatch[];
  onCreateAlert: (matchId: string) => void;
  onCreateSAR: (matchId: string) => void;
}

const MatchesList: React.FC<MatchesListProps> = ({ matches, onCreateAlert, onCreateSAR }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Matched Transactions</h3>
      {matches.length === 0 ? (
        <div className="text-center p-4 border rounded-md">
          No matching transactions found
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Timestamp</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {matches.map((match) => (
                <TableRow key={match.id}>
                  <TableCell className="font-medium">{match.userName}</TableCell>
                  <TableCell>{match.transactionId}</TableCell>
                  <TableCell>{match.country}</TableCell>
                  <TableCell>{formatCurrency(match.amount, match.currency)}</TableCell>
                  <TableCell>{format(new Date(match.timestamp), 'yyyy-MM-dd HH:mm')}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onCreateAlert(match.id)}>
                      Create Alert
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onCreateSAR(match.id)}>
                      Link to SAR
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default MatchesList;
