
import { describe, it, expect } from 'vitest';
import { formatCurrency } from './utils';

describe('formatCurrency', () => {
  it('should format USD correctly', () => {
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
  });

  it('should format EUR correctly with non-breaking space', () => {
    expect(formatCurrency(1234.56, 'EUR')).toBe('1.234,56\u00A0€');
  });

  it('should format SEK correctly with non-breaking spaces', () => {
    expect(formatCurrency(1234.56, 'SEK')).toBe('1\u00A0234,56\u00A0kr');
  });

  it('should handle unknown currency by using its code as a symbol', () => {
    // The implementation uses 'en-US' as a fallback locale
    expect(formatCurrency(100, 'XYZ')).toBe('XYZ\u00A0100.00');
  });

  it('should handle zero correctly', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});
