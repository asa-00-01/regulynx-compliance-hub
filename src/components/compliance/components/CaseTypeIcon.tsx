
import React from 'react';
import { FilePenLine, Flag, Shield, AlertTriangle } from 'lucide-react';

interface CaseTypeIconProps {
  type: string;
}

const CaseTypeIcon: React.FC<CaseTypeIconProps> = ({ type }) => {
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

export default CaseTypeIcon;
