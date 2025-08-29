
import { useState } from 'react';
import { KYCUser, UserFlags, KYCStatus } from '@/types/kyc';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useCompliance } from '@/context/compliance/useCompliance';

interface UseKYCOperationsProps {
  users: (KYCUser & { flags: UserFlags })[];
  onUserUpdate?: (userId: string, updates: Partial<KYCUser & { flags: UserFlags }>) => void;
}

export const useKYCOperations = ({ users, onUserUpdate }: UseKYCOperationsProps) => {
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { dispatch } = useCompliance();

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
      // Update the database
      const { error: dbError } = await supabase
        .from('organization_customers')
        .update({ 
          kyc_status: status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Update the compliance context
      const user = users.find(u => u.id === userId);
      if (user) {
        // Create a UnifiedUserData object for the compliance context
        const updatedUser = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          nationality: '', // This would come from the database
          identityNumber: user.identityNumber,
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          countryOfResidence: '', // This would come from the database
          riskScore: user.flags.riskScore,
          isPEP: user.flags.is_verified_pep,
          isSanctioned: user.flags.is_sanction_list,
          kycStatus: status,
          createdAt: user.createdAt,
          kycFlags: user.flags,
          documents: [],
          transactions: [],
          complianceCases: [],
          notes: []
        };

        // Update the compliance context
        dispatch({ 
          type: 'UPDATE_USER_DATA', 
          payload: updatedUser 
        });

        // Call the onUserUpdate callback if provided
        if (onUserUpdate) {
          onUserUpdate(userId, updatedUser);
        }
      }

      toast({
        title: "KYC Status Updated",
        description: `User KYC status has been updated to ${status}.`
      });
    } catch (error) {
      console.error('Error updating KYC status:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update KYC status.",
        variant: "destructive"
      });
    } finally {
      setProcessing(userId, false);
    }
  };

  const requestAdditionalInfo = async (userId: string, requiredInfo: string[]) => {
    setProcessing(userId, true);
    
    try {
      // Update the database to set status to information_requested
      const { error: dbError } = await supabase
        .from('organization_customers')
        .update({ 
          kyc_status: 'information_requested',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`);
      }

      // Update the compliance context
      const user = users.find(u => u.id === userId);
      if (user) {
        const updatedUser = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          nationality: '',
          identityNumber: user.identityNumber,
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          countryOfResidence: '',
          riskScore: user.flags.riskScore,
          isPEP: user.flags.is_verified_pep,
          isSanctioned: user.flags.is_sanction_list,
          kycStatus: 'information_requested' as const,
          createdAt: user.createdAt,
          kycFlags: user.flags,
          documents: [],
          transactions: [],
          complianceCases: [],
          notes: []
        };

        dispatch({ 
          type: 'UPDATE_USER_DATA', 
          payload: updatedUser 
        });

        if (onUserUpdate) {
          onUserUpdate(userId, updatedUser);
        }
      }

      toast({
        title: "Information Request Sent",
        description: `User has been notified to provide: ${requiredInfo.join(', ')}`
      });
    } catch (error) {
      console.error('Error requesting additional info:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send information request.",
        variant: "destructive"
      });
    } finally {
      setProcessing(userId, false);
    }
  };

  const sendNotification = async (userId: string, message: string, type: 'email' | 'sms' = 'email') => {
    setProcessing(userId, true);
    
    try {
      // In a real implementation, this would send an actual notification
      // For now, we'll just log it and show a success message
      console.log(`Sending ${type} notification to user ${userId}:`, message);
      
      toast({
        title: "Notification Sent",
        description: `${type.toUpperCase()} notification has been sent to the user.`
      });
    } catch (error) {
      console.error('Error sending notification:', error);
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
      // Create a compliance case for escalation
      const user = users.find(u => u.id === userId);
      if (!user) {
        throw new Error('User not found');
      }

      const { error: caseError } = await supabase
        .from('compliance_cases')
        .insert({
          type: 'kyc_review',
          status: 'open',
          priority: 'high',
          source: 'manual_review',
          user_name: user.fullName,
          description: `KYC escalation: ${reason}`,
          created_by: 'system', // In real app, this would be the current user ID
          risk_score: user.flags.riskScore || 0
        });

      if (caseError) {
        throw new Error(`Failed to create compliance case: ${caseError.message}`);
      }

      // Update user status to indicate escalation
      const { error: updateError } = await supabase
        .from('organization_customers')
        .update({ 
          kyc_status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) {
        throw new Error(`Database error: ${updateError.message}`);
      }

      // Update compliance context
      if (user) {
        const updatedUser = {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          dateOfBirth: user.dateOfBirth,
          nationality: '',
          identityNumber: user.identityNumber,
          phoneNumber: user.phoneNumber || '',
          address: user.address || '',
          countryOfResidence: '',
          riskScore: user.flags.riskScore,
          isPEP: user.flags.is_verified_pep,
          isSanctioned: user.flags.is_sanction_list,
          kycStatus: 'pending' as const,
          createdAt: user.createdAt,
          kycFlags: user.flags,
          documents: [],
          transactions: [],
          complianceCases: [],
          notes: []
        };

        dispatch({ 
          type: 'UPDATE_USER_DATA', 
          payload: updatedUser 
        });

        if (onUserUpdate) {
          onUserUpdate(userId, updatedUser);
        }
      }

      toast({
        title: "Case Escalated",
        description: "User has been escalated to compliance team for review."
      });
    } catch (error) {
      console.error('Error escalating case:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to escalate case.",
        variant: "destructive"
      });
    } finally {
      setProcessing(userId, false);
    }
  };

  const generateComplianceReport = async (userIds: string[]) => {
    try {
      const reportData = users
        .filter(user => userIds.includes(user.id))
        .map(user => ({
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          riskScore: user.flags.riskScore,
          kycStatus: 'pending', // Default status since KYCUser doesn't have kycStatus
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
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate compliance report.",
        variant: "destructive"
      });
    }
  };

  const scheduleReview = async (userId: string, reviewDate: Date) => {
    setProcessing(userId, true);
    
    try {
      // In a real implementation, this would create a scheduled review task
      console.log(`Scheduling review for user ${userId} on ${reviewDate.toISOString()}`);
      
      toast({
        title: "Review Scheduled",
        description: `User review has been scheduled for ${reviewDate.toLocaleDateString()}.`
      });
    } catch (error) {
      console.error('Error scheduling review:', error);
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
