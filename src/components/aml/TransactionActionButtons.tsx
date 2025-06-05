
import React from 'react';
import { Button } from '@/components/ui/button';
import { AMLTransaction } from '@/types/aml';
import { Flag, AlertTriangle, FileText, User } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TransactionActionButtonsProps {
  transaction: AMLTransaction;
  loading: string | null;
  onFlagTransaction: () => void;
  onCreateCase: () => void;
  onCreateSAR: () => void;
  onViewUserProfile: () => void;
}

const TransactionActionButtons: React.FC<TransactionActionButtonsProps> = ({
  transaction,
  loading,
  onFlagTransaction,
  onCreateCase,
  onCreateSAR,
  onViewUserProfile,
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Flag className="h-4 w-4" />
            Flag Transaction
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flag Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to flag this transaction as suspicious? 
              This will mark it for immediate compliance review.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onFlagTransaction}
              className="bg-red-600 hover:bg-red-700"
            >
              Flag Transaction
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Button
        variant="outline"
        size="sm"
        onClick={onCreateCase}
        disabled={loading === 'case'}
        className="flex items-center gap-2"
      >
        <AlertTriangle className="h-4 w-4" />
        Create Case
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onCreateSAR}
        disabled={loading === 'sar'}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Create SAR
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onViewUserProfile}
        disabled={loading === 'profile'}
        className="flex items-center gap-2"
      >
        <User className="h-4 w-4" />
        User Profile
      </Button>
    </div>
  );
};

export default TransactionActionButtons;
