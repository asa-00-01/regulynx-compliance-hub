
function getValue(operand: any, data: any): any {
  if (operand && typeof operand === 'object' && operand.var) {
    const path = operand.var.split('.');
    let value = data;
    for (const key of path) {
      value = value?.[key];
    }
    return value;
  }
  return operand;
}

// Simple JSON Logic implementation for rule evaluation
export function evaluateCondition(condition: any, data: any): boolean {
  if (!condition || typeof condition !== 'object') {
    console.warn('Invalid condition:', condition);
    return false;
  }

  const operator = Object.keys(condition)[0];
  const operands = condition[operator];

  switch (operator) {
    case '>':
      return getValue(operands[0], data) > getValue(operands[1], data);
    case '<':
      return getValue(operands[0], data) < getValue(operands[1], data);
    case '>=':
      return getValue(operands[0], data) >= getValue(operands[1], data);
    case '<=':
      return getValue(operands[0], data) <= getValue(operands[1], data);
    case '==':
      return getValue(operands[0], data) === getValue(operands[1], data);
    case '!=':
      return getValue(operands[0], data) !== getValue(operands[1], data);
    case 'in':
      const value = getValue(operands[0], data);
      const array = getValue(operands[1], data);
      return Array.isArray(array) && array.includes(value);
    case 'and':
      return operands.every((op: any) => evaluateCondition(op, data));
    case 'or':
      return operands.some((op: any) => evaluateCondition(op, data));
    case '%':
      return (getValue(operands[0], data) % getValue(operands[1], data)) === 0;
    default:
      console.warn('Unknown operator:', operator);
      return false;
  }
}
