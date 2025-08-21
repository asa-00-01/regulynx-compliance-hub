
import { AMLTransaction } from '@/types/aml';
import { Document } from '@/types';
import { ComplianceCaseDetails } from '@/types/case';

// Mock AML transaction data for assessment
export const mockAMLTransactions: AMLTransaction[] = [
  {
    id: 'txn_001',
    senderUserId: 'acc_001',
    receiverUserId: 'acc_002',
    senderName: 'John Doe',
    receiverName: 'Jane Smith',
    senderAmount: 15000.00,
    senderCurrency: 'USD',
    receiverAmount: 15000.00,
    receiverCurrency: 'USD',
    method: 'wire_transfer',
    status: 'completed',
    timestamp: new Date('2024-01-15T10:30:00Z').toISOString(),
    senderCountryCode: 'US',
    receiverCountryCode: 'DE',
    riskScore: 85,
    isSuspect: true,
    flagged: true,
    reasonForSending: 'Business payment',
    notes: 'High amount transaction to high-risk jurisdiction'
  },
  {
    id: 'txn_002',
    senderUserId: 'acc_003',
    receiverUserId: 'acc_001',
    senderName: 'Maria Garcia',
    receiverName: 'John Doe',
    senderAmount: 7500.00,
    senderCurrency: 'EUR',
    receiverAmount: 8100.00,
    receiverCurrency: 'USD',
    method: 'bank_transfer',
    status: 'pending',
    timestamp: new Date('2024-01-16T14:22:00Z').toISOString(),
    senderCountryCode: 'ES',
    receiverCountryCode: 'US',
    riskScore: 72,
    isSuspect: true,
    flagged: true,
    reasonForSending: 'Investment return',
    notes: 'Unusual pattern detected'
  },
  {
    id: 'txn_003',
    senderUserId: 'acc_004',
    receiverUserId: 'acc_005',
    senderName: 'Ahmed Hassan',
    receiverName: 'Lisa Wong',
    senderAmount: 25000.00,
    senderCurrency: 'USD',
    receiverAmount: 25000.00,
    receiverCurrency: 'USD',
    method: 'cash_deposit',
    status: 'flagged',
    timestamp: new Date('2024-01-17T09:15:00Z').toISOString(),
    senderCountryCode: 'AE',
    receiverCountryCode: 'SG',
    riskScore: 95,
    isSuspect: true,
    flagged: true,
    reasonForSending: 'Personal transfer',
    notes: 'Large cash deposit with suspicious timing'
  }
];

// Mock compliance cases for assessment
export const mockComplianceCases: ComplianceCaseDetails[] = [
  {
    id: 'case_001',
    userId: 'user_001',
    userName: 'John Smith',
    createdAt: new Date('2024-01-10T08:00:00Z').toISOString(),
    createdBy: 'admin_001',
    updatedAt: new Date('2024-01-15T16:30:00Z').toISOString(),
    type: 'kyc',
    status: 'under_review',
    riskScore: 78,
    description: 'Customer verification documents require additional review',
    assignedTo: 'analyst_001',
    assignedToName: 'Sarah Johnson',
    priority: 'high',
    source: 'kyc_flag',
    relatedTransactions: ['txn_001'],
    relatedAlerts: ['alert_001'],
    documents: ['doc_001', 'doc_002']
  }
];

// Mock documents for assessment
export const mockDocuments: Document[] = [
  {
    id: 'doc_001',
    type: 'passport',
    fileName: 'passport_user_001.pdf',
    uploadDate: new Date('2024-01-08T12:00:00Z').toISOString(),
    status: 'pending',
    userId: 'user_001'
  }
];
