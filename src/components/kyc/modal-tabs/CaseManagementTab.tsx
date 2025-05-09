
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Flag, CheckCircle, XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { KYCStatus } from '@/types/kyc';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CaseManagementTabProps {
  userId: string;
  userName: string;
  isPEP: boolean;
  initialStatus: KYCStatus;
  onClose: () => void;
}

const CaseManagementTab: React.FC<CaseManagementTabProps> = ({ 
  userId, 
  userName, 
  isPEP,
  initialStatus,
  onClose
}) => {
  const [caseNotes, setCaseNotes] = useState<string>('');
  const [kycStatus, setKycStatus] = useState<KYCStatus>(isPEP ? 'information_requested' : initialStatus);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleApproveKYC = async () => {
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would update the database
      // For now, we'll just show a toast notification
      setTimeout(() => {
        toast({
          title: "KYC Approved",
          description: `${userName}'s KYC verification has been approved.`,
        });
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update KYC status. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  const handleRejectKYC = async () => {
    if (!caseNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide rejection reason in the notes.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would update the database
      // For now, we'll just show a toast notification
      setTimeout(() => {
        toast({
          title: "KYC Rejected",
          description: `${userName}'s KYC verification has been rejected.`,
        });
        setIsSubmitting(false);
        onClose();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update KYC status. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  const handleCreateCase = async () => {
    if (!caseNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide details for the compliance case.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real implementation, this would create a case in the database
      // For now, we'll just show a toast notification
      setTimeout(() => {
        toast({
          title: "Case Created",
          description: `Compliance case created for ${userName}.`,
        });
        setIsSubmitting(false);
        
        // Navigate to the compliance cases page
        setTimeout(() => {
          navigate('/compliance-cases');
        }, 500);
        
        onClose();
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create compliance case. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Compliance Case Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current KYC Status</label>
            <Select value={kycStatus} onValueChange={(value) => setKycStatus(value as KYCStatus)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="information_requested">Information Requested</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Case Notes</label>
            <Textarea
              placeholder="Enter your notes, findings, or reasons for approval/rejection here..."
              value={caseNotes}
              onChange={(e) => setCaseNotes(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
          <div className="flex flex-wrap gap-3 justify-end pt-2">
            <Button 
              variant="outline" 
              className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={handleRejectKYC}
              disabled={isSubmitting}
            >
              <XCircle className="mr-1 h-4 w-4" />
              Reject KYC
            </Button>
            <Button
              variant="outline"
              className="border-green-200 text-green-700 hover:bg-green-50 hover:text-green-800"
              onClick={handleApproveKYC}
              disabled={isSubmitting}
            >
              <CheckCircle className="mr-1 h-4 w-4" />
              Approve KYC
            </Button>
            <Button
              variant="default"
              onClick={handleCreateCase}
              disabled={isSubmitting}
            >
              <Flag className="mr-1 h-4 w-4" />
              Create Compliance Case
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Case History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No previous cases found for this user.
          </p>
          {/* In a real implementation, this would show the history of cases */}
        </CardContent>
      </Card>
    </div>
  );
};

export default CaseManagementTab;
