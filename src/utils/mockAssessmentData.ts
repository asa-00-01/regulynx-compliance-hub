
import { AMLTransaction } from '@/types/aml';
import { ComplianceCaseDetails } from '@/types/compliance-cases';

export const mockAMLTransactions: AMLTransaction[] = [
  {
    id: '1',
    senderName: 'John Doe',
    receiverName: 'Jane Smith',
    senderAmount: 50000,
    receiverAmount: 50000,
    senderCurrency: 'USD',
    receiverCurrency: 'USD',
    timestamp: new Date().toISOString(),
    status: 'completed',
    riskScore: 85,
    isSuspect: true,
    description: 'Large cash deposit with unusual patterns'
  },
  {
    id: '2',
    senderName: 'Alice Johnson',
    receiverName: 'Bob Wilson',
    senderAmount: 25000,
    receiverAmount: 25000,
    senderCurrency: 'EUR',
    receiverCurrency: 'EUR',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'pending',
    riskScore: 65,
    isSuspect: false,
    description: 'Regular business transaction'
  }
];

export const generateMockTransaction = (): AMLTransaction => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    senderName: `Sender ${Math.floor(Math.random() * 1000)}`,
    receiverName: `Receiver ${Math.floor(Math.random() * 1000)}`,
    senderAmount: Math.floor(Math.random() * 100000),
    receiverAmount: Math.floor(Math.random() * 100000),
    senderCurrency: 'USD',
    receiverCurrency: 'USD',
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: Math.random() > 0.8 ? 'pending' : 'completed',
    riskScore: Math.floor(Math.random() * 100),
    isSuspect: Math.random() > 0.7,
    description: `Transaction ${Math.floor(Math.random() * 1000)}`
  };
};

export const mockCases: ComplianceCaseDetails[] = [];

export const generateMockCase = (): ComplianceCaseDetails => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    type: 'kyc',
    status: 'open',
    risk_score: Math.floor(Math.random() * 100),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    priority: 'medium',
    source: 'system',
    user_name: `User ${Math.floor(Math.random() * 1000)}`,
    description: `Case description ${Math.floor(Math.random() * 1000)}`,
    assigned_to: null,
    assigned_to_name: null,
    created_by: 'system',
    resolved_at: null,
    related_alerts: [],
    related_transactions: [],
    documents: [],
    actions: []
  };
};
