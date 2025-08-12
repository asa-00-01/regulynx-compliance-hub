
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ComplianceCaseDetails } from '@/types/case';
import { useToast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';

interface CaseEditModalProps {
  caseItem: ComplianceCaseDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedCase: ComplianceCaseDetails) => void;
}

const CaseEditModal: React.FC<CaseEditModalProps> = ({
  caseItem,
  open,
  onOpenChange,
  onSave
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<ComplianceCaseDetails>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (caseItem) {
      setFormData({
        description: caseItem.description,
        priority: caseItem.priority,
        status: caseItem.status,
        assignedToName: caseItem.assignedToName || '',
        riskScore: caseItem.riskScore
      });
    }
  }, [caseItem]);

  const handleSave = async () => {
    if (!caseItem) return;

    setLoading(true);
    try {
      const updatedCase: ComplianceCaseDetails = {
        ...caseItem,
        ...formData,
        updatedAt: new Date().toISOString()
      };

      onSave(updatedCase);
      onOpenChange(false);
      
      toast({
        title: 'Case Updated',
        description: 'Case has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update case',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!caseItem) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Case: {caseItem.id}
          </DialogTitle>
          <DialogDescription>
            Update case information and details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Case description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="escalated">Escalated</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Input
                id="assignedTo"
                value={formData.assignedToName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedToName: e.target.value }))}
                placeholder="Assignee name"
              />
            </div>

            <div>
              <Label htmlFor="riskScore">Risk Score</Label>
              <Input
                id="riskScore"
                type="number"
                min="0"
                max="100"
                value={formData.riskScore || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, riskScore: parseInt(e.target.value) || 0 }))}
                placeholder="Risk score (0-100)"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CaseEditModal;
