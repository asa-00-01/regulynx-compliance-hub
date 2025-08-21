
import { AMLTransaction } from '@/types/aml';
import { ComplianceCase } from '@/types/compliance-cases';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateTransaction = (transaction: AMLTransaction): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!transaction.id) errors.push('Transaction ID is required');
  if (!transaction.amount || transaction.amount <= 0) errors.push('Valid amount is required');
  if (!transaction.currency) errors.push('Currency is required');
  if (!transaction.transaction_date) errors.push('Transaction date is required');

  // Business logic validation
  if (transaction.amount > 100000 && !transaction.senderUserId) {
    warnings.push('Large transactions should have sender information');
  }

  // Risk score validation
  if (transaction.risk_score > 80 && transaction.status !== 'flagged') {
    warnings.push('High risk transactions should be flagged for review');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateComplianceCase = (complianceCase: ComplianceCase): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!complianceCase.id) errors.push('Case ID is required');
  if (!complianceCase.type) errors.push('Case type is required');
  if (!complianceCase.status) errors.push('Case status is required');

  // Business logic validation
  if (complianceCase.priority === 'high' && !complianceCase.assigned_to) {
    warnings.push('High priority cases should be assigned');
  }

  if (complianceCase.status === 'open' && complianceCase.resolved_at) {
    errors.push('Open cases cannot have a resolved date');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};
