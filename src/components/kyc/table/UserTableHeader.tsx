
import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface UserTableHeaderProps {
  onSort: (field: string) => void;
  sortField: string;
  sortOrder: string;
}

const UserTableHeader: React.FC<UserTableHeaderProps> = ({
  onSort,
  sortField,
  sortOrder
}) => {
  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  return (
    <TableHeader>
      <TableRow>
        <TableHead 
          className="cursor-pointer select-none"
          onClick={() => onSort('name')}
        >
          <div className="flex items-center gap-2">
            User Information
            {getSortIcon('name')}
          </div>
        </TableHead>
        <TableHead>Contact Details</TableHead>
        <TableHead 
          className="cursor-pointer select-none"
          onClick={() => onSort('risk')}
        >
          <div className="flex items-center gap-2">
            Risk Assessment
            {getSortIcon('risk')}
          </div>
        </TableHead>
        <TableHead>Verification Status</TableHead>
        <TableHead>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );
};

export default UserTableHeader;
