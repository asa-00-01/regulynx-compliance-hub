import React from 'react';
import { Button } from '@/components/ui/button';
import { Edit, Trash } from 'lucide-react';
import { User } from '@/types';
import { getRoleBadgeClass, formatRoleDisplay } from './userUtils';

interface UsersTableProps {
  users: User[];
  onDeleteUser: (id: string) => void;
  onEditUser: (user: User) => void;
}

const UsersTable: React.FC<UsersTableProps> = ({ users, onDeleteUser, onEditUser }) => {
  return (
    <div className="rounded-md border">
      <div className="grid grid-cols-5 p-3 bg-muted/50 text-xs font-medium">
        <div>User</div>
        <div>Email</div>
        <div>Role</div>
        <div>Status</div>
        <div className="text-right">Actions</div>
      </div>
      <div className="divide-y">
        {users.length > 0 ? (
          users.map((user) => (
            <div key={user.id} className="grid grid-cols-5 p-3 items-center">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt={user.name}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <span>{user.name.substring(0, 1).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium">{user.name}</div>
                </div>
              </div>
              <div className="text-sm">{user.email}</div>
              <div>
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeClass(user.role)}`}
                >
                  {formatRoleDisplay(user.role)}
                </span>
              </div>
              <div>
                <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => onEditUser(user)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDeleteUser(user.id)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center">
            <p className="text-muted-foreground">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersTable;
