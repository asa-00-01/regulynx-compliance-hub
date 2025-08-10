
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RiskBadge, { getRiskLevelFromScore } from '../RiskBadge';

describe('RiskBadge', () => {
  it('renders low risk badge correctly', () => {
    render(<RiskBadge riskLevel="low" />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  it('renders medium risk badge correctly', () => {
    render(<RiskBadge riskLevel="medium" />);
    expect(screen.getByText('Medium')).toBeInTheDocument();
  });

  it('renders high risk badge correctly', () => {
    render(<RiskBadge riskLevel="high" />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders critical risk badge correctly', () => {
    render(<RiskBadge riskLevel="critical" />);
    expect(screen.getByText('Critical')).toBeInTheDocument();
  });

  it('renders without text when showText is false', () => {
    render(<RiskBadge riskLevel="high" showText={false} />);
    expect(screen.queryByText('High')).not.toBeInTheDocument();
  });

  it('renders with text when showText is true', () => {
    render(<RiskBadge riskLevel="low" showText={true} />);
    expect(screen.getByText('Low')).toBeInTheDocument();
  });

  describe('getRiskLevelFromScore', () => {
    it('returns correct risk levels for different scores', () => {
      expect(getRiskLevelFromScore(95)).toBe('critical');
      expect(getRiskLevelFromScore(75)).toBe('high');
      expect(getRiskLevelFromScore(50)).toBe('medium');
      expect(getRiskLevelFromScore(25)).toBe('low');
    });
  });
});
