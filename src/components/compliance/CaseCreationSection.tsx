
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { CaseType, LoadingState } from './types/complianceActionsTypes';

interface CaseCreationSectionProps {
  loading: LoadingState;
  onCreateCase: (caseType: CaseType) => void;
}

const CaseCreationSection: React.FC<CaseCreationSectionProps> = ({
  loading,
  onCreateCase
}) => {
  return (
    <div className="border-t pt-4">
      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Create Compliance Case
      </h4>
      <div className="grid grid-cols-1 gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreateCase('aml')}
          disabled={loading === 'createCase'}
          className="justify-start"
        >
          AML Investigation Case
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreateCase('kyc')}
          disabled={loading === 'createCase'}
          className="justify-start"
        >
          KYC Compliance Case
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreateCase('sanctions')}
          disabled={loading === 'createCase'}
          className="justify-start"
        >
          Sanctions Screening Case
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onCreateCase('fraud')}
          disabled={loading === 'createCase'}
          className="justify-start"
        >
          Fraud Investigation Case
        </Button>
      </div>
    </div>
  );
};

export default CaseCreationSection;
