
import React from 'react';
import { Button } from '@/components/ui/button';
import { Search, UserCheck, FileText, Flag } from 'lucide-react';
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
import { LoadingState } from './types/complianceActionsTypes';

interface QuickActionsGridProps {
  user: any;
  loading: LoadingState;
  onViewTransactions: () => void;
  onKYCReview: () => void;
  onDocumentReview: () => void;
  onFlagUser: () => void;
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  user,
  loading,
  onViewTransactions,
  onKYCReview,
  onDocumentReview,
  onFlagUser
}) => {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onViewTransactions}
        disabled={loading === 'transactions'}
        className="flex items-center gap-2"
      >
        <Search className="h-4 w-4" />
        View Transactions
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onKYCReview}
        disabled={loading === 'kyc'}
        className="flex items-center gap-2"
      >
        <UserCheck className="h-4 w-4" />
        KYC Review
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={onDocumentReview}
        disabled={loading === 'documents'}
        className="flex items-center gap-2"
      >
        <FileText className="h-4 w-4" />
        Review Documents
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2 text-red-600 hover:text-red-700"
          >
            <Flag className="h-4 w-4" />
            Flag User
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flag User for Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to flag {user.fullName} for compliance review? 
              This will mark the user as requiring immediate attention.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onFlagUser}
              className="bg-red-600 hover:bg-red-700"
            >
              Flag User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuickActionsGrid;
