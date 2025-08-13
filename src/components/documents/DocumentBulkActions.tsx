
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CheckSquare, FileText, Mail, AlertTriangle, Users, X, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Document } from '@/types/supabase';

interface DocumentBulkActionsProps {
  selectedDocuments: string[];
  documents: Document[];
  onClearSelection: () => void;
  onBulkAction: (action: string, data?: any) => void;
}

const DocumentBulkActions: React.FC<DocumentBulkActionsProps> = ({
  selectedDocuments,
  documents,
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
      case 'approve':
        toast({
          title: "Documents Approved",
          description: `Successfully approved ${selectedDocuments.length} document(s).`
        });
        break;
      case 'reject':
        toast({
          title: "Documents Rejected",
          description: `Successfully rejected ${selectedDocuments.length} document(s).`
        });
        break;
      case 'request_info':
        toast({
          title: "Information Requested",
          description: `Information request sent for ${selectedDocuments.length} document(s).`
        });
        break;
      case 'send_notification':
        toast({
          title: "Notifications Sent",
          description: `Notifications sent for ${selectedDocuments.length} document(s).`
        });
        break;
      case 'flag_review':
        toast({
          title: "Documents Flagged",
          description: `Successfully flagged ${selectedDocuments.length} document(s) for review.`
        });
        break;
      case 'export_selected':
        // Export selected documents
        const exportData = selectedDocumentObjects.map(doc => ({
          id: doc.id,
          fileName: doc.fileName,
          type: doc.type,
          status: doc.status,
          uploadDate: doc.uploadDate,
          userId: doc.userId
        }));
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `documents-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Documents Exported",
          description: `Successfully exported ${selectedDocuments.length} document(s).`
        });
        break;
      default:
        toast({
          title: "Action Completed",
          description: `Successfully performed ${selectedAction} on ${selectedDocuments.length} document(s).`
        });
    }

    onBulkAction(selectedAction, actionData);
    setSelectedAction('');
    setActionData({});
  };

  const bulkActions = [
    { value: 'approve', label: 'Approve Documents', icon: CheckSquare },
    { value: 'reject', label: 'Reject Documents', icon: X },
    { value: 'request_info', label: 'Request Information', icon: FileText },
    { value: 'send_notification', label: 'Send Notification', icon: Mail },
    { value: 'flag_review', label: 'Flag for Review', icon: AlertTriangle },
    { value: 'export_selected', label: 'Export Selected', icon: Download }
  ];

  const selectedDocumentObjects = documents.filter(doc => selectedDocuments.includes(doc.id));
  const statusBreakdown = selectedDocumentObjects.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (selectedDocuments.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Document Bulk Actions
            <Badge variant="secondary">{selectedDocuments.length} selected</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClearSelection}>
            Clear Selection
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Selection Summary */}
          <div className="bg-muted/50 p-3 rounded-md">
            <h4 className="text-sm font-medium mb-2">Selection Summary</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(statusBreakdown).map(([status, count]) => (
                <Badge key={status} variant="outline" className="text-xs">
                  {status}: {count}
                </Badge>
              ))}
            </div>
          </div>

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

          {(selectedAction === 'reject' || selectedAction === 'request_info' || selectedAction === 'send_notification') && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {selectedAction === 'reject' ? 'Rejection Reason' : 
                 selectedAction === 'request_info' ? 'Information Request' : 'Notification Message'}
              </label>
              <Textarea
                placeholder={
                  selectedAction === 'reject' ? 'Enter reason for rejection...' :
                  selectedAction === 'request_info' ? 'Specify what information is needed...' :
                  'Enter notification message...'
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
                    Are you sure you want to perform this action on {selectedDocuments.length} selected document(s)? 
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

export default DocumentBulkActions;
