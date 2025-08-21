
import { AMLTransaction } from '@/types/aml';
import { User } from '@/types';
import { ComplianceCaseDetails } from '@/types/compliance-cases';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const validateAMLTransaction = (transaction: AMLTransaction): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validations
  if (!transaction.transactionAmount || transaction.transactionAmount <= 0) {
    errors.push(`Invalid transaction amount: ${transaction.transactionAmount}`);
  }
  if (!transaction.currency) {
    errors.push('Missing currency');
  }
  if (!transaction.transactionDate) {
    errors.push('Missing transaction date');
  }

  // Business rule validations
  if (transaction.transactionAmount > 10000) {
    warnings.push('Large transaction amount detected');
  }

  // Risk score validation
  if (transaction.riskScore > 80) {
    warnings.push('High risk score detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateUser = (user: User): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validations
  if (!user.email || !user.email.includes('@')) {
    errors.push('Invalid email address');
  }
  if (!user.name || user.name.trim().length === 0) {
    errors.push('Name is required');
  }

  // Business rule validations
  if (user.riskScore > 70) {
    warnings.push('High risk user detected');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const validateComplianceCase = (caseData: ComplianceCaseDetails): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required field validations
  if (!caseData.type) {
    errors.push('Case type is required');
  }
  if (!caseData.description || caseData.description.trim().length === 0) {
    errors.push('Case description is required');
  }
  if (!caseData.created_by) {
    errors.push('Created by field is required');
  }

  // Business rule validations
  if (caseData.risk_score > 80) {
    warnings.push('High risk case detected');
  }
  if (caseData.priority === 'critical') {
    warnings.push('Critical priority case requires immediate attention');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

export const logValidationResults = (results: ValidationResult[], context: string) => {
  console.log(`Validation results for ${context}:`);
  results.forEach((result, index) => {
    if (!result.isValid) {
      console.error(`Item ${index + 1} validation failed:`, result.errors);
    }
    if (result.warnings.length > 0) {
      console.warn(`Item ${index + 1} warnings:`, result.warnings);
    }
  });
};

export const batchValidate = <T>(
  items: T[],
  validator: (item: T) => ValidationResult
): ValidationResult[] => {
  return items.map(validator);
};
