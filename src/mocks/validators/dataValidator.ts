
import { UnifiedUserData } from '@/context/compliance/types';
import { AMLTransaction } from '@/types/aml';
import { ComplianceCaseDetails } from '@/types/compliance-cases';

export function validateUserData(user: UnifiedUserData): boolean {
  return !!(
    user.id &&
    user.fullName &&
    user.email &&
    typeof user.riskScore === 'number'
  );
}

export function validateTransactionData(transaction: AMLTransaction): boolean {
  return !!(
    transaction.id &&
    transaction.senderAmount > 0 && 
    transaction.senderAmount <= 1000000 &&
    transaction.senderCurrency &&
    transaction.timestamp &&
    transaction.senderName &&
    transaction.receiverName
  );
}

export function validateCaseData(caseData: ComplianceCaseDetails): boolean {
  return !!(
    caseData.id &&
    caseData.type &&
    caseData.status &&
    typeof caseData.risk_score === 'number' &&
    caseData.risk_score >= 0 &&
    caseData.risk_score <= 100
  );
}

export function validateAllData(users: UnifiedUserData[], transactions: AMLTransaction[], cases: ComplianceCaseDetails[]): {
  validUsers: number;
  validTransactions: number;
  validCases: number;
  totalUsers: number;
  totalTransactions: number;
  totalCases: number;
} {
  return {
    validUsers: users.filter(validateUserData).length,
    validTransactions: transactions.filter(validateTransactionData).length,
    validCases: cases.filter(validateCaseData).length,
    totalUsers: users.length,
    totalTransactions: transactions.length,
    totalCases: cases.length,
  };
}
