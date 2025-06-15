
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Download } from 'lucide-react';
import AddUserDialog from './AddUserDialog';
import { User } from '@/types';

interface UserSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddUser: (user: Omit<User, 'id'>) => void;
}

const UserSearch: React.FC<UserSearchProps> = ({ 
  searchTerm, 
  onSearchChange, 
  onAddUser 
}) => {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search users..."
          className="pl-8 w-full sm:w-[300px]"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
        <AddUserDialog onAddUser={onAddUser} />
      </div>
    </div>
  );
};

export default UserSearch;
