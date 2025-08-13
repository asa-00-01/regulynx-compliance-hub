
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Shield, Users } from 'lucide-react';
import { PlatformRole } from '@/types/platform-roles';
import { useToast } from '@/hooks/use-toast';
import AddPlatformUserDialog from './AddPlatformUserDialog';
import EditPlatformUserDialog from './EditPlatformUserDialog';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  status: 'active' | 'inactive';
}

const PlatformUserManagement: React.FC = () => {
  const [users, setUsers] = useState<PlatformUser[]>([
    { id: '1', name: 'John Admin', email: 'john@platform.com', role: 'platform_admin', status: 'active' },
    { id: '2', name: 'Sarah Support', email: 'sarah@platform.com', role: 'platform_support', status: 'active' },
    { id: '3', name: 'Mike Manager', email: 'mike@platform.com', role: 'platform_admin', status: 'inactive' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const { toast } = useToast();

  const handleAddUser = async (userData: { name: string; email: string; role: PlatformRole }) => {
    // In a real app, this would make an API call
    const newUser: PlatformUser = {
      id: (users.length + 1).toString(),
      ...userData,
      status: 'active',
    };
    
    setUsers([...users, newUser]);
  };

  const handleUpdateUser = async (updatedUser: PlatformUser) => {
    // In a real app, this would make an API call
    setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
    setEditingUser(null);
  };

  const handleEditUser = (user: PlatformUser) => {
    setEditingUser(user);
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
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Platform User Management</h1>
          <p className="text-muted-foreground">
            Manage platform administrators and support staff
          </p>
        </div>
        <AddPlatformUserDialog onAddUser={handleAddUser} />
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search users..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Button variant="outline">Filter by Role</Button>
          </div>
        </CardContent>
      </Card>

      {/* Platform Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Platform Users
          </CardTitle>
          <CardDescription>Users with platform-level access and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={user.role === 'platform_admin' ? 'default' : 'secondary'}>
                    {user.role.replace('_', ' ')}
                  </Badge>
                  <Badge variant={user.status === 'active' ? 'secondary' : 'outline'}>
                    {user.status}
                  </Badge>
                  <Button variant="outline" size="sm" onClick={() => handleEditUser(user)}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Customer User Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Customer User Overview
          </CardTitle>
          <CardDescription>Aggregate view of users across all customer organizations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">1,234</div>
              <div className="text-sm text-muted-foreground">Total Customer Users</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">45</div>
              <div className="text-sm text-muted-foreground">Customer Admins</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">89</div>
              <div className="text-sm text-muted-foreground">Compliance Officers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <EditPlatformUserDialog
        user={editingUser}
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        onUpdateUser={handleUpdateUser}
      />
    </div>
  );
};

export default PlatformUserManagement;
