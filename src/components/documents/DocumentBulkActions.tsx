
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { MoreHorizontal, Download, Trash2, Archive, FileCheck, FileX } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  file_name: string;
  type: string;
  status: string;
  upload_date: string;
  user_id: string;
  created_at: string;
  customer_id: string;
  extracted_data: any;
  file_path: string;
  organization_customer_id: string;
  updated_at: string;
  verification_date: string;
  verified_by: string;
}

interface DocumentBulkActionsProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelectionChange: (selected: string[]) => void;
  onRefresh: () => void;
}

const DocumentBulkActions: React.FC<DocumentBulkActionsProps> = ({
  documents,
  selectedDocuments,
  onSelectionChange,
  onRefresh
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectAll = () => {
    if (selectedDocuments.length === documents.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(documents.map(doc => doc.id));
    }
  };

  const handleBulkDelete = async () => {
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${selectedDocuments.length} documents deleted successfully`);
      onSelectionChange([]);
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete documents');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkApprove = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${selectedDocuments.length} documents approved successfully`);
      onSelectionChange([]);
      onRefresh();
    } catch (error) {
      toast.error('Failed to approve documents');
    }
  };

  const handleBulkReject = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`${selectedDocuments.length} documents rejected successfully`);
      onSelectionChange([]);
      onRefresh();
    } catch (error) {
      toast.error('Failed to reject documents');
    }
  };

  const handleDownloadSelected = () => {
    const selectedDocs = documents.filter(doc => selectedDocuments.includes(doc.id));
    const csvContent = [
      ['File Name', 'Type', 'Status', 'Upload Date', 'User ID'].join(','),
      ...selectedDocs.map(doc => [
        doc.file_name,
        doc.type,
        doc.status,
        doc.upload_date,
        doc.user_id
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'selected-documents.csv';
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Documents exported successfully');
  };

  if (documents.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={selectedDocuments.length === documents.length}
          onCheckedChange={handleSelectAll}
          aria-label="Select all documents"
        />
        <span className="text-sm font-medium">
          {selectedDocuments.length === 0 
            ? 'Select All' 
            : `${selectedDocuments.length} selected`
          }
        </span>
      </div>

      {selectedDocuments.length > 0 && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''} selected
          </Badge>

          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadSelected}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkApprove}
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Approve
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkReject}
          >
            <FileX className="h-4 w-4 mr-2" />
            Reject
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Selected Documents</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete {selectedDocuments.length} document{selectedDocuments.length !== 1 ? 's' : ''}? 
                  This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
};

export default DocumentBulkActions;
