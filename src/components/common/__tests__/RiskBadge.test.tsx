
import { render } from '@/test-utils';
import { describe, it, expect } from 'vitest';
import RiskBadge, { getRiskLevelFromScore } from '../RiskBadge';

describe('RiskBadge', () => {
  it('renders low risk badge correctly', () => {
    const { getByText } = render(<RiskBadge riskLevel="low" />);
    expect(getByText('Low')).toBeInTheDocument();
  });

  it('renders medium risk badge correctly', () => {
    const { getByText } = render(<RiskBadge riskLevel="medium" />);
    expect(getByText('Medium')).toBeInTheDocument();
  });

  it('renders high risk badge correctly', () => {
    const { getByText } = render(<RiskBadge riskLevel="high" />);
    expect(getByText('High')).toBeInTheDocument();
  });

  it('renders critical risk badge correctly', () => {
    const { getByText } = render(<RiskBadge riskLevel="critical" />);
    expect(getByText('Critical')).toBeInTheDocument();
  });

  it('renders without text when showText is false', () => {
    const { queryByText } = render(<RiskBadge riskLevel="high" showText={false} />);
    expect(queryByText('High')).not.toBeInTheDocument();
  });

  it('renders with text when showText is true', () => {
    const { getByText } = render(<RiskBadge riskLevel="low" showText={true} />);
    expect(getByText('Low')).toBeInTheDocument();
  });

  it('renders with score prop', () => {
    const { getByText } = render(<RiskBadge score={75} />);
    expect(getByText('75 - High Risk')).toBeInTheDocument();
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
