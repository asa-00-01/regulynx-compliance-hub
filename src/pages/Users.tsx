
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User, UserRole } from '@/context/AuthContext';
import { Search, Plus, Edit, Trash, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Mock users for admin page
const mockUsers: User[] = [
  {
    id: '1',
    email: 'compliance@regulynx.com',
    role: 'complianceOfficer',
    name: 'Alex Nordström',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    riskScore: 0,
    status: 'verified',
  },
  {
    id: '2',
    email: 'admin@regulynx.com',
    role: 'admin',
    name: 'Johan Berg',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    riskScore: 0,
    status: 'verified',
  },
  {
    id: '3',
    email: 'executive@regulynx.com',
    role: 'executive',
    name: 'Lena Wikström',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    riskScore: 0,
    status: 'verified',
  },
  {
    id: '4',
    email: 'support@regulynx.com',
    role: 'support',
    name: 'Astrid Lindqvist',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    riskScore: 0,
    status: 'verified',
  },
  {
    id: '5',
    email: 'compliance2@regulynx.com',
    role: 'complianceOfficer',
    name: 'Erik Karlsson',
    riskScore: 0,
    status: 'verified',
  },
  {
    id: '6',
    email: 'support2@regulynx.com',
    role: 'support',
    name: 'Maria Andersson',
    riskScore: 0,
    status: 'verified',
  },
];

const Users = () => {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'support' as UserRole,
  });
  const { toast } = useToast();

  const handleAddUser = () => {
    const user: User = {
      id: (users.length + 1).toString(),
      ...newUser,
      riskScore: 0,
      status: 'verified',
    };
    
    setUsers([...users, user]);
    setNewUser({
      name: '',
      email: '',
      role: 'support',
    });
    setIsAddUserDialogOpen(false);
    
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

  const filteredUsers = searchTerm
    ? users.filter(
        user =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.role.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'complianceOfficer':
        return 'bg-blue-100 text-blue-800';
      case 'executive':
        return 'bg-green-100 text-green-800';
      case 'support':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout requiredRoles={['admin']}>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users and their access permissions
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="pl-8 w-full sm:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New User</DialogTitle>
                  <DialogDescription>
                    Create a new user account and assign permissions.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <select
                      id="role"
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                    >
                      <option value="support">Support Agent</option>
                      <option value="complianceOfficer">Compliance Officer</option>
                      <option value="executive">Executive</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddUser}>Add User</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>
              Manage and monitor all user accounts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-3 bg-muted/50 text-xs font-medium">
                <div>User</div>
                <div>Email</div>
                <div>Role</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="divide-y">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
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
                          {user.role === 'complianceOfficer' 
                            ? 'Compliance Officer' 
                            : user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleUserDelete(user.id)}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>
              Record of user actions and system events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <div className="grid grid-cols-4 p-3 bg-muted/50 text-xs font-medium">
                <div>Date & Time</div>
                <div>User</div>
                <div>Action</div>
                <div>Details</div>
              </div>
              <div className="divide-y">
                {[
                  {
                    date: '2025-05-04T10:15:22Z',
                    user: 'Johan Berg',
                    action: 'User Created',
                    details: 'Created user account for Maria Andersson',
                  },
                  {
                    date: '2025-05-03T16:42:51Z',
                    user: 'System',
                    action: 'Role Changed',
                    details: 'Erik Karlsson changed from Support to Compliance Officer',
                  },
                  {
                    date: '2025-05-03T14:20:10Z',
                    user: 'Johan Berg',
                    action: 'Login',
                    details: 'Successful login from 193.45.88.21',
                  },
                  {
                    date: '2025-05-03T09:16:33Z',
                    user: 'Alex Nordström',
                    action: 'Document Accessed',
                    details: 'Accessed customer KYC document #2824',
                  },
                  {
                    date: '2025-05-02T17:05:04Z',
                    user: 'Lena Wikström',
                    action: 'Report Generated',
                    details: 'Generated Monthly Compliance Report',
                  },
                ].map((log, index) => (
                  <div key={index} className="grid grid-cols-4 p-3 items-center">
                    <div className="text-sm">
                      {new Date(log.date).toLocaleString('en-SE')}
                    </div>
                    <div className="font-medium">{log.user}</div>
                    <div>{log.action}</div>
                    <div className="text-sm">{log.details}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Showing 5 of 243 entries
              </div>
              <Button variant="outline">View Full Audit Log</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Users;
