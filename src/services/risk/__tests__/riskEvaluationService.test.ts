
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { evaluateTransactionRisk, evaluateUserRisk } from '../riskEvaluationService';
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';
import * as riskDataAccess from '../riskDataAccess';
import * as ruleEngineModule from '../../ruleEngine';

// Mock dependencies
vi.mock('../riskDataAccess');
vi.mock('../../ruleEngine');

const mockRules = [
  {
    rule_id: 'rule-1',
    rule_name: 'High Amount Transaction',
    description: 'Flags transactions over $10,000',
    category: 'transaction',
    risk_score: 25,
    condition: { '>': [{ var: 'amount' }, 10000] },
    is_active: true,
  },
  {
    rule_id: 'rule-2',
    rule_name: 'PEP Check',
    description: 'Flags PEP users',
    category: 'kyc',
    risk_score: 50,
    condition: { '==': [{ var: 'is_pep' }, true] },
    is_active: true,
  },
];

const mockTransaction: AMLTransaction = {
  id: 'tx-1',
  senderUserId: 'user-1',
  receiverUserId: 'user-2',
  senderAmount: 15000,
  receiverAmount: 15000,
  senderCurrency: 'USD',
  receiverCurrency: 'USD',
  senderCountryCode: 'US',
  receiverCountryCode: 'CA',
  timestamp: new Date().toISOString(),
  method: 'bank_transfer',
  status: 'completed',
  riskScore: 0,
  isSuspect: false,
  notes: '',
};

const mockUser: UnifiedUserData = {
  id: 'user-1',
  fullName: 'John Doe',
  email: 'john@example.com',
  dateOfBirth: '1990-01-01',
  countryOfResidence: 'US',
  kycStatus: 'verified',
  isPEP: true,
  isSanctioned: false,
  riskScore: 0,
  documents: [],
  transactions: [],
  complianceCases: [],
};

describe('Risk Evaluation Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('evaluateTransactionRisk', () => {
    it('should evaluate transaction risk and return matched rules', async () => {
      // Mock fetchActiveRules to return mock rules
      vi.mocked(riskDataAccess.fetchActiveRules).mockResolvedValue(mockRules.filter(r => r.category === 'transaction'));
      
      // Mock evaluateCondition to return true for high amount rule
      vi.mocked(ruleEngineModule.evaluateCondition).mockReturnValue(true);
      
      // Mock storeRiskMatch
      vi.mocked(riskDataAccess.storeRiskMatch).mockResolvedValue();

      const result = await evaluateTransactionRisk(mockTransaction);

      expect(result.total_risk_score).toBe(25);
      expect(result.matched_rules).toHaveLength(1);
      expect(result.matched_rules[0].rule_name).toBe('High Amount Transaction');
      expect(result.rule_categories).toContain('transaction');
      
      expect(riskDataAccess.fetchActiveRules).toHaveBeenCalledWith(['transaction', 'behavioral']);
      expect(riskDataAccess.storeRiskMatch).toHaveBeenCalledWith(
        mockTransaction.id,
        'transaction',
        'rule-1',
        expect.any(Object)
      );
    });

    it('should handle no matching rules', async () => {
      vi.mocked(riskDataAccess.fetchActiveRules).mockResolvedValue(mockRules.filter(r => r.category === 'transaction'));
      vi.mocked(ruleEngineModule.evaluateCondition).mockReturnValue(false);

      const result = await evaluateTransactionRisk(mockTransaction);

      expect(result.total_risk_score).toBe(0);
      expect(result.matched_rules).toHaveLength(0);
      expect(result.rule_categories).toHaveLength(0);
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(riskDataAccess.fetchActiveRules).mockRejectedValue(new Error('Database error'));

      const result = await evaluateTransactionRisk(mockTransaction);

      expect(result.total_risk_score).toBe(0);
      expect(result.matched_rules).toHaveLength(0);
    });

    it('should cap risk score at 100', async () => {
      const highRiskRules = Array(10).fill(null).map((_, i) => ({
        ...mockRules[0],
        rule_id: `rule-${i}`,
        risk_score: 15,
      }));
      
      vi.mocked(riskDataAccess.fetchActiveRules).mockResolvedValue(highRiskRules);
      vi.mocked(ruleEngineModule.evaluateCondition).mockReturnValue(true);
      vi.mocked(riskDataAccess.storeRiskMatch).mockResolvedValue();

      const result = await evaluateTransactionRisk(mockTransaction);

      expect(result.total_risk_score).toBe(100);
    });
  });

  describe('evaluateUserRisk', () => {
    it('should evaluate user risk for PEP users', async () => {
      vi.mocked(riskDataAccess.fetchActiveRules).mockResolvedValue(mockRules.filter(r => r.category === 'kyc'));
      vi.mocked(ruleEngineModule.evaluateCondition).mockReturnValue(true);
      vi.mocked(riskDataAccess.storeRiskMatch).mockResolvedValue();

      const result = await evaluateUserRisk(mockUser);

      expect(result.total_risk_score).toBe(50);
      expect(result.matched_rules).toHaveLength(1);
      expect(result.matched_rules[0].rule_name).toBe('PEP Check');
      
      expect(riskDataAccess.fetchActiveRules).toHaveBeenCalledWith(['kyc']);
    });

    it('should handle non-PEP users', async () => {
      const nonPepUser = { ...mockUser, isPEP: false };
      
      vi.mocked(riskDataAccess.fetchActiveRules).mockResolvedValue(mockRules.filter(r => r.category === 'kyc'));
      vi.mocked(ruleEngineModule.evaluateCondition).mockReturnValue(false);

      const result = await evaluateUserRisk(nonPepUser);

      expect(result.total_risk_score).toBe(0);
      expect(result.matched_rules).toHaveLength(0);
    });
  });
});
