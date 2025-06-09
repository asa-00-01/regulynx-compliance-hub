
import { useState } from 'react';
import { evaluateTransactionRisk, evaluateUserRisk } from '@/services/riskScoringService';
import { useCompliance } from '@/context/compliance';
import { useToast } from '@/hooks/use-toast';
import { getMockTransactions } from '@/utils/mockAssessmentData';

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
      console.log('Available users:', state.users?.length || 0);

      // Check if we have users to assess
      if (!state.users || state.users.length === 0) {
        console.warn('No users found in state for assessment');
        toast({
          title: 'No Users Found',
          description: 'No users available for risk assessment',
          variant: 'destructive'
        });
        return;
      }

      // Run assessments for all users
      for (const user of state.users) {
        try {
          totalAssessments++;
          console.log(`Assessing user: ${user.fullName} (${user.id})`);
          const result = await evaluateUserRisk(user);
          console.log(`User ${user.fullName} assessment result:`, result);
          successfulAssessments++;
        } catch (error) {
          console.error(`Error assessing user ${user.id}:`, error);
        }
      }

      // Get mock transactions and run assessments
      console.log('Getting mock transactions...');
      const mockTransactions = getMockTransactions();
      console.log('Mock transactions count:', mockTransactions?.length || 0);

      if (!mockTransactions || mockTransactions.length === 0) {
        console.warn('No mock transactions found for assessment');
      } else {
        for (const transaction of mockTransactions) {
          try {
            totalAssessments++;
            console.log(`Assessing transaction: ${transaction.id}`);
            const result = await evaluateTransactionRisk(transaction);
            console.log(`Transaction ${transaction.id} assessment result:`, result);
            successfulAssessments++;
          } catch (error) {
            console.error(`Error assessing transaction ${transaction.id}:`, error);
          }
        }
      }

      console.log(`Assessment completed: ${successfulAssessments}/${totalAssessments} successful`);

      toast({
        title: 'Assessment Complete',
        description: `Successfully assessed ${successfulAssessments} out of ${totalAssessments} entities`,
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
