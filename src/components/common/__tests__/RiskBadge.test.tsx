
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RiskBadge from '../RiskBadge';

describe('RiskBadge', () => {
  it('renders low risk badge correctly', () => {
    const { container } = render(<RiskBadge risk="low" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders medium risk badge correctly', () => {
    const { container } = render(<RiskBadge risk="medium" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders high risk badge correctly', () => {
    const { container } = render(<RiskBadge risk="high" />);
    expect(container.firstChild).toBeTruthy();
  });

  it('renders critical risk badge correctly', () => {
    const { container } = render(<RiskBadge risk="critical" />);
    expect(container.firstChild).toBeTruthy();
  });
});
