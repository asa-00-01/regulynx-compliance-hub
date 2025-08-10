
import { renderHook, waitFor } from '@testing-library/react';
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
      expect(result.current.metrics).toBeDefined();
      expect(result.current.isLoading).toBe(false);
    });
  });
});
