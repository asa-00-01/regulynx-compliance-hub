
import { useState } from 'react';
import { KYCUser, UserFlags, KYCStatus } from '@/types/kyc';
import { useToast } from '@/hooks/use-toast';

interface UseKYCOperationsProps {
  users: (KYCUser & { flags: UserFlags })[];
  onUserUpdate?: (userId: string, updates: Partial<KYCUser & { flags: UserFlags }>) => void;
}

export const useKYCOperations = ({ users, onUserUpdate }: UseKYCOperationsProps) => {
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const setProcessing = (userId: string, processing: boolean) => {
    setProcessingUsers(prev => {
      const newSet = new Set(prev);
      if (processing) {
        newSet.add(userId);
      } else {
        newSet.delete(userId);
      }
      return newSet;
    });
  };

  const updateUserKYCStatus = async (userId: string, status: KYCStatus, reason?: string) => {
    setProcessing(userId, true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = users.find(u => u.id === userId);
      if (user && onUserUpdate) {
        const updates = {
          ...user,
          flags: {
            ...user.flags,
            // Update flags based on status
            is_email_confirmed: status === 'verified' ? true : user.flags.is_email_confirmed
          }
        };
        onUserUpdate(userId, updates);
      }

      toast({
        title: "KYC Status Updated",
        description: `User KYC status has been updated to ${status}.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update KYC status.",
        variant: "destructive"
      });
    } finally {
      setProcessing(userId, false);
    }
  };

  const requestAdditionalInfo = async (userId: string, requiredInfo: string[]) => {
    setProcessing(userId, true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Information Request Sent",
        description: `User has been notified to provide: ${requiredInfo.join(', ')}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send information request.",
        variant: "destructive"
      });
    } finally {
      setProcessing(userId, false);
    }
  };

  const sendNotification = async (userId: string, message: string, type: 'email' | 'sms' = 'email') => {
    setProcessing(userId, true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Notification Sent",
        description: `${type.toUpperCase()} notification has been sent to the user.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send notification.",
        variant: "destructive"
      });
    } finally {
      setProcessing(userId, false);
    }
  };

  const escalateToCompliance = async (userId: string, reason: string) => {
    setProcessing(userId, true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      toast({
        title: "Case Escalated",
        description: "User has been escalated to compliance team for review."
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to escalate case.",
        variant: "destructive"
      });
    } finally {
      setProcessing(userId, false);
    }
  };

  const generateComplianceReport = async (userIds: string[]) => {
    const reportData = users
      .filter(user => userIds.includes(user.id))
      .map(user => ({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        riskScore: user.flags.riskScore,
        kycStatus: user.flags.is_email_confirmed && user.identityNumber ? 'verified' : 'pending',
        isPEP: user.flags.is_verified_pep,
        isSanctioned: user.flags.is_sanction_list,
        registrationDate: user.createdAt,
        lastUpdated: user.updatedAt
      }));

    // Generate and download report
    const csv = [
      'ID,Full Name,Email,Risk Score,KYC Status,PEP,Sanctioned,Registration Date,Last Updated',
      ...reportData.map(user => 
        `${user.id},"${user.fullName}","${user.email}",${user.riskScore},${user.kycStatus},${user.isPEP},${user.isSanctioned},${user.registrationDate},${user.lastUpdated}`
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kyc-compliance-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: "Compliance report has been downloaded."
    });
  };

  const scheduleReview = async (userId: string, reviewDate: Date) => {
    setProcessing(userId, true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast({
        title: "Review Scheduled",
        description: `User review has been scheduled for ${reviewDate.toLocaleDateString()}.`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule review.",
        variant: "destructive"
      });
    } finally {
      setProcessing(userId, false);
    }
  };

  return {
    processingUsers,
    updateUserKYCStatus,
    requestAdditionalInfo,
    sendNotification,
    escalateToCompliance,
    generateComplianceReport,
    scheduleReview,
    isProcessing: (userId: string) => processingUsers.has(userId)
  };
};
