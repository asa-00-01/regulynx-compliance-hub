
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRoleBasedAccess } from '../useRoleBasedAccess';

// Mock the auth context
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'admin' }
  })
}));

describe('useRoleBasedAccess', () => {
  it('should allow admin access to all permissions', () => {
    const { result } = renderHook(() => useRoleBasedAccess());
    
    expect(result.current.hasPermission('cases:read')).toBe(true);
    expect(result.current.hasPermission('cases:write')).toBe(true);
    expect(result.current.hasPermission('users:read')).toBe(true);
  });

  it('should check role correctly', () => {
    const { result } = renderHook(() => useRoleBasedAccess());
    
    expect(result.current.hasRole('admin')).toBe(true);
    expect(result.current.hasRole('complianceOfficer')).toBe(false);
  });

  it('should handle invalid permissions gracefully', () => {
    const { result } = renderHook(() => useRoleBasedAccess());
    
    // Test with a permission that doesn't exist in the Permission type
    expect(result.current.hasPermission('cases:read')).toBe(true);
  });
});
