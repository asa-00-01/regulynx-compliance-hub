
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Plus, Shield, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { SupabasePlatformRoleService } from '@/services/supabasePlatformRoleService';
import { ExtendedUserProfile, PlatformRole } from '@/types/platform-roles';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const PlatformUserManagement: React.FC = () => {
  const { toast } = useToast();

  const [allUsers, setAllUsers] = useState<ExtendedUserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'all' | PlatformRole>('all');

  const [addOpen, setAddOpen] = useState<boolean>(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [assignRole, setAssignRole] = useState<PlatformRole>('platform_support');

  const [editUser, setEditUser] = useState<ExtendedUserProfile | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      const users = await SupabasePlatformRoleService.getPlatformUsers();
      setAllUsers(users);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: 'Failed to load platform users', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allUsers.filter((u) => {
      const matchesQuery = !query || [u.name, u.email].some((v) => v?.toLowerCase().includes(query));
      const matchesRole = roleFilter === 'all' || u.platform_roles?.includes(roleFilter);
      return matchesQuery && matchesRole;
    });
  }, [allUsers, searchQuery, roleFilter]);

  const handleAddPlatformUser = async () => {
    try {
      if (!inviteEmail) {
        toast({ title: 'Email required', description: 'Please enter an email address', variant: 'destructive' });
        return;
      }
      setLoading(true);
      // Invite or assign role if the user exists
      await SupabasePlatformRoleService.inviteOrAssignPlatformUser(inviteEmail, assignRole);
      await loadUsers();
      setAddOpen(false);
      setInviteEmail('');
      setAssignRole('platform_support');
      toast({ title: 'User added', description: 'Platform role assigned successfully' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: 'Failed to add user', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    try {
      setLoading(true);
      const selectedRole = editUser.platform_roles?.[0] || 'platform_support';
      const existingRoles = await SupabasePlatformRoleService.getUserPlatformRoles(editUser.id);
      // Remove other roles
      await Promise.all(
        existingRoles
          .filter((r) => r !== selectedRole)
          .map((r) => SupabasePlatformRoleService.removePlatformRole(editUser.id, r))
      );
      // Ensure selected role is assigned
      await SupabasePlatformRoleService.assignPlatformRole(editUser.id, selectedRole);
      await loadUsers();
      setEditUser(null);
      toast({ title: 'Changes saved', description: 'Platform role updated successfully' });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast({ title: 'Failed to save changes', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const mapStatusToBadgeVariant = (status?: string) => {
    switch (status) {
      case 'verified':
        return 'secondary' as const;
      case 'pending':
        return 'outline' as const;
      case 'rejected':
      case 'information_requested':
        return 'destructive' as const;
      default:
        return 'outline' as const;
    }
  };

  return (
    <>
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Platform User Management</h1>
          <p className="text-muted-foreground">
            Manage platform administrators and support staff
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Platform User
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as PlatformRole | 'all')}>
              <SelectTrigger className="w-[180px]"><SelectValue placeholder="Filter by Role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All roles</SelectItem>
                <SelectItem value="platform_admin">Platform Admin</SelectItem>
                <SelectItem value="platform_support">Platform Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

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
            {filteredUsers.length === 0 && (
              <div className="text-sm text-muted-foreground">No platform users found</div>
            )}
            {filteredUsers.map((user) => {
              const role = user.platform_roles?.[0] || 'platform_support';
              const statusText = user.status || 'pending';
              return (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      {user.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="font-medium">{user.name || 'Unknown User'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={role === 'platform_admin' ? 'default' : 'secondary'}>
                      {role.replace('_', ' ')}
                    </Badge>
                    <Badge variant={mapStatusToBadgeVariant(statusText)}>
                      {statusText}
                    </Badge>
                    <Button variant="outline" size="sm" onClick={() => setEditUser(user)}>Edit</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
    </div>
    
    <Dialog open={addOpen} onOpenChange={setAddOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Platform User</DialogTitle>
          <DialogDescription>Invite an existing profile by email and assign a platform role.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="user@company.com" />
          </div>
          <div className="grid gap-2">
            <Label>Platform Role</Label>
            <Select value={assignRole} onValueChange={(v) => setAssignRole(v as PlatformRole)}>
              <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="platform_support">Platform Support</SelectItem>
                <SelectItem value="platform_admin">Platform Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button onClick={handleAddPlatformUser} disabled={loading}>Add User</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Platform User</DialogTitle>
          <DialogDescription>Change the user's platform role.</DialogDescription>
        </DialogHeader>
        {editUser && (
          <div className="grid gap-4 py-4">
            <div className="grid gap-1">
              <div className="text-sm">{editUser.name}</div>
              <div className="text-xs text-muted-foreground">{editUser.email}</div>
            </div>
            <div className="grid gap-2">
              <Label>Platform Role</Label>
              <Select value={editUser.platform_roles?.[0] ?? 'platform_support'} onValueChange={(v) => setEditUser({ ...editUser, platform_roles: [v as PlatformRole] })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="platform_support">Platform Support</SelectItem>
                  <SelectItem value="platform_admin">Platform Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setEditUser(null)}>Cancel</Button>
          <Button onClick={handleEditSave} disabled={loading || !editUser}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default PlatformUserManagement;
