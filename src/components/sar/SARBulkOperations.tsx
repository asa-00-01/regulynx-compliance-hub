import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Download, 
  Send,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { SAR, SARStatus } from '@/types/sar';
import { useToast } from '@/hooks/use-toast';

interface SARBulkOperationsProps {
  sars: SAR[];
  selectedSARs: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  onBulkStatusUpdate: (sarIds: string[], newStatus: SARStatus) => Promise<void>;
  onBulkDelete: (sarIds: string[]) => Promise<void>;
  onBulkExport: (sarIds: string[]) => void;
}

const SARBulkOperations: React.FC<SARBulkOperationsProps> = ({
  sars,
  selectedSARs,
  onSelectionChange,
  onBulkStatusUpdate,
  onBulkDelete,
  onBulkExport
}) => {
  const [bulkAction, setBulkAction] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const selectedSARObjects = sars.filter(sar => selectedSARs.includes(sar.id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(sars.map(sar => sar.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectSAR = (sarId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedSARs, sarId]);
    } else {
      onSelectionChange(selectedSARs.filter(id => id !== sarId));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedSARs.length === 0) return;

    setLoading(true);
    try {
      switch (bulkAction) {
        case 'submit':
          await onBulkStatusUpdate(selectedSARs, 'submitted');
          toast({
            title: 'Bulk Update Complete',
            description: `${selectedSARs.length} SARs have been submitted for review`,
          });
          break;
        case 'approve':
          await onBulkStatusUpdate(selectedSARs, 'filed');
          toast({
            title: 'Bulk Update Complete',
            description: `${selectedSARs.length} SARs have been approved and filed`,
          });
          break;
        case 'reject':
          await onBulkStatusUpdate(selectedSARs, 'rejected');
          toast({
            title: 'Bulk Update Complete',
            description: `${selectedSARs.length} SARs have been rejected`,
          });
          break;
        case 'return-draft':
          await onBulkStatusUpdate(selectedSARs, 'draft');
          toast({
            title: 'Bulk Update Complete',
            description: `${selectedSARs.length} SARs have been returned to draft`,
          });
          break;
        case 'delete':
          if (window.confirm(`Are you sure you want to delete ${selectedSARs.length} SARs? This action cannot be undone.`)) {
            await onBulkDelete(selectedSARs);
            toast({
              title: 'Bulk Delete Complete',
              description: `${selectedSARs.length} SARs have been deleted`,
            });
          }
          break;
        case 'export':
          onBulkExport(selectedSARs);
          toast({
            title: 'Bulk Export Complete',
            description: `${selectedSARs.length} SARs have been exported`,
          });
          break;
      }
      
      // Clear selection after action
      onSelectionChange([]);
      setBulkAction('');
    } catch (error) {
      toast({
        title: 'Bulk Operation Failed',
        description: 'An error occurred during the bulk operation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: SARStatus) => {
    switch (status) {
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'submitted': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'filed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getBulkActionOptions = () => {
    const options = [
      { value: 'export', label: 'Export Selected', icon: <Download className="h-4 w-4" /> }
    ];

    // Add status-specific actions based on selected SARs
    const statuses = selectedSARObjects.map(sar => sar.status);
    const hasDrafts = statuses.includes('draft');
    const hasSubmitted = statuses.includes('submitted');
    const hasRejected = statuses.includes('rejected');

    if (hasDrafts) {
      options.push({ value: 'submit', label: 'Submit for Review', icon: <Send className="h-4 w-4" /> });
    }

    if (hasSubmitted) {
      options.push(
        { value: 'approve', label: 'Approve & File', icon: <CheckCircle className="h-4 w-4" /> },
        { value: 'reject', label: 'Reject', icon: <XCircle className="h-4 w-4" /> },
        { value: 'return-draft', label: 'Return to Draft', icon: <Clock className="h-4 w-4" /> }
      );
    }

    if (hasRejected) {
      options.push(
        { value: 'submit', label: 'Resubmit', icon: <Send className="h-4 w-4" /> },
        { value: 'return-draft', label: 'Return to Draft', icon: <Clock className="h-4 w-4" /> }
      );
    }

    // Add delete option for drafts and rejected SARs
    if (hasDrafts || hasRejected) {
      options.push({ value: 'delete', label: 'Delete Selected', icon: <Trash2 className="h-4 w-4" /> });
    }

    return options;
  };

  if (sars.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          Bulk Operations
          {selectedSARs.length > 0 && (
            <Badge variant="secondary">
              {selectedSARs.length} selected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selection Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={selectedSARs.length === sars.length && sars.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm font-medium">Select All</span>
          </div>
          
          {selectedSARs.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelectionChange([])}
            >
              Clear Selection
            </Button>
          )}
        </div>

        {/* SAR List with Checkboxes */}
        <div className="max-h-60 overflow-y-auto space-y-2">
          {sars.map((sar) => (
            <div
              key={sar.id}
              className="flex items-center gap-3 p-2 border rounded hover:bg-muted"
            >
              <Checkbox
                checked={selectedSARs.includes(sar.id)}
                onCheckedChange={(checked) => handleSelectSAR(sar.id, checked as boolean)}
              />
              <div className="flex items-center gap-2 flex-1">
                {getStatusIcon(sar.status)}
                <span className="font-medium">SAR-{sar.id.slice(-6)}</span>
                <span className="text-sm text-muted-foreground">{sar.userName}</span>
              </div>
              <Badge variant="outline" className="capitalize">
                {sar.status}
              </Badge>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        {selectedSARs.length > 0 && (
          <div className="flex items-center gap-3 pt-4 border-t">
            <Select value={bulkAction} onValueChange={setBulkAction}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select action..." />
              </SelectTrigger>
              <SelectContent>
                {getBulkActionOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      {option.icon}
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleBulkAction}
              disabled={!bulkAction || loading}
              variant={bulkAction === 'delete' ? 'destructive' : 'default'}
            >
              {loading ? 'Processing...' : 'Execute Action'}
            </Button>
          </div>
        )}

        {/* Summary */}
        {selectedSARs.length > 0 && (
          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-2">Selection Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Selected:</span>
                <div className="font-medium">{selectedSARs.length}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Drafts:</span>
                <div className="font-medium">
                  {selectedSARObjects.filter(sar => sar.status === 'draft').length}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Submitted:</span>
                <div className="font-medium">
                  {selectedSARObjects.filter(sar => sar.status === 'submitted').length}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Rejected:</span>
                <div className="font-medium">
                  {selectedSARObjects.filter(sar => sar.status === 'rejected').length}
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SARBulkOperations;
