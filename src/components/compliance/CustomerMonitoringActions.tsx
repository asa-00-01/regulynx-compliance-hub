
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertTriangle, Flag, UserCheck, FileText, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CustomerMonitoringActionsProps {
  customerId: string;
  customerName: string;
  riskScore: number;
  onClose: () => void;
  open: boolean;
}

const CustomerMonitoringActions: React.FC<CustomerMonitoringActionsProps> = ({
  customerId,
  customerName,
  riskScore,
  open,
  onClose,
}) => {
  const [actionType, setActionType] = useState<string>('review');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleSubmitAction = async () => {
    if (!description.trim()) {
      toast({
        title: "Description Required",
        description: "Please provide details about this action.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would call an API to create the action
      // For now, we'll simulate the action with a timeout
      
      // Different responses based on action type
      setTimeout(() => {
        switch (actionType) {
          case 'review':
            toast({
              title: "Review Started",
              description: `Review initiated for ${customerName}.`,
            });
            break;
          case 'flag':
            toast({
              title: "Customer Flagged",
              description: `${customerName} has been flagged for compliance review.`,
            });
            break;
          case 'case_creation':
            toast({
              title: "Case Created",
              description: `Compliance case created for ${customerName}.`,
            });
            
            // Redirect to the compliance cases page after a short delay
            setTimeout(() => {
              navigate('/compliance-cases');
              onClose();
            }, 1000);
            return;
          case 'document_request':
            toast({
              title: "Document Requested",
              description: `Additional documents requested from ${customerName}.`,
            });
            break;
          case 'restriction':
            toast({
              title: "Account Restricted",
              description: `Restrictions applied to ${customerName}'s account.`,
            });
            break;
        }
        
        setIsSubmitting(false);
        setDescription('');
        onClose();
      }, 1000);
      
    } catch (error) {
      console.error("Error submitting action:", error);
      toast({
        title: "Error",
        description: "Failed to process the action. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  const getActionIcon = () => {
    switch (actionType) {
      case 'review':
        return <UserCheck className="h-5 w-5 text-blue-500" />;
      case 'flag':
        return <Flag className="h-5 w-5 text-yellow-500" />;
      case 'case_creation':
        return <FileText className="h-5 w-5 text-purple-500" />;
      case 'document_request':
        return <FileText className="h-5 w-5 text-green-500" />;
      case 'restriction':
        return <ShieldAlert className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getActionIcon()}
            Customer Monitoring Action
          </DialogTitle>
          <DialogDescription>
            Take compliance action for customer {customerName}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="risk-score" className="text-right">
              Risk Score
            </Label>
            <div className="col-span-3">
              <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                riskScore > 70
                  ? "bg-red-100 text-red-800"
                  : riskScore > 40
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-green-100 text-green-800"
              }`}>
                {riskScore}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="action-type" className="text-right">
              Action Type
            </Label>
            <div className="col-span-3">
              <Select
                value={actionType}
                onValueChange={(value) => setActionType(value)}
              >
                <SelectTrigger id="action-type">
                  <SelectValue placeholder="Select action type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="review">Start Review</SelectItem>
                  <SelectItem value="flag">Flag Customer</SelectItem>
                  <SelectItem value="case_creation">Create Compliance Case</SelectItem>
                  <SelectItem value="document_request">Request Documents</SelectItem>
                  <SelectItem value="restriction">Restrict Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <div className="col-span-3">
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter details about this action..."
                className="min-h-[100px]"
              />
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmitAction} disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Submit Action"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomerMonitoringActions;
