
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

      // Run assessments for all users
      for (const user of state.users) {
        try {
          totalAssessments++;
          console.log(`Assessing user: ${user.fullName}`);
          const result = await evaluateUserRisk(user);
          console.log(`User ${user.fullName} assessment result:`, result);
          successfulAssessments++;
        } catch (error) {
          console.error(`Error assessing user ${user.id}:`, error);
        }
      }

      // Get mock transactions and run assessments
      const mockTransactions = getMockTransactions();
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

      toast({
        title: 'Assessment Complete',
        description: `Successfully assessed ${successfulAssessments} out of ${totalAssessments} entities`,
      });

      console.log(`Global assessment completed: ${successfulAssessments}/${totalAssessments} successful`);
    } catch (error) {
      console.error('Error running global assessment:', error);
      toast({
        title: 'Assessment Error',
        description: 'Failed to complete risk assessment',
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
