
import { describe, it, expect } from 'vitest';
import { evaluateCondition } from './ruleEngine';

describe('evaluateCondition', () => {
  const data = {
    amount: 1500,
    country: 'US',
    age: 35,
    tags: ['high_risk', 'pep'],
    transaction: {
      hour: 23,
    },
  };

  it('handles ">" operator', () => {
    expect(evaluateCondition({ '>': [{ var: 'amount' }, 1000] }, data)).toBe(true);
    expect(evaluateCondition({ '>': [{ var: 'amount' }, 2000] }, data)).toBe(false);
  });

  it('handles "==" operator with nested properties', () => {
    expect(evaluateCondition({ '==': [{ var: 'transaction.hour' }, 23] }, data)).toBe(true);
    expect(evaluateCondition({ '==': [{ var: 'transaction.hour' }, 10] }, data)).toBe(false);
  });

  it('handles "in" operator', () => {
    expect(evaluateCondition({ in: ['pep', { var: 'tags' }] }, data)).toBe(true);
    expect(evaluateCondition({ in: ['low_risk', { var: 'tags' }] }, data)).toBe(false);
  });

  it('handles "and" operator', () => {
    const condition = {
      and: [{ '>': [{ var: 'amount' }, 1000] }, { '==': [{ var: 'country' }, 'US'] }],
    };
    expect(evaluateCondition(condition, data)).toBe(true);
  });

  it('handles "or" operator', () => {
    const condition = {
      or: [{ '<': [{ var: 'amount' }, 1000] }, { '==': [{ var: 'country' }, 'US'] }],
    };
    expect(evaluateCondition(condition, data)).toBe(true);
  });

  it('returns false for unknown operator', () => {
    expect(evaluateCondition({ contains: [{ var: 'country' }, 'U'] }, data)).toBe(false);
  });

  it('handles missing variable gracefully', () => {
    expect(evaluateCondition({ '==': [{ var: 'nonexistent.prop' }, 'value'] }, data)).toBe(false);
  });
});
