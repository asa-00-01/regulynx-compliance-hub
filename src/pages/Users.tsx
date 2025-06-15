
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
import { useTranslation } from 'react-i18next';

const Users = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const user: User = {
      id: (users.length + 1).toString(),
      ...userData,
    };
    
    setUsers([...users, user]);
    
    toast({
      title: t('users.toast.userAddedTitle'),
      description: t('users.toast.userAddedDescription', { name: user.name }),
    });
  };

  const handleUserDelete = (id: string) => {
    const userToDelete = users.find(user => user.id === id);
    if (!userToDelete) return;
    
    setUsers(users.filter(user => user.id !== id));
    
    toast({
      title: t('users.toast.userDeletedTitle'),
      description: t('users.toast.userDeletedDescription', { name: userToDelete.name }),
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = (updatedUser: User) => {
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    setEditingUser(null);
    toast({
      title: t('users.toast.userUpdatedTitle'),
      description: t('users.toast.userUpdatedDescription', { name: updatedUser.name }),
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
          <h1 className="text-3xl font-bold tracking-tight">{t('users.title')}</h1>
          <p className="text-muted-foreground">
            {t('users.description')}
          </p>
        </div>

        <UserSearch 
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onAddUser={handleAddUser}
        />

        <Card>
          <CardHeader>
            <CardTitle>{t('users.userListTitle')}</CardTitle>
            <CardDescription>
              {t('users.userListDescription')}
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
