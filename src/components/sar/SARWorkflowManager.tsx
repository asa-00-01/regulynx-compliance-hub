import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  FileText,
  Send,
  UserCheck,
  History
} from 'lucide-react';
import { SAR, SARStatus } from '@/types/sar';
import { useToast } from '@/hooks/use-toast';

interface SARWorkflowManagerProps {
  sar: SAR;
  onStatusChange: (sarId: string, newStatus: SARStatus, notes?: string) => Promise<void>;
  onClose: () => void;
}

interface WorkflowAction {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: SARStatus;
  variant: 'default' | 'destructive' | 'outline' | 'secondary';
  requiresApproval?: boolean;
  requiresNotes?: boolean;
}

const SARWorkflowManager: React.FC<SARWorkflowManagerProps> = ({
  sar,
  onStatusChange,
  onClose
}) => {
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const getAvailableActions = (currentStatus: SARStatus): WorkflowAction[] => {
    const actions: WorkflowAction[] = [];

    switch (currentStatus) {
      case 'draft':
        actions.push(
          {
            id: 'submit',
            label: 'Submit for Review',
            description: 'Submit the SAR for compliance officer review',
            icon: <Send className="h-4 w-4" />,
            status: 'submitted',
            variant: 'default',
            requiresNotes: true
          }
        );
        break;

      case 'submitted':
        actions.push(
          {
            id: 'approve',
            label: 'Approve & File',
            description: 'Approve the SAR and file with authorities',
            icon: <CheckCircle className="h-4 w-4" />,
            status: 'filed',
            variant: 'default',
            requiresApproval: true,
            requiresNotes: true
          },
          {
            id: 'reject',
            label: 'Reject & Return',
            description: 'Reject the SAR and return for revision',
            icon: <XCircle className="h-4 w-4" />,
            status: 'rejected',
            variant: 'destructive',
            requiresNotes: true
          },
          {
            id: 'return-draft',
            label: 'Return to Draft',
            description: 'Return the SAR to draft status for editing',
            icon: <Clock className="h-4 w-4" />,
            status: 'draft',
            variant: 'outline',
            requiresNotes: true
          }
        );
        break;

      case 'rejected':
        actions.push(
          {
            id: 'resubmit',
            label: 'Resubmit',
            description: 'Resubmit the SAR after addressing feedback',
            icon: <Send className="h-4 w-4" />,
            status: 'submitted',
            variant: 'default',
            requiresNotes: true
          },
          {
            id: 'return-draft',
            label: 'Return to Draft',
            description: 'Return the SAR to draft status for editing',
            icon: <Clock className="h-4 w-4" />,
            status: 'draft',
            variant: 'outline',
            requiresNotes: true
          }
        );
        break;

      case 'filed':
        actions.push(
          {
            id: 'reopen',
            label: 'Reopen for Review',
            description: 'Reopen the SAR for additional review',
            icon: <AlertTriangle className="h-4 w-4" />,
            status: 'submitted',
            variant: 'outline',
            requiresNotes: true
          }
        );
        break;
    }

    return actions;
  };

  const getStatusInfo = (status: SARStatus) => {
    switch (status) {
      case 'draft':
        return {
          label: 'Draft',
          description: 'SAR is in draft mode and can be edited',
          icon: <Clock className="h-5 w-5 text-yellow-500" />,
          color: 'text-yellow-600'
        };
      case 'submitted':
        return {
          label: 'Submitted',
          description: 'SAR has been submitted for review',
          icon: <FileText className="h-5 w-5 text-blue-500" />,
          color: 'text-blue-600'
        };
      case 'filed':
        return {
          label: 'Filed',
          description: 'SAR has been filed with authorities',
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          color: 'text-green-600'
        };
      case 'rejected':
        return {
          label: 'Rejected',
          description: 'SAR has been rejected and requires revision',
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          color: 'text-red-600'
        };
    }
  };

  const handleActionSelect = (actionId: string) => {
    setSelectedAction(actionId);
  };

  const handleExecuteAction = async () => {
    if (!selectedAction) return;

    const action = getAvailableActions(sar.status).find(a => a.id === selectedAction);
    if (!action) return;

    if (action.requiresNotes && !notes.trim()) {
      toast({
        title: 'Notes Required',
        description: 'Please provide notes for this action',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await onStatusChange(sar.id, action.status, notes.trim() || undefined);
      
      toast({
        title: 'Status Updated',
        description: `SAR has been ${action.label.toLowerCase()}`,
      });
      
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update SAR status',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const availableActions = getAvailableActions(sar.status);
  const statusInfo = getStatusInfo(sar.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          SAR Workflow Management
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            {statusInfo.icon}
            <div>
              <h3 className={`font-semibold ${statusInfo.color}`}>
                Current Status: {statusInfo.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {statusInfo.description}
              </p>
            </div>
          </div>
        </div>

        {/* Available Actions */}
        {availableActions.length > 0 && (
          <div>
            <Label className="text-base font-medium">Available Actions</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              {availableActions.map((action) => (
                <Button
                  key={action.id}
                  variant={selectedAction === action.id ? 'default' : 'outline'}
                  className="justify-start h-auto p-4"
                  onClick={() => handleActionSelect(action.id)}
                >
                  <div className="flex items-start gap-3">
                    {action.icon}
                    <div className="text-left">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {action.description}
                      </div>
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Notes Input */}
        {selectedAction && (
          <div>
            <Label htmlFor="workflow-notes">
              Notes {getAvailableActions(sar.status).find(a => a.id === selectedAction)?.requiresNotes && '*'}
            </Label>
            <Textarea
              id="workflow-notes"
              placeholder="Add notes about this action..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          {selectedAction && (
            <Button 
              onClick={handleExecuteAction}
              disabled={loading}
              variant={getAvailableActions(sar.status).find(a => a.id === selectedAction)?.variant || 'default'}
            >
              {loading ? 'Processing...' : 'Execute Action'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SARWorkflowManager;
