
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PlatformRole } from '@/types/platform-roles';
import { useToast } from '@/hooks/use-toast';

interface PlatformUser {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  status: 'active' | 'inactive';
}

interface EditPlatformUserDialogProps {
  user: PlatformUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (user: PlatformUser) => Promise<void>;
}

const EditPlatformUserDialog: React.FC<EditPlatformUserDialogProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onUpdateUser 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editedUser, setEditedUser] = useState<PlatformUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setEditedUser(user);
  }, [user]);

  const handleUpdate = async () => {
    if (!editedUser) return;

    if (!editedUser.name.trim() || !editedUser.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await onUpdateUser(editedUser);
      onClose();
      toast({
        title: "Success",
        description: "Platform user has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update platform user. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof PlatformUser, value: string) => {
    if (editedUser) {
      setEditedUser({ ...editedUser, [field]: value });
    }
  };

  if (!editedUser) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Platform User</DialogTitle>
          <DialogDescription>
            Update platform user details and permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Full Name *</Label>
            <Input
              id="edit-name"
              value={editedUser.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter full name"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-email">Email Address *</Label>
            <Input
              id="edit-email"
              type="email"
              value={editedUser.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="Enter email address"
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-role">Platform Role *</Label>
            <Select
              value={editedUser.role}
              onValueChange={(value: PlatformRole) => handleChange('role', value)}
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
          <div className="grid gap-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={editedUser.status}
              onValueChange={(value: 'active' | 'inactive') => handleChange('status', value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={isLoading}>
            {isLoading ? "Updating..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditPlatformUserDialog;
