import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PlatformUserManagement from '@/components/platform/PlatformUserManagement';

// Keep minimal mock to avoid async complexities
vi.mock('@/services/supabasePlatformRoleService', () => ({
  SupabasePlatformRoleService: {
    getPlatformUsers: vi.fn().mockResolvedValue([]),
  }
}));

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

describe('PlatformUserManagement (smoke)', () => {
  it('renders headings and actions', async () => {
    render(<PlatformUserManagement />);
    expect(await screen.findByText('Platform User Management')).toBeInTheDocument();
    expect(screen.getByText('Platform Users')).toBeInTheDocument();
    expect(screen.getByText('Customer User Overview')).toBeInTheDocument();
    expect(screen.getByText('Add Platform User')).toBeInTheDocument();
  });
});


