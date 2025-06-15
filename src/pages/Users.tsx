import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { mockUsers } from '@/components/users/mockUsersData';
import UserSearch from '@/components/users/UserSearch';
import UsersTable from '@/components/users/UsersTable';
import AuditLog from '@/components/users/AuditLog';
import EditUserDialog from '@/components/users/EditUserDialog';

const Users = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const user: User = {
      id: (users.length + 1).toString(),
      ...userData,
    };
    
    setUsers([...users, user]);
    
    toast({
      title: 'User added',
      description: `${user.name} has been added successfully.`,
    });
  };

  const handleUserDelete = (id: string) => {
    const userToDelete = users.find(user => user.id === id);
    if (!userToDelete) return;
    
    setUsers(users.filter(user => user.id !== id));
    
    toast({
      title: 'User deleted',
      description: `${userToDelete.name} has been removed.`,
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    setEditingUser(null);
    toast({
      title: 'User updated',
      description: `${updatedUser.name}'s details have been updated.`,
    });
  };

  const filteredUsers = searchTerm
    ? users.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  return (
    <DashboardLayout requiredRoles={['admin']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and their access permissions
          </p>
        </div>

        <UserSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddUser={handleAddUser}
        />

        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>
              Manage and monitor all user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UsersTable 
              users={filteredUsers}
              onDeleteUser={handleUserDelete}
              onEditUser={handleEditUser}
            />
          </CardContent>
        </Card>

        <AuditLog />
      </div>

      <EditUserDialog
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onUpdateUser={handleUpdateUser}
      />
    </DashboardLayout>
  );
};

export default Users;
