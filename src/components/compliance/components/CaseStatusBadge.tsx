
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface CaseStatusBadgeProps {
  status: string;
}

const CaseStatusBadge: React.FC<CaseStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'open':
      return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Open</Badge>;
    case 'under-review':
      return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Under Review</Badge>;
    case 'closed':
      return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Closed</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default CaseStatusBadge;
