
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAMLMetrics } from '../useAMLMetrics';
import { AMLTransaction } from '@/types/aml';

const mockTransactions: AMLTransaction[] = [
  {
    id: '1',
    senderUserId: 'user1',
    receiverUserId: 'user2',
    senderAmount: 5000,
    receiverAmount: 5000,
    senderCurrency: 'USD',
    receiverCurrency: 'USD',
    senderCountryCode: 'US',
    receiverCountryCode: 'CA',
    timestamp: '2024-01-01T10:00:00Z',
    method: 'bank_transfer',
    status: 'completed',
    riskScore: 45,
    isSuspect: false,
    notes: ''
  },
  {
    id: '2',
    senderUserId: 'user3',
    receiverUserId: 'user4',
    senderAmount: 25000,
    receiverAmount: 25000,
    senderCurrency: 'USD',
    receiverCurrency: 'USD',
    senderCountryCode: 'US',
    receiverCountryCode: 'RU',
    timestamp: '2024-01-02T14:00:00Z',
    method: 'crypto',
    status: 'completed',
    riskScore: 85,
    isSuspect: true,
    notes: 'High risk crypto transaction'
  },
  {
    id: '3',
    senderUserId: 'user5',
    receiverUserId: 'user6',
    senderAmount: 15000,
    receiverAmount: 15000,
    senderCurrency: 'EUR',
    receiverCurrency: 'EUR',
    senderCountryCode: 'DE',
    receiverCountryCode: 'FR',
    timestamp: '2024-01-03T16:00:00Z',
    method: 'wire_transfer',
    status: 'pending',
    riskScore: 75,
    isSuspect: true,
    notes: ''
  }
];

describe('useAMLMetrics', () => {
  it('should calculate metrics correctly', () => {
    const { result } = renderHook(() => useAMLMetrics(mockTransactions));

    const metrics = result.current;

    expect(metrics.totalTransactions).toBe(3);
    expect(metrics.flaggedTransactions).toBe(2);
    expect(metrics.highRiskTransactions).toBe(2);
    expect(metrics.totalAmount).toBe(45000);
  });

  it('should handle empty transaction array', () => {
    const { result } = renderHook(() => useAMLMetrics([]));

    const metrics = result.current;

    expect(metrics.totalTransactions).toBe(0);
    expect(metrics.flaggedTransactions).toBe(0);
    expect(metrics.highRiskTransactions).toBe(0);
    expect(metrics.totalAmount).toBe(0);
  });

  it('should update when transactions change', () => {
    const { result, rerender } = renderHook(
      ({ transactions }) => useAMLMetrics(transactions),
      { initialProps: { transactions: mockTransactions } }
    );

    expect(result.current.totalTransactions).toBe(3);

    const newTransactions = mockTransactions.slice(0, 1);
    rerender({ transactions: newTransactions });

    expect(result.current.totalTransactions).toBe(1);
    expect(result.current.flaggedTransactions).toBe(0);
    expect(result.current.totalAmount).toBe(5000);
  });

  it('should correctly identify high risk transactions', () => {
    const highRiskTransactions = mockTransactions.filter(t => t.riskScore >= 70);
    const { result } = renderHook(() => useAMLMetrics(highRiskTransactions));

    expect(result.current.totalTransactions).toBe(2);
    expect(result.current.highRiskTransactions).toBe(2);
  });
});
