
/// <reference types="vitest/globals" />

import React from 'react';
import { render, screen } from '@testing-library/react';
import RiskBadge from './RiskBadge';

// Mock the child Badge component to isolate RiskBadge's logic.
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ className, children }: { className: string; children: React.ReactNode }) => (
    <div data-testid="badge" className={className}>
      {children}
    </div>
  ),
}));

describe('RiskBadge', () => {
  it('renders low risk correctly (score <= 30)', () => {
    render(<RiskBadge score={25} />);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveTextContent('25');
    expect(badge).toHaveClass('bg-green-100 text-green-800');
    expect(screen.queryByText(/Low/)).toBeNull();
  });

  it('renders medium risk correctly (30 < score <= 70)', () => {
    render(<RiskBadge score={50} />);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveTextContent('50');
    expect(badge).toHaveClass('bg-yellow-100 text-yellow-800');
  });

  it('renders high risk correctly (score > 70)', () => {
    render(<RiskBadge score={80} />);
    const badge = screen.getByTestId('badge');
    expect(badge).toHaveTextContent('80');
    expect(badge).toHaveClass('bg-red-100 text-red-800');
  });

  it('shows risk level text when showText is true for high risk', () => {
    render(<RiskBadge score={80} showText={true} />);
    expect(screen.getByTestId('badge')).toHaveTextContent('80 - High');
  });

  it('shows risk level text when showText is true for medium risk', () => {
    render(<RiskBadge score={50} showText={true} />);
    expect(screen.getByTestId('badge')).toHaveTextContent('50 - Medium');
  });

  it('shows risk level text when showText is true for low risk', () => {
    render(<RiskBadge score={25} showText={true} />);
    expect(screen.getByTestId('badge')).toHaveTextContent('25 - Low');
  });
});
