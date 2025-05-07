
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { KYCUser, UserFlags, KYCStatus } from '@/types/kyc';
import { useToast } from '@/hooks/use-toast';
import { UserCheck, UserX, FileQuestion } from 'lucide-react';
import UserFlagsDisplay from './UserFlagsDisplay';
import SanctionIndicator from './SanctionIndicator';

interface UserDetailModalProps {
  user: KYCUser & { flags: UserFlags };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const UserDetailModal = ({ user, open, onOpenChange }: UserDetailModalProps) => {
  const [activeTab, setActiveTab] = useState('details');
  const [notes, setNotes] = useState('');
  const [kycStatus, setKycStatus] = useState<KYCStatus>('pending');
  const { toast } = useToast();

  const handleVerify = () => {
    setKycStatus('verified');
    toast({
      title: 'User Verified',
      description: `${user.fullName} has been marked as verified.`,
      variant: 'default',
    });
    onOpenChange(false);
  };

  const handleReject = () => {
    setKycStatus('rejected');
    toast({
      title: 'User Rejected',
      description: `${user.fullName} has been rejected for verification.`,
      variant: 'destructive',
    });
    onOpenChange(false);
  };

  const handleRequestInfo = () => {
    setKycStatus('information_requested');
    toast({
      title: 'More Information Requested',
      description: `A request for more information has been sent to ${user.fullName}.`,
      variant: 'default',
    });
    onOpenChange(false);
  };

  const getKycBadge = () => {
    switch (kycStatus) {
      case 'verified':
        return <Badge variant="default">Verified</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'information_requested':
        return <Badge variant="warning">Information Requested</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>User Details: {user.fullName}</DialogTitle>
            {getKycBadge()}
          </div>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Personal Details</TabsTrigger>
            <TabsTrigger value="flags">Risk & Flags</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm font-semibold">Full Name</div>
                    <div>{user.fullName}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Email</div>
                    <div>{user.email || <span className="text-muted-foreground italic">Missing</span>}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Date of Birth</div>
                    <div>{user.dateOfBirth || <span className="text-muted-foreground italic">Missing</span>}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Identity Number</div>
                    <div>{user.identityNumber || <span className="text-muted-foreground italic">Missing</span>}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Phone Number</div>
                    <div>{user.phoneNumber || <span className="text-muted-foreground italic">Missing</span>}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">Created At</div>
                    <div>{new Date(user.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Address</CardTitle>
              </CardHeader>
              <CardContent>
                <div>{user.address || <span className="text-muted-foreground italic">No address provided</span>}</div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="flags">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">User Flags</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <UserFlagsDisplay flags={user.flags} detailed />
                
                <div className="mt-4">
                  <SanctionIndicator isPep={user.flags.is_verified_pep} isSanctioned={user.flags.is_sanction_list} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="verification" className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">Add Verification Note</div>
              <Textarea
                placeholder="Enter verification notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </div>
            
            <div className="flex space-x-2">
              <Button 
                onClick={handleVerify}
                className="flex-1"
                variant="default"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Mark as Verified
              </Button>
              <Button 
                onClick={handleReject}
                className="flex-1"
                variant="destructive"
              >
                <UserX className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button 
                onClick={handleRequestInfo}
                className="flex-1"
                variant="secondary"
              >
                <FileQuestion className="h-4 w-4 mr-2" />
                Request More Info
              </Button>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;
