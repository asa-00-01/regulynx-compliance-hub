
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AMLTransaction } from '@/types/aml';
import { Flag, FileText } from 'lucide-react';
import TransactionBasicInfo from './TransactionBasicInfo';
import TransactionParties from './TransactionParties';
import TransactionCountries from './TransactionCountries';
import TransactionRiskAssessment from './TransactionRiskAssessment';

interface TransactionDetailsModalProps {
  transaction: AMLTransaction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFlag: (transaction: AMLTransaction) => void;
  onCreateCase: (transaction: AMLTransaction) => void;
}

const TransactionDetailsModal = ({
  transaction,
  open,
  onOpenChange,
  onFlag,
  onCreateCase,
}: TransactionDetailsModalProps) => {
  if (!transaction) return null;

  const handleClose = () => {
    console.log('Manual close handler called');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Transaction Details
            {transaction.status === 'flagged' && (
              <Badge variant="destructive" className="ml-2">
                Flagged
              </Badge>
            )}
            {transaction.isSuspect && (
              <Badge variant="warning" className="ml-2">
                Suspect
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Transaction ID: <span className="font-mono">{transaction.id}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TransactionBasicInfo transaction={transaction} />
            <TransactionParties transaction={transaction} />
          </div>

          <TransactionCountries transaction={transaction} />
          <TransactionRiskAssessment transaction={transaction} />

          <div className="flex justify-end space-x-2 mt-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex items-center gap-2"
            >
              Close
            </Button>
            <Button
              variant="outline"
              onClick={() => onFlag(transaction)}
              className="flex items-center gap-2"
            >
              <Flag size={16} />
              Flag Transaction
            </Button>
            <Button
              variant="default"
              onClick={() => onCreateCase(transaction)}
              className="flex items-center gap-2"
            >
              <FileText size={16} />
              Create Case
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDetailsModal;
