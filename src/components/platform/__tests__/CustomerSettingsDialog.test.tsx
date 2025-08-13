import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CustomerSettingsDialog } from '@/components/platform/CustomerSettingsDialog';

const deleteCustomer = vi.fn();
const updateCustomer = vi.fn();

vi.mock('@/services/supabasePlatformRoleService', () => ({
  SupabasePlatformRoleService: {
    deleteCustomer: (...args: any[]) => deleteCustomer(...args),
    updateCustomer: (...args: any[]) => updateCustomer(...args),
  }
}));

vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));

const mockCustomer = {
  id: 'cust-1',
  name: 'Acme Corp',
  domain: 'acme.com',
  subscription_tier: 'basic',
  settings: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('CustomerSettingsDialog', () => {
  beforeEach(() => vi.clearAllMocks());

  it('confirms and deletes customer', async () => {
    deleteCustomer.mockResolvedValueOnce(undefined);

    render(
      <CustomerSettingsDialog customer={mockCustomer as any} open onOpenChange={() => {}} />
    );

    // Open delete dialog (first button occurrence)
    fireEvent.click(screen.getAllByText('Delete Customer')[0]);

    // Confirm in dialog (last button occurrence)
    const all = await screen.findAllByText('Delete Customer');
    fireEvent.click(all[all.length - 1]);

    await waitFor(() => {
      expect(deleteCustomer).toHaveBeenCalledWith('cust-1');
    });
  });
});


