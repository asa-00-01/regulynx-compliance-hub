
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RiskBadge from '../RiskBadge';

describe('RiskBadge', () => {
  it('renders low risk badge correctly', () => {
    render(<RiskBadge riskLevel="low" />);
    expect(screen.getByText('LOW')).toBeInTheDocument();
  });

  it('renders medium risk badge correctly', () => {
    render(<RiskBadge riskLevel="medium" />);
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
  });

  it('renders high risk badge correctly', () => {
    render(<RiskBadge riskLevel="high" />);
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  it('renders critical risk badge correctly', () => {
    render(<RiskBadge riskLevel="critical" />);
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });
});
