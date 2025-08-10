
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { complianceCaseService } from '../service';
import { supabase } from '@/integrations/supabase/client';
import { ComplianceCaseDetails, CaseFilters } from '@/types/case';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          in: vi.fn(() => ({
            gte: vi.fn(() => ({
              lte: vi.fn(() => ({
                or: vi.fn(() => ({
                  order: vi.fn(() => ({ data: [], error: null }))
                }))
              }))
            }))
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => ({ data: null, error: null }))
          }))
        })),
        order: vi.fn(() => ({ data: [], error: null }))
      }))
    }))
  }
}));

const mockCaseData: Partial<ComplianceCaseDetails> = {
  userId: 'user-123',
  userName: 'John Doe',
  type: 'kyc',
  status: 'open',
  riskScore: 75,
  description: 'High risk KYC review',
  priority: 'high',
  source: 'kyc_flag'
};

describe('Compliance Case Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchCases', () => {
    it('should fetch cases with no filters', async () => {
      const mockData = [
        {
          id: 'case-1',
          user_id: 'user-1',
          user_name: 'John Doe',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
          type: 'kyc',
          status: 'open',
          risk_score: 75,
          description: 'Test case',
          priority: 'high',
          source: 'manual'
        }
      ];

      const mockQuery = {
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: mockData, error: null })
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any);

      const filters: CaseFilters = {};
      const result = await complianceCaseService.fetchCases(filters);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('case-1');
      expect(result[0].userName).toBe('John Doe');
    });

    it('should apply status filters correctly', async () => {
      const mockQuery = {
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null })
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any);

      const filters: CaseFilters = {
        status: ['under_review', 'escalated']
      };

      await complianceCaseService.fetchCases(filters);

      expect(mockQuery.in).toHaveBeenCalledWith('status', ['in_progress']);
    });

    it('should handle database errors', async () => {
      const mockQuery = {
        in: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gte: vi.fn().mockReturnThis(),
        lte: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
      };

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue(mockQuery)
      } as any);

      await expect(complianceCaseService.fetchCases({})).rejects.toThrow();
    });
  });

  describe('createCase', () => {
    it('should create a new case successfully', async () => {
      const mockCreatedCase = {
        id: 'case-123',
        user_id: 'user-123',
        user_name: 'John Doe',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
        type: 'kyc',
        status: 'open',
        risk_score: 75,
        description: 'High risk KYC review',
        priority: 'high',
        source: 'kyc_flag',
        created_by: null,
        assigned_to: null,
        assigned_to_name: null,
        related_transactions: null,
        related_alerts: null,
        documents: null
      };

      const mockInsertQuery = {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: mockCreatedCase, error: null })
        })
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockInsertQuery)
      } as any);

      const result = await complianceCaseService.createCase(mockCaseData);

      expect(result.id).toBe('case-123');
      expect(result.userName).toBe('John Doe');
      expect(result.riskScore).toBe(75);
    });

    it('should handle invalid UUID fields', async () => {
      const caseDataWithInvalidUuid = {
        ...mockCaseData,
        assignedTo: 'admin_001', // Invalid UUID format
        createdBy: 'system_user'
      };

      const mockInsertQuery = {
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      };

      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnValue(mockInsertQuery)
      } as any);

      // Should not throw error, invalid UUIDs should be converted to null
      await expect(complianceCaseService.createCase(caseDataWithInvalidUuid)).resolves.toBeDefined();
    });
  });
});
