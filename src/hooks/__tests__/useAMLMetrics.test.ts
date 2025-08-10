
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useAMLMetrics } from '../useAMLMetrics';

describe('useAMLMetrics', () => {
  it('should return loading state initially', () => {
    const { result } = renderHook(() => useAMLMetrics('30d'));
    
    expect(result.current.loading).toBe(true);
    expect(result.current.totalTransactions).toBe(0);
  });

  it('should return metrics after loading', async () => {
    const { result } = renderHook(() => useAMLMetrics('30d'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.totalTransactions).toBe(1250);
    expect(result.current.flaggedTransactions).toBe(45);
    expect(result.current.highRiskTransactions).toBe(12);
    expect(result.current.totalAmount).toBe(2500000);
  });
});
