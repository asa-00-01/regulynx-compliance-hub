
import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useRoleBasedAccess } from '../useRoleBasedAccess';

// Mock the auth context
vi.mock('@/context/AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'admin' }
  })
}));

describe('useRoleBasedAccess', () => {
  it('should return admin permissions correctly', () => {
    const { result } = renderHook(() => useRoleBasedAccess());
    
    expect(result.current.isAdmin).toBe(true);
    expect(result.current.hasCustomerPermission('cases:read')).toBe(true);
    expect(result.current.hasCustomerPermission('cases:write')).toBe(true);
    expect(result.current.hasCustomerPermission('users:read')).toBe(true);
    expect(result.current.hasPlatformPermission('admin:read')).toBe(true);
  });

  it('should handle route access correctly', () => {
    const { result } = renderHook(() => useRoleBasedAccess());
    
    expect(result.current.canAccessRoute('/admin')).toBe(true);
    expect(result.current.canAccessRoute('/users')).toBe(true);
    expect(result.current.canAccessRoute('/cases')).toBe(true);
  });

  it('should handle action permissions correctly', () => {
    const { result } = renderHook(() => useRoleBasedAccess());
    
    expect(result.current.canPerformAction('create_case')).toBe(true);
    expect(result.current.canPerformAction('edit_user')).toBe(true);
  });
});
