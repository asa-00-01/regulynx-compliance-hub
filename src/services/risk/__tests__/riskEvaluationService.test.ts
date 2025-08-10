
import { describe, it, expect } from 'vitest';
import { evaluateUserRisk, evaluateTransactionRisk } from '../riskEvaluationService';

describe('Risk Evaluation Service', () => {
  describe('evaluateUserRisk', () => {
    it('should calculate low risk correctly', () => {
      const factors = [
        { name: 'credit', value: 10, weight: 1 },
        { name: 'history', value: 20, weight: 0.5 }
      ];
      
      const result = evaluateUserRisk('user1', factors);
      
      expect(result.score).toBe(20);
      expect(result.level).toBe('low');
      expect(result.factors).toEqual(factors);
    });

    it('should calculate high risk correctly', () => {
      const factors = [
        { name: 'credit', value: 80, weight: 1 },
        { name: 'history', value: 60, weight: 0.5 }
      ];
      
      const result = evaluateUserRisk('user1', factors);
      
      expect(result.score).toBe(110);
      expect(result.level).toBe('critical');
    });
  });

  describe('evaluateTransactionRisk', () => {
    it('should evaluate transaction risk correctly', () => {
      const transactionData = {
        userId: 'user1',
        amount: 15000,
        frequency: 15,
        highRiskCountry: true
      };
      
      const result = evaluateTransactionRisk(transactionData);
      
      expect(result.level).toBe('critical');
      expect(result.score).toBeGreaterThan(80);
    });
  });
});
