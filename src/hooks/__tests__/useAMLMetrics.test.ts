
import { renderHook, waitFor } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { useAMLMetrics } from '../useAMLMetrics';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  }
}));

describe('useAMLMetrics', () => {
  it('should return default metrics when no data', async () => {
    const { result } = renderHook(() => useAMLMetrics());
    
    await waitFor(() => {
      expect(result.current.totalTransactions).toBeDefined();
      expect(result.current.loading).toBe(false);
    });
  });

  it('should calculate metrics from provided transactions', async () => {
    const mockTransactions = [
      { 
        id: '1', 
        isSuspect: true, 
        riskScore: 80, 
        senderAmount: 1000,
        senderCurrency: 'USD',
        receiverAmount: 950,
        receiverCurrency: 'EUR',
        method: 'bank_transfer',
        status: 'completed',
        timestamp: new Date().toISOString(),
        senderUserId: 'user1',
        receiverUserId: 'user2',
        senderName: 'John Doe',
        receiverName: 'Jane Smith',
        senderCountryCode: 'US',
        receiverCountryCode: 'GB',
        flagged: false
      }
    ];
    
    const { result } = renderHook(() => useAMLMetrics(mockTransactions));
    
    await waitFor(() => {
      expect(result.current.totalTransactions).toBe(1);
      expect(result.current.loading).toBe(false);
    });
  });
});
