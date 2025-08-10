
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRiskScoring } from '../useRiskScoring';

// Mock the centralized mock data
vi.mock('@/mocks/centralizedMockData', () => ({
  unifiedMockData: [
    {
      id: 'user-1',
      fullName: 'John Doe',
      countryOfResidence: 'US',
      transactions: [
        { senderAmount: 5000 },
        { senderAmount: 15000 }
      ],
      kycStatus: 'verified'
    },
    {
      id: 'user-2',
      fullName: 'Jane Smith',
      countryOfResidence: 'AF', // High-risk country
      transactions: Array(20).fill({ senderAmount: 25000 }), // High frequency, high amount
      kycStatus: 'rejected'
    }
  ]
}));

describe('useRiskScoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate risk scores correctly', () => {
    const { result } = renderHook(() => useRiskScoring());

    expect(result.current.usersWithRiskScores).toHaveLength(2);
    
    const johnDoe = result.current.usersWithRiskScores.find(u => u.name === 'John Doe');
    const janeSmith = result.current.usersWithRiskScores.find(u => u.name === 'Jane Smith');

    expect(johnDoe).toBeDefined();
    expect(janeSmith).toBeDefined();

    // John Doe should have lower risk (US, verified KYC, moderate amounts)
    expect(johnDoe!.riskScore).toBeLessThan(janeSmith!.riskScore);
    
    // Jane Smith should have high risk (Afghanistan, rejected KYC, high amounts, high frequency)
    expect(janeSmith!.riskScore).toBeGreaterThan(70);
  });

  it('should calculate risk distribution correctly', () => {
    const { result } = renderHook(() => useRiskScoring());

    const { riskDistribution } = result.current;
    
    expect(riskDistribution).toHaveLength(3);
    expect(riskDistribution.find(d => d.name === 'Low Risk (0-30)')).toBeDefined();
    expect(riskDistribution.find(d => d.name === 'Medium Risk (31-70)')).toBeDefined();
    expect(riskDistribution.find(d => d.name === 'High Risk (71-100)')).toBeDefined();

    // Check that total users equals sum of distribution
    const totalUsers = riskDistribution.reduce((sum, d) => sum + d.value, 0);
    expect(totalUsers).toBe(2);
  });

  it('should provide correct CSS classes for risk scores', () => {
    const { result } = renderHook(() => useRiskScoring());

    const { getRiskScoreClass } = result.current;

    expect(getRiskScoreClass(20)).toBe('bg-green-100 text-green-800');
    expect(getRiskScoreClass(50)).toBe('bg-yellow-100 text-yellow-800');
    expect(getRiskScoreClass(80)).toBe('bg-red-100 text-red-800');
  });

  it('should handle edge cases in risk calculation', () => {
    const { result } = renderHook(() => useRiskScoring());

    const users = result.current.usersWithRiskScores;
    
    // All users should have risk scores between 0 and 100
    users.forEach(user => {
      expect(user.riskScore).toBeGreaterThanOrEqual(0);
      expect(user.riskScore).toBeLessThanOrEqual(100);
    });

    // All users should have previous scores for trend analysis
    users.forEach(user => {
      expect(user.previousScore).toBeGreaterThanOrEqual(0);
      expect(user.previousScore).toBeLessThanOrEqual(100);
    });
  });
});
