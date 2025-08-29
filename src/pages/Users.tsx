
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { mockUsers } from '@/components/users/mockUsersData';
import UserSearch from '@/components/users/UserSearch';
import UsersTable from '@/components/users/UsersTable';
import AuditLog from '@/components/users/AuditLog';
import EditUserDialog from '@/components/users/EditUserDialog';
import { useTranslation } from 'react-i18next';
import { config } from '@/config/environment';

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      try {
        if (config.features.useMockData) {
          setUsers(mockUsers);
        } else {
          console.log('🌐 Real user management data not implemented');
          setUsers([]);
        }
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, [config.features.useMockData]);

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
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-muted rounded animate-pulse" />
                    <div className="h-3 bg-muted rounded w-3/4 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {config.features.useMockData 
                  ? 'No users found' 
                  : 'User management data not available in production mode'
                }
              </p>
            </div>
          ) : (
            <UsersTable 
              users={filteredUsers}
              onDeleteUser={handleUserDelete}
              onEditUser={handleEditUser}
            />
          )}
        </CardContent>
      </Card>

      {config.features.useMockData && <AuditLog />}

      <EditUserDialog
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
};

export default Users;
