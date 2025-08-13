
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { PlatformRole } from '@/types/platform-roles';
import { useToast } from '@/hooks/use-toast';

interface AddPlatformUserDialogProps {
  onAddUser: (userData: { name: string; email: string; role: PlatformRole }) => Promise<void>;
}

const AddPlatformUserDialog: React.FC<AddPlatformUserDialogProps> = ({ onAddUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'platform_support' as PlatformRole,
  });
  const { toast } = useToast();

  const handleAddUser = async () => {
    if (!newUser.name.trim() || !newUser.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onAddUser(newUser);
      setNewUser({
        name: '',
        email: '',
        role: 'platform_support',
      });
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Platform user has been added successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add platform user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Platform User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Platform User</DialogTitle>
          <DialogDescription>
            Create a new platform user with administrative or support access.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="Enter full name"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Enter email address"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Platform Role *</Label>
            <Select
              value={newUser.role}
              onValueChange={(value: PlatformRole) => setNewUser({ ...newUser, role: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select platform role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform_admin">Platform Admin</SelectItem>
                <SelectItem value="platform_support">Platform Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleAddUser} disabled={isLoading}>
            {isLoading ? "Adding..." : "Add User"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddPlatformUserDialog;
