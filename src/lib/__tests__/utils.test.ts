
import { describe, it, expect } from 'vitest';
import { cn, generateRandomKey, formatDistanceToNow, formatCurrency } from '../utils';

describe('Utils Library', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
      expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500'); // Tailwind merge should keep the last one
    });

    it('should handle conditional classes', () => {
      expect(cn('px-4', false && 'py-2', 'text-white')).toBe('px-4 text-white');
    });
  });

  describe('generateRandomKey', () => {
    it('should generate API key with correct prefix', () => {
      const key = generateRandomKey();
      expect(key).toMatch(/^ak_[a-zA-Z0-9]{32}$/);
    });

    it('should generate keys of specified length', () => {
      const key = generateRandomKey(16);
      expect(key).toMatch(/^ak_[a-zA-Z0-9]{16}$/);
    });

    it('should generate unique keys', () => {
      const key1 = generateRandomKey();
      const key2 = generateRandomKey();
      expect(key1).not.toBe(key2);
    });
  });

  describe('formatDistanceToNow', () => {
    it('should format recent dates correctly', () => {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      
      expect(formatDistanceToNow(fiveMinutesAgo)).toBe('5 minutes');
      expect(formatDistanceToNow(fiveMinutesAgo, { addSuffix: true })).toBe('5 minutes ago');
    });

    it('should handle just now correctly', () => {
      const justNow = new Date();
      expect(formatDistanceToNow(justNow, { addSuffix: true })).toBe('just now');
    });

    it('should format hours correctly', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      expect(formatDistanceToNow(twoHoursAgo)).toBe('2 hours');
    });

    it('should format days correctly', () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
      expect(formatDistanceToNow(threeDaysAgo)).toBe('3 days');
    });
  });

  describe('formatCurrency', () => {
    it('should format USD correctly', () => {
      expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56');
    });

    it('should format EUR correctly', () => {
      expect(formatCurrency(1234.56, 'EUR')).toContain('€');
      expect(formatCurrency(1234.56, 'EUR')).toContain('1.234,56');
    });

    it('should handle unknown currencies', () => {
      const result = formatCurrency(100, 'XYZ');
      expect(result).toContain('XYZ');
      expect(result).toContain('100.00');
    });

    it('should handle zero amounts', () => {
      expect(formatCurrency(0, 'USD')).toBe('$0.00');
    });
  });
});
