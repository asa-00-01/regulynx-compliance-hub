
import { AMLTransaction } from '@/types/aml';
import { ComplianceCase } from '@/types/compliance-cases';

// Mock AML transactions for assessment
const mockAMLTransactions: AMLTransaction[] = [
  {
    id: '1',
    organization_customer_id: 'org_1',
    external_transaction_id: 'TXN_001',
    amount: 15000,
    currency: 'USD',
    transaction_date: '2024-01-15',
    transaction_type: 'wire_transfer',
    from_account: 'ACC_001',
    to_account: 'ACC_002',
    description: 'Large wire transfer',
    risk_score: 85,
    status: 'flagged',
    flags: ['large_amount', 'cross_border'],
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
    senderUserId: 'user_001',
    receiverUserId: 'user_002',
    senderName: 'John Doe',
    receiverName: 'Jane Smith',
    senderAccount: 'ACC_001',
    receiverAccount: 'ACC_002',
    sourceCountry: 'US',
    destinationCountry: 'CH'
  }
];

const highRiskTransactions: AMLTransaction[] = mockAMLTransactions.filter(tx => tx.risk_score > 70);

const flaggedTransactions: AMLTransaction[] = mockAMLTransactions.filter(tx => tx.status === 'flagged');

const suspiciousTransactions: AMLTransaction[] = mockAMLTransactions.filter(tx => 
  tx.flags.some(flag => ['suspicious_pattern', 'rapid_movement', 'structuring'].includes(flag))
);

export const mockAssessmentData = {
  highRiskTransactions,
  flaggedTransactions,
  suspiciousTransactions,
  allTransactions: mockAMLTransactions
};
