
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Customer, ExtendedUserProfile } from '@/types/platform-roles';
import { SupabasePlatformRoleService } from '@/services/supabasePlatformRoleService';
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, UserX, Shield, Mail, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface CustomerUsersDialogProps {
  customer: Customer;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerUsersDialog({ customer, open, onOpenChange }: CustomerUsersDialogProps) {
  const [users, setUsers] = useState<ExtendedUserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (open && customer.id) {
      loadUsers();
    }
  }, [open, customer.id]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const customerUsers = await SupabasePlatformRoleService.getCustomerUsers(customer.id);
      setUsers(customerUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load customer users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (roles: string[]) => {
    if (roles.includes('admin')) return 'bg-red-100 text-red-800';
    if (roles.includes('manager')) return 'bg-blue-100 text-blue-800';
    if (roles.includes('analyst')) return 'bg-green-100 text-green-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInviteUser = () => {
    toast({
      title: "Feature Coming Soon",
      description: "User invitation functionality will be available soon",
    });
  };

  const handleRemoveUser = (userId: string) => {
    toast({
      title: "Feature Coming Soon",
      description: "User removal functionality will be available soon",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Manage Users: {customer.name}
          </DialogTitle>
          <DialogDescription>
            View and manage users for this customer organization
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 space-y-4 overflow-hidden">
          {/* Header Actions */}
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleInviteUser}>
              <Plus className="mr-2 h-4 w-4" />
              Invite User
            </Button>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto border rounded-lg">
            {loading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-6 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No users found matching your search' : 'No users found for this customer'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 hover:bg-muted/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt={user.name || 'User'}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-sm font-medium">
                              {(user.name || user.email || 'U').substring(0, 1).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{user.name || 'Unnamed User'}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Calendar className="h-3 w-3" />
                            Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-1">
                          {user.customer_roles && user.customer_roles.length > 0 && (
                            <div className="flex gap-1">
                              {user.customer_roles.map((role) => (
                                <Badge
                                  key={role}
                                  variant="secondary"
                                  className={`text-xs ${getRoleBadgeColor(user.customer_roles)}`}
                                >
                                  {role}
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Badge
                            variant="secondary"
                            className={`text-xs ${getStatusBadgeColor(user.status)}`}
                          >
                            {user.status}
                          </Badge>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>Total Users: {users.length}</span>
              <span>Active Users: {users.filter(u => u.status === 'verified').length}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
