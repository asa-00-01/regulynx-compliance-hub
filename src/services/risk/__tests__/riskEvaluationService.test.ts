
import { describe, it, expect } from 'vitest';
import { evaluateRisk } from '../riskEvaluationService';
import type { UnifiedUserData, Rule } from '@/types/compliance';

describe('Risk Evaluation Service', () => {
  const mockUser: UnifiedUserData = {
    id: '1',
    fullName: 'John Doe',
    email: 'john@example.com',
    dateOfBirth: '1990-01-01',
    nationality: 'US',
    identityNumber: '123456789',
    phoneNumber: '+1234567890',
    address: '123 Main St',
    countryOfResidence: 'US',
    kycStatus: 'verified',
    isPEP: true,
    isSanctioned: false,
    riskScore: 50,
    onboardingDate: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    documents: [],
    transactions: [],
    complianceCases: []
  };

  const mockRules: Rule[] = [
    {
      id: '1',
      rule_id: 'high_amount_transaction',
      rule_name: 'High Amount Transaction',
      description: 'Flag transactions over $10,000',
      category: 'transaction',
      risk_score: 50,
      condition: {
        '>': [{ var: 'amount' }, 10000]
      },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: '2',
      rule_id: 'pep_customer',
      rule_name: 'PEP Customer',
      description: 'Customer is a Politically Exposed Person',
      category: 'customer',
      risk_score: 75,
      condition: {
        '==': [{ var: 'isPEP' }, true]
      },
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];

  it('should evaluate high amount transaction risk', () => {
    const transactionData = { amount: 15000 };
    const result = evaluateRisk(transactionData, mockRules);
    
    expect(result.totalRiskScore).toBeGreaterThan(0);
    expect(result.triggeredRules).toContain('high_amount_transaction');
  });

  it('should evaluate PEP customer risk', () => {
    const result = evaluateRisk(mockUser, mockRules);
    
    expect(result.totalRiskScore).toBeGreaterThan(0);
    expect(result.triggeredRules).toContain('pep_customer');
  });

  it('should handle multiple triggered rules', () => {
    const complexData = { ...mockUser, amount: 15000 };
    const result = evaluateRisk(complexData, mockRules);
    
    expect(result.totalRiskScore).toBeGreaterThan(75);
    expect(result.triggeredRules.length).toBeGreaterThan(1);
  });

  it('should return zero risk for safe transactions', () => {
    const safeData = { amount: 100, isPEP: false };
    const result = evaluateRisk(safeData, mockRules);
    
    expect(result.totalRiskScore).toBe(0);
    expect(result.triggeredRules.length).toBe(0);
  });

  it('should handle empty rules array', () => {
    const result = evaluateRisk(mockUser, []);
    
    expect(result.totalRiskScore).toBe(0);
    expect(result.triggeredRules.length).toBe(0);
  });
});
