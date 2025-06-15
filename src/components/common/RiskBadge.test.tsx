
import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RiskBadge from './RiskBadge';

// Mock the child Badge component to check for the correct variant prop
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ variant, className, children }: { variant?: string; className: string; children: React.ReactNode }) => (
    <div data-testid="badge" data-variant={variant} className={className}>
      {children}
    </div>
  ),
}));

describe('RiskBadge', () => {
  it('renders minimal risk correctly (score < 25)', () => {
    const { getByTestId } = render(<RiskBadge score={10} />);
    const badge = getByTestId('badge');
    expect(badge).toHaveTextContent('10 - Minimal Risk');
    expect(badge).toHaveAttribute('data-variant', 'outline');
  });

  it('renders low risk correctly (25 <= score < 50)', () => {
    const { getByTestId } = render(<RiskBadge score={30} />);
    const badge = getByTestId('badge');
    expect(badge).toHaveTextContent('30 - Low Risk');
    expect(badge).toHaveAttribute('data-variant', 'secondary');
  });

  it('renders medium risk correctly (50 <= score < 75)', () => {
    const { getByTestId } = render(<RiskBadge score={60} />);
    const badge = getByTestId('badge');
    expect(badge).toHaveTextContent('60 - Medium Risk');
    expect(badge).toHaveAttribute('data-variant', 'warning');
  });

  it('renders high risk correctly (score >= 75)', () => {
    const { getByTestId } = render(<RiskBadge score={80} />);
    const badge = getByTestId('badge');
    expect(badge).toHaveTextContent('80 - High Risk');
    expect(badge).toHaveAttribute('data-variant', 'destructive');
  });

  it('hides risk level text when showText is false', () => {
    const { getByTestId } = render(<RiskBadge score={80} showText={false} />);
    const badge = getByTestId('badge');
    expect(badge).toHaveTextContent('80');
    expect(badge.textContent).not.toContain('-');
    expect(badge).toHaveAttribute('data-variant', 'destructive');
  });

  it('shows risk level text when showText is true', () => {
    const { getByTestId } = render(<RiskBadge score={25} showText={true} />);
    const badge = getByTestId('badge');
    expect(badge).toHaveTextContent('25 - Low Risk');
  });
});
