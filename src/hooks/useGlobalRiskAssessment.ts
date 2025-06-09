
import { useState } from 'react';
import { evaluateTransactionRisk, evaluateUserRisk } from '@/services/riskScoringService';
import { useCompliance } from '@/context/compliance';
import { useToast } from '@/hooks/use-toast';
import { getMockTransactions, getMockUsers } from '@/utils/mockAssessmentData';

export function useGlobalRiskAssessment() {
  const [runningAssessment, setRunningAssessment] = useState(false);
  const { state } = useCompliance();
  const { toast } = useToast();

  const runGlobalAssessment = async () => {
    setRunningAssessment(true);
    try {
      let totalAssessments = 0;
      let successfulAssessments = 0;

      console.log('Starting global risk assessment...');

      // Get users from centralized mock data
      const mockUsers = getMockUsers();
      console.log('Available mock users:', mockUsers.length);

      // Use mock users if state users are empty, otherwise use state users
      const usersToAssess = state.users.length > 0 ? state.users : mockUsers;
      console.log('Users to assess:', usersToAssess.length);

      // Run assessments for all users
      for (const user of usersToAssess) {
        try {
          totalAssessments++;
          console.log(`Assessing user: ${user.fullName} (${user.id}) - Risk Score: ${user.riskScore}`);
          const result = await evaluateUserRisk(user);
          console.log(`User ${user.fullName} assessment result:`, result);
          successfulAssessments++;
        } catch (error) {
          console.error(`Error assessing user ${user.id}:`, error);
        }
      }

      // Get transactions from centralized mock data
      const mockTransactions = getMockTransactions();
      console.log('Available mock transactions:', mockTransactions.length);

      // Run assessments for all transactions
      for (const transaction of mockTransactions) {
        try {
          totalAssessments++;
          console.log(`Assessing transaction: ${transaction.id} - Amount: ${transaction.senderAmount} ${transaction.senderCurrency} - Risk Score: ${transaction.riskScore}`);
          const result = await evaluateTransactionRisk(transaction);
          console.log(`Transaction ${transaction.id} assessment result:`, result);
          successfulAssessments++;
        } catch (error) {
          console.error(`Error assessing transaction ${transaction.id}:`, error);
        }
      }

      console.log(`Assessment completed: ${successfulAssessments}/${totalAssessments} successful`);

      toast({
        title: 'Assessment Complete',
        description: `Successfully assessed ${successfulAssessments} out of ${totalAssessments} entities (${usersToAssess.length} users, ${mockTransactions.length} transactions)`,
      });
    } catch (error) {
      console.error('Error running global assessment:', error);
      toast({
        title: 'Assessment Error',
        description: `Failed to complete risk assessment: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      });
    } finally {
      setRunningAssessment(false);
    }
  };

  return {
    runGlobalAssessment,
    runningAssessment
  };
}
