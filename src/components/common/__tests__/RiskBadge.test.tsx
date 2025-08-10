
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RiskBadge from '../RiskBadge';

describe('RiskBadge', () => {
  it('renders minimal risk correctly (score < 25)', () => {
    render(<RiskBadge score={10} />);
    expect(screen.getByText('10 - Minimal Risk')).toBeInTheDocument();
  });

  it('renders low risk correctly (25 <= score < 50)', () => {
    render(<RiskBadge score={30} />);
    expect(screen.getByText('30 - Low Risk')).toBeInTheDocument();
  });

  it('renders medium risk correctly (50 <= score < 75)', () => {
    render(<RiskBadge score={60} />);
    expect(screen.getByText('60 - Medium Risk')).toBeInTheDocument();
  });

  it('renders high risk correctly (score >= 75)', () => {
    render(<RiskBadge score={80} />);
    expect(screen.getByText('80 - High Risk')).toBeInTheDocument();
  });

  it('hides risk level text when showText is false', () => {
    render(<RiskBadge score={80} showText={false} />);
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.queryByText('High Risk')).not.toBeInTheDocument();
  });

  it('handles edge case scores correctly', () => {
    render(<RiskBadge score={25} />);
    expect(screen.getByText('25 - Low Risk')).toBeInTheDocument();
    
    render(<RiskBadge score={50} />);
    expect(screen.getByText('50 - Medium Risk')).toBeInTheDocument();
    
    render(<RiskBadge score={75} />);
    expect(screen.getByText('75 - High Risk')).toBeInTheDocument();
  });
});
