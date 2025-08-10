import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRoleBasedAccess } from '../useRoleBasedAccess';
import * as AuthContext from '@/context/AuthContext';

// Mock the AuthContext
vi.mock('@/context/AuthContext');

const mockUser = {
  id: 'user-1',
  email: 'admin@test.com',
  role: 'admin' as const,
  customer_roles: ['customer_admin'],
  // ... other user properties
};

describe('useRoleBasedAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should grant admin permissions for admin role', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
      // ... other auth properties
    } as any);

    const { result } = renderHook(() => useRoleBasedAccess());

    expect(result.current.hasPermission('user:create')).toBe(true);
    expect(result.current.hasPermission('case:create')).toBe(true);
    expect(result.current.hasPermission('document:approve')).toBe(true);
    expect(result.current.hasPermission('settings:admin')).toBe(true);
  });

  it('should restrict support role permissions', () => {
    const supportUser = {
      ...mockUser,
      role: 'support' as const,
      customer_roles: ['customer_support'],
    };

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: supportUser,
    } as any);

    const { result } = renderHook(() => useRoleBasedAccess());

    expect(result.current.hasPermission('document:view')).toBe(true);
    expect(result.current.hasPermission('case:view')).toBe(true);
    expect(result.current.hasPermission('user:create')).toBe(false);
    expect(result.current.hasPermission('document:approve')).toBe(false);
    expect(result.current.hasPermission('settings:admin')).toBe(false);
  });

  it('should handle compliance officer permissions', () => {
    const complianceUser = {
      ...mockUser,
      role: 'complianceOfficer' as const,
      customer_roles: ['customer_compliance'],
    };

    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: complianceUser,
    } as any);

    const { result } = renderHook(() => useRoleBasedAccess());

    expect(result.current.hasPermission('document:approve')).toBe(true);
    expect(result.current.hasPermission('case:create')).toBe(true);
    expect(result.current.hasPermission('report:generate')).toBe(true);
    expect(result.current.hasPermission('user:create')).toBe(false);
    expect(result.current.hasPermission('settings:admin')).toBe(false);
  });

  it('should check multiple permissions with hasAnyPermission', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: mockUser,
    } as any);

    const { result } = renderHook(() => useRoleBasedAccess());

    expect(result.current.hasAnyPermission(['user:create', 'case:create'])).toBe(true);
    expect(result.current.hasAnyPermission(['nonexistent:permission'])).toBe(false);
  });

  it('should return false for all permissions when no user', () => {
    vi.mocked(AuthContext.useAuth).mockReturnValue({
      user: null,
    } as any);

    const { result } = renderHook(() => useRoleBasedAccess());

    expect(result.current.hasPermission('user:create')).toBe(false);
    expect(result.current.hasPermission('document:view')).toBe(false);
  });
});
