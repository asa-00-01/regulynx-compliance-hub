
import { renderHook } from '@/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { useRoleBasedAccess } from '../useRoleBasedAccess';

// Mock the auth context
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 'user1', role: 'platform_admin' }
  })
}));

describe('useRoleBasedAccess', () => {
  it('should return admin permissions correctly', () => {
    const { result } = renderHook(() => useRoleBasedAccess());
    
    expect(result.current.hasPermission('platform:admin')).toBe(true);
    expect(result.current.hasPermission('user:create')).toBe(true);
    expect(result.current.hasPermission('user:update')).toBe(true);
    expect(result.current.hasPermission('user:delete')).toBe(true);
    expect(result.current.hasPermission('case:create')).toBe(true);
  });

  it('should handle permissions correctly', () => {
    const { result } = renderHook(() => useRoleBasedAccess());
    
    expect(result.current.hasAnyPermission(['platform:admin', 'user:create'])).toBe(true);
    expect(result.current.hasAllPermissions(['platform:admin', 'user:create'])).toBe(true);
    expect(result.current.userPermissions.length).toBeGreaterThan(0);
  });
});
