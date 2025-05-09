
import { ComplianceCaseDetails } from '@/types/case';

export const mockComplianceCases: ComplianceCaseDetails[] = [
  {
    id: 'case-1',
    userId: 'user-101',
    userName: 'John Doe',
    createdAt: '2025-05-01T08:30:00Z',
    updatedAt: '2025-05-01T09:45:00Z',
    type: 'kyc',
    status: 'open',
    riskScore: 75,
    description: 'Inconsistent identity information across documents',
    assignedTo: 'user-1',
    assignedToName: 'Alex Nordström',
    priority: 'high',
    source: 'kyc_flag'
  },
  {
    id: 'case-2',
    userId: 'user-105',
    userName: 'Sofia Rodriguez',
    createdAt: '2025-05-02T10:15:00Z',
    updatedAt: '2025-05-02T14:00:00Z',
    type: 'aml',
    status: 'under_review',
    riskScore: 92,
    description: 'Multiple high-value transactions from high-risk jurisdiction',
    assignedTo: 'user-2',
    assignedToName: 'Johan Berg',
    priority: 'critical',
    source: 'transaction_alert',
    relatedTransactions: ['tx-23456', 'tx-23478', 'tx-23490']
  },
  {
    id: 'case-3',
    userId: 'user-107',
    userName: 'Alexander Petrov',
    createdAt: '2025-05-02T14:45:00Z',
    updatedAt: '2025-05-03T11:30:00Z',
    type: 'sanctions',
    status: 'escalated',
    riskScore: 85,
    description: 'Potential sanctions list match (86% confidence)',
    assignedTo: 'user-1',
    assignedToName: 'Alex Nordström',
    priority: 'critical',
    source: 'sanctions_hit'
  },
  {
    id: 'case-4',
    userId: 'user-110',
    userName: 'Jane Smith',
    createdAt: '2025-05-03T09:10:00Z',
    updatedAt: '2025-05-03T16:20:00Z',
    type: 'kyc',
    status: 'closed',
    riskScore: 45,
    description: 'Address verification failed initial check',
    assignedTo: 'user-1',
    assignedToName: 'Alex Nordström',
    priority: 'low',
    source: 'manual'
  },
  {
    id: 'case-5',
    userId: 'user-115',
    userName: 'Mohammad Al-Farsi',
    createdAt: '2025-05-04T11:20:00Z',
    updatedAt: '2025-05-04T13:15:00Z',
    type: 'aml',
    status: 'pending_info',
    riskScore: 68,
    description: 'Unusual transaction pattern detected',
    assignedTo: 'user-3',
    assignedToName: 'Lena Wikström',
    priority: 'medium',
    source: 'transaction_alert',
    relatedTransactions: ['tx-24001', 'tx-24050']
  },
  {
    id: 'case-6',
    userId: 'user-122',
    userName: 'Priya Sharma',
    createdAt: '2025-05-05T09:30:00Z',
    updatedAt: '2025-05-05T15:40:00Z',
    type: 'kyc',
    status: 'open',
    riskScore: 60,
    description: 'Documents expired during verification process',
    priority: 'medium',
    source: 'system'
  },
  {
    id: 'case-7',
    userId: 'user-130',
    userName: 'Carlos Mendez',
    createdAt: '2025-05-06T08:15:00Z',
    updatedAt: '2025-05-06T10:20:00Z',
    type: 'sanctions',
    status: 'under_review',
    riskScore: 88,
    description: 'Partial match with sanctioned entity',
    assignedTo: 'user-2',
    assignedToName: 'Johan Berg',
    priority: 'high',
    source: 'sanctions_hit'
  },
  {
    id: 'case-8',
    userId: 'user-133',
    userName: 'Emma Wilson',
    createdAt: '2025-05-06T14:40:00Z',
    updatedAt: '2025-05-06T16:55:00Z',
    type: 'kyc',
    status: 'closed',
    riskScore: 30,
    description: 'Additional verification completed successfully',
    assignedTo: 'user-3',
    assignedToName: 'Lena Wikström',
    priority: 'low',
    source: 'manual'
  }
];

export const complianceOfficers = [
  { id: 'user-1', name: 'Alex Nordström' },
  { id: 'user-2', name: 'Johan Berg' },
  { id: 'user-3', name: 'Lena Wikström' },
  { id: 'user-4', name: 'Maria Svensson' },
  { id: 'user-5', name: 'Erik Lindqvist' }
];
