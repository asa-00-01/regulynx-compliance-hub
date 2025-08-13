
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckSquare, FileText, Mail, AlertTriangle, Users, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BulkActionsPanelProps {
  selectedUsers: string[];
  onClearSelection: () => void;
  onBulkAction: (action: string, data?: any) => void;
}

const BulkActionsPanel: React.FC<BulkActionsPanelProps> = ({
  selectedUsers,
  onClearSelection,
  onBulkAction
}) => {
  const [selectedAction, setSelectedAction] = useState('');
  const [actionData, setActionData] = useState<any>({});
  const { toast } = useToast();

  const handleBulkAction = () => {
    if (!selectedAction) {
      toast({
        title: "No Action Selected",
        description: "Please select an action to perform.",
        variant: "destructive"
      });
      return;
    }

    // Perform the selected bulk action
    switch (selectedAction) {
      case 'verify':
        toast({
          title: "KYC Verified",
          description: `Successfully verified KYC for ${selectedUsers.length} user(s).`
        });
        break;
      case 'reject':
        toast({
          title: "KYC Rejected",
          description: `Successfully rejected KYC for ${selectedUsers.length} user(s).`
        });
        break;
      case 'request_info':
        toast({
          title: "Information Requested",
          description: `Information request sent to ${selectedUsers.length} user(s).`
        });
        break;
      case 'send_email':
        toast({
          title: "Emails Sent",
          description: `Emails sent to ${selectedUsers.length} user(s).`
        });
        break;
      case 'flag_review':
        toast({
          title: "Users Flagged",
          description: `Successfully flagged ${selectedUsers.length} user(s) for review.`
        });
        break;
      case 'assign_case':
        toast({
          title: "Case Assignment",
          description: `Successfully assigned ${selectedUsers.length} user(s) to cases.`
        });
        break;
      default:
        toast({
          title: "Action Completed",
          description: `Successfully performed ${selectedAction} on ${selectedUsers.length} user(s).`
        });
    }

    onBulkAction(selectedAction, actionData);
    setSelectedAction('');
    setActionData({});
  };

  const bulkActions = [
    { value: 'verify', label: 'Verify KYC', icon: CheckSquare },
    { value: 'reject', label: 'Reject KYC', icon: X },
    { value: 'request_info', label: 'Request Information', icon: FileText },
    { value: 'send_email', label: 'Send Email', icon: Mail },
    { value: 'flag_review', label: 'Flag for Review', icon: AlertTriangle },
    { value: 'assign_case', label: 'Assign to Case', icon: Users }
  ];

  if (selectedUsers.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Bulk Actions
            <Badge variant="secondary">{selectedUsers.length} selected</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Action</label>
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an action..." />
              </SelectTrigger>
              <SelectContent>
                {bulkActions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <SelectItem key={action.value} value={action.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {action.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {(selectedAction === 'reject' || selectedAction === 'request_info' || selectedAction === 'send_email') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedAction === 'reject' ? 'Rejection Reason' : 
                 selectedAction === 'request_info' ? 'Information Request' : 'Email Message'}
              </label>
              <Textarea
                placeholder={
                  selectedAction === 'reject' ? 'Enter reason for rejection...' :
                  selectedAction === 'request_info' ? 'Specify what information is needed...' :
                  'Enter email message...'
                }
                value={actionData.message || ''}
                onChange={(e) => setActionData({ ...actionData, message: e.target.value })}
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  disabled={!selectedAction} 
                  className="flex-1"
                >
                  Execute Action
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm Bulk Action</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to perform this action on {selectedUsers.length} selected user(s)? 
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleBulkAction}>
                    Confirm Action
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkActionsPanel;
