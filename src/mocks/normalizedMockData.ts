import { SAR, SARStatus, Pattern, PatternMatch } from '@/types/sar';
import { Transaction, TransactionAlert } from '@/types/transaction';
import { User } from '@/types';
import { Document } from '@/types';
import { ComplianceCaseDetails } from '@/types/case';
import { UnifiedUserData } from '@/context/compliance/types';

// ============================================================================
// UUID GENERATOR FOR CONSISTENT MOCK DATA
// ============================================================================

// Generate consistent UUIDs for mock data
const generateUUID = (seed: string): string => {
  // Simple hash function to generate consistent UUIDs
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to UUID format
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32).padEnd(12, '0')}`;
};

// ============================================================================
// NORMALIZED USER DATA
// ============================================================================

export const normalizedUsers: User[] = [
  {
    id: generateUUID('user-elin-west'),
    email: 'elin.west@gmail.com',
    role: 'admin',
    name: 'Elin West',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    riskScore: 65,
    status: 'verified',
  },
  {
    id: generateUUID('user-ahmed-hassan'),
    email: 'ahmed.hassan@outlook.com',
    role: 'admin',
    name: 'Ahmed Hassan',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    riskScore: 78,
    status: 'pending',
  },
  {
    id: generateUUID('user-maria-rodriguez'),
    email: 'maria.rodriguez@hotmail.com',
    role: 'admin',
    name: 'Maria Rodriguez',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    riskScore: 85,
    status: 'information_requested',
  },
  {
    id: generateUUID('user-lars-andersson'),
    email: 'lars.andersson@gmail.com',
    role: 'admin',
    name: 'Lars Andersson',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    riskScore: 25,
    status: 'verified',
  },
  {
    id: generateUUID('user-fatima-alzahra'),
    email: 'fatima.alzahra@yahoo.com',
    role: 'admin',
    name: 'Fatima Al-Zahra',
    avatarUrl: 'https://i.pravatar.cc/150?img=5',
    riskScore: 92,
    status: 'rejected',
  },
  // Compliance Officers
  {
    id: generateUUID('admin-alex-nordstrom'),
    email: 'alex.nordstrom@regulynx.com',
    role: 'complianceOfficer',
    name: 'Alex Nordström',
    avatarUrl: 'https://i.pravatar.cc/150?img=6',
    riskScore: 15,
    status: 'verified',
  },
  {
    id: generateUUID('admin-johan-berg'),
    email: 'johan.berg@regulynx.com',
    role: 'admin',
    name: 'Johan Berg',
    avatarUrl: 'https://i.pravatar.cc/150?img=7',
    riskScore: 10,
    status: 'verified',
  },
  {
    id: generateUUID('admin-lena-wikstrom'),
    email: 'lena.wikstrom@regulynx.com',
    role: 'complianceOfficer',
    name: 'Lena Wikström',
    avatarUrl: 'https://i.pravatar.cc/150?img=8',
    riskScore: 20,
    status: 'verified',
  }
];

// ============================================================================
// NORMALIZED TRANSACTION DATA
// ============================================================================

export const normalizedTransactions: Transaction[] = [
  // Elin West transactions (High-risk: Somalia transfers)
  {
    id: generateUUID('tx-001'),
    userId: generateUUID('user-elin-west'),
    userName: 'Elin West',
    amount: 15000,
    currency: 'SEK',
    timestamp: '2023-11-05T09:22:31Z',
    originCountry: 'Sweden',
    destinationCountry: 'Somalia',
    method: 'bank',
    description: 'Transfer to Somalia',
    riskScore: 85,
    flagged: true
  },
  {
    id: generateUUID('tx-002'),
    userId: generateUUID('user-elin-west'),
    userName: 'Elin West',
    amount: 12000,
    currency: 'SEK',
    timestamp: '2023-11-07T08:45:19Z',
    originCountry: 'Sweden',
    destinationCountry: 'Somalia',
    method: 'bank',
    description: 'Transfer to Somalia',
    riskScore: 80,
    flagged: true
  },
  {
    id: generateUUID('tx-003'),
    userId: generateUUID('user-elin-west'),
    userName: 'Elin West',
    amount: 18500,
    currency: 'SEK',
    timestamp: '2023-11-09T14:30:45Z',
    originCountry: 'Sweden',
    destinationCountry: 'Somalia',
    method: 'bank',
    description: 'Transfer to Somalia',
    riskScore: 90,
    flagged: true
  },

  // Ahmed Hassan transactions (Structuring pattern)
  {
    id: generateUUID('tx-004'),
    userId: generateUUID('user-ahmed-hassan'),
    userName: 'Ahmed Hassan',
    amount: 9500,
    currency: 'SEK',
    timestamp: '2023-11-28T14:05:22Z',
    originCountry: 'Sweden',
    destinationCountry: 'Sweden',
    method: 'bank',
    description: 'Domestic transfer',
    riskScore: 75,
    flagged: true
  },
  {
    id: generateUUID('tx-005'),
    userId: generateUUID('user-ahmed-hassan'),
    userName: 'Ahmed Hassan',
    amount: 9400,
    currency: 'SEK',
    timestamp: '2023-11-28T14:35:12Z',
    originCountry: 'Sweden',
    destinationCountry: 'Sweden',
    method: 'bank',
    description: 'Domestic transfer',
    riskScore: 70,
    flagged: true
  },
  {
    id: generateUUID('tx-006'),
    userId: generateUUID('user-ahmed-hassan'),
    userName: 'Ahmed Hassan',
    amount: 9700,
    currency: 'SEK',
    timestamp: '2023-11-28T15:17:45Z',
    originCountry: 'Sweden',
    destinationCountry: 'Sweden',
    method: 'bank',
    description: 'Domestic transfer',
    riskScore: 72,
    flagged: true
  },
  {
    id: generateUUID('tx-007'),
    userId: generateUUID('user-ahmed-hassan'),
    userName: 'Ahmed Hassan',
    amount: 9300,
    currency: 'SEK',
    timestamp: '2023-11-28T16:22:33Z',
    originCountry: 'Sweden',
    destinationCountry: 'Sweden',
    method: 'bank',
    description: 'Domestic transfer',
    riskScore: 68,
    flagged: true
  },

  // Maria Rodriguez transactions (High-value, suspicious timing)
  {
    id: generateUUID('tx-008'),
    userId: generateUUID('user-maria-rodriguez'),
    userName: 'Maria Rodriguez',
    amount: 25000,
    currency: 'SEK',
    timestamp: '2023-12-15T23:45:12Z',
    originCountry: 'Sweden',
    destinationCountry: 'Spain',
    method: 'bank',
    description: 'Late night transfer to family',
    riskScore: 75,
    flagged: true
  },
  {
    id: generateUUID('tx-009'),
    userId: generateUUID('user-maria-rodriguez'),
    userName: 'Maria Rodriguez',
    amount: 22000,
    currency: 'SEK',
    timestamp: '2023-12-16T01:15:33Z',
    originCountry: 'Sweden',
    destinationCountry: 'Spain',
    method: 'bank',
    description: 'Late night transfer to family',
    riskScore: 78,
    flagged: true
  },

  // Lars Andersson transactions (Low risk, normal pattern)
  {
    id: generateUUID('tx-010'),
    userId: generateUUID('user-lars-andersson'),
    userName: 'Lars Andersson',
    amount: 5000,
    currency: 'SEK',
    timestamp: '2023-12-10T14:30:00Z',
    originCountry: 'Sweden',
    destinationCountry: 'Sweden',
    method: 'bank',
    description: 'Regular payment',
    riskScore: 15,
    flagged: false
  },
  {
    id: generateUUID('tx-011'),
    userId: generateUUID('user-lars-andersson'),
    userName: 'Lars Andersson',
    amount: 3500,
    currency: 'SEK',
    timestamp: '2023-12-12T09:15:00Z',
    originCountry: 'Sweden',
    destinationCountry: 'Sweden',
    method: 'bank',
    description: 'Regular payment',
    riskScore: 10,
    flagged: false
  },

  // Fatima Al-Zahra transactions (Sanctioned user)
  {
    id: generateUUID('tx-012'),
    userId: generateUUID('user-fatima-alzahra'),
    userName: 'Fatima Al-Zahra',
    amount: 30000,
    currency: 'SEK',
    timestamp: '2023-12-20T10:00:00Z',
    originCountry: 'Sweden',
    destinationCountry: 'Iran',
    method: 'bank',
    description: 'Transfer to Iran',
    riskScore: 95,
    flagged: true
  },
  {
    id: generateUUID('tx-013'),
    userId: generateUUID('user-fatima-alzahra'),
    userName: 'Fatima Al-Zahra',
    amount: 45000,
    currency: 'SEK',
    timestamp: '2023-12-21T11:30:00Z',
    originCountry: 'Sweden',
    destinationCountry: 'Iran',
    method: 'bank',
    description: 'Transfer to Iran',
    riskScore: 98,
    flagged: true
  }
];

// ============================================================================
// NORMALIZED ALERT DATA
// ============================================================================

export const normalizedAlerts: TransactionAlert[] = [
  {
    id: generateUUID('alert-001'),
    transactionId: generateUUID('tx-001'),
    userId: generateUUID('user-elin-west'),
    userName: 'Elin West',
    type: 'high_risk_country',
    description: 'Transaction to high-risk jurisdiction (Somalia)',
    timestamp: '2023-11-05T09:22:31Z',
    status: 'open'
  },
  {
    id: generateUUID('alert-002'),
    transactionId: generateUUID('tx-002'),
    userId: generateUUID('user-elin-west'),
    userName: 'Elin West',
    type: 'high_risk_country',
    description: 'Transaction to high-risk jurisdiction (Somalia)',
    timestamp: '2023-11-07T08:45:19Z',
    status: 'open'
  },
  {
    id: generateUUID('alert-003'),
    transactionId: generateUUID('tx-003'),
    userId: generateUUID('user-elin-west'),
    userName: 'Elin West',
    type: 'high_risk_country',
    description: 'Transaction to high-risk jurisdiction (Somalia)',
    timestamp: '2023-11-09T14:30:45Z',
    status: 'open'
  },
  {
    id: generateUUID('alert-004'),
    transactionId: generateUUID('tx-004'),
    userId: generateUUID('user-ahmed-hassan'),
    userName: 'Ahmed Hassan',
    type: 'structuring',
    description: 'Multiple transactions just below reporting threshold',
    timestamp: '2023-11-28T14:05:22Z',
    status: 'open'
  },
  {
    id: generateUUID('alert-005'),
    transactionId: generateUUID('tx-005'),
    userId: generateUUID('user-ahmed-hassan'),
    userName: 'Ahmed Hassan',
    type: 'structuring',
    description: 'Multiple transactions just below reporting threshold',
    timestamp: '2023-11-28T14:35:12Z',
    status: 'open'
  },
  {
    id: generateUUID('alert-006'),
    transactionId: generateUUID('tx-006'),
    userId: generateUUID('user-ahmed-hassan'),
    userName: 'Ahmed Hassan',
    type: 'structuring',
    description: 'Multiple transactions just below reporting threshold',
    timestamp: '2023-11-28T15:17:45Z',
    status: 'open'
  },
  {
    id: generateUUID('alert-007'),
    transactionId: generateUUID('tx-007'),
    userId: generateUUID('user-ahmed-hassan'),
    userName: 'Ahmed Hassan',
    type: 'structuring',
    description: 'Multiple transactions just below reporting threshold',
    timestamp: '2023-11-28T16:22:33Z',
    status: 'open'
  },
  {
    id: generateUUID('alert-008'),
    transactionId: generateUUID('tx-008'),
    userId: generateUUID('user-maria-rodriguez'),
    userName: 'Maria Rodriguez',
    type: 'suspicious_pattern',
    description: 'Late night high-value transfers',
    timestamp: '2023-12-15T23:45:12Z',
    status: 'open'
  },
  {
    id: generateUUID('alert-009'),
    transactionId: generateUUID('tx-009'),
    userId: generateUUID('user-maria-rodriguez'),
    userName: 'Maria Rodriguez',
    type: 'suspicious_pattern',
    description: 'Late night high-value transfers',
    timestamp: '2023-12-16T01:15:33Z',
    status: 'open'
  },
  {
    id: generateUUID('alert-010'),
    transactionId: generateUUID('tx-012'),
    userId: generateUUID('user-fatima-alzahra'),
    userName: 'Fatima Al-Zahra',
    type: 'high_risk_country',
    description: 'Transaction to sanctioned country (Iran)',
    timestamp: '2023-12-20T10:00:00Z',
    status: 'open'
  },
  {
    id: generateUUID('alert-011'),
    transactionId: generateUUID('tx-013'),
    userId: generateUUID('user-fatima-alzahra'),
    userName: 'Fatima Al-Zahra',
    type: 'high_risk_country',
    description: 'Transaction to sanctioned country (Iran)',
    timestamp: '2023-12-21T11:30:00Z',
    status: 'open'
  }
];

// ============================================================================
// NORMALIZED COMPLIANCE CASES DATA
// ============================================================================

export const normalizedComplianceCases: ComplianceCaseDetails[] = [
  {
    id: generateUUID('case-001'),
    userId: generateUUID('user-elin-west'),
    userName: 'Elin West',
    type: 'aml',
    status: 'open',
    riskScore: 85,
    description: 'Multiple high-value transfers to Somalia',
    assignedTo: generateUUID('admin-alex-nordstrom'),
    assignedToName: 'Alex Nordström',
    createdAt: '2023-11-10T10:00:00Z',
    updatedAt: '2023-12-01T15:30:00Z',
    priority: 'high',
    source: 'transaction_alert',
    relatedTransactions: [generateUUID('tx-001'), generateUUID('tx-002'), generateUUID('tx-003')]
  },
  {
    id: generateUUID('case-002'),
    userId: generateUUID('user-ahmed-hassan'),
    userName: 'Ahmed Hassan',
    type: 'aml',
    status: 'open',
    riskScore: 75,
    description: 'Structuring pattern detected - multiple transactions below threshold',
    assignedTo: generateUUID('admin-lena-wikstrom'),
    assignedToName: 'Lena Wikström',
    createdAt: '2023-11-29T09:00:00Z',
    updatedAt: '2023-12-05T11:45:00Z',
    priority: 'medium',
    source: 'transaction_alert',
    relatedTransactions: [generateUUID('tx-004'), generateUUID('tx-005'), generateUUID('tx-006'), generateUUID('tx-007')]
  },
  {
    id: generateUUID('case-003'),
    userId: generateUUID('user-maria-rodriguez'),
    userName: 'Maria Rodriguez',
    type: 'aml',
    status: 'under_review',
    riskScore: 78,
    description: 'Suspicious late-night high-value transfers',
    assignedTo: generateUUID('admin-alex-nordstrom'),
    assignedToName: 'Alex Nordström',
    createdAt: '2023-12-16T08:00:00Z',
    updatedAt: '2023-12-18T13:20:00Z',
    priority: 'medium',
    source: 'transaction_alert',
    relatedTransactions: [generateUUID('tx-008'), generateUUID('tx-009')]
  },
  {
    id: generateUUID('case-004'),
    userId: generateUUID('user-fatima-alzahra'),
    userName: 'Fatima Al-Zahra',
    type: 'sanctions',
    status: 'closed',
    riskScore: 98,
    description: 'Sanctions violation - transfers to Iran',
    assignedTo: generateUUID('admin-johan-berg'),
    assignedToName: 'Johan Berg',
    createdAt: '2023-12-21T12:00:00Z',
    updatedAt: '2023-12-22T10:15:00Z',
    priority: 'critical',
    source: 'sanctions_hit',
    relatedTransactions: [generateUUID('tx-012'), generateUUID('tx-013')]
  }
];

// ============================================================================
// NORMALIZED SAR DATA
// ============================================================================

export const normalizedSARs: SAR[] = [
  {
    id: generateUUID('SAR-2023-001'),
    userId: generateUUID('user-elin-west'),
    userName: 'Elin West',
    dateSubmitted: '2023-11-15T14:00:00Z',
    dateOfActivity: '2023-11-09T14:30:45Z',
    status: 'filed' as SARStatus,
    summary: 'Multiple high-value transfers to Somalia totaling 45,500 SEK',
    transactions: [generateUUID('tx-001'), generateUUID('tx-002'), generateUUID('tx-003')],
    documents: [],
    notes: ['Pattern consistent with money laundering', 'SAR created for this case']
  },
  {
    id: generateUUID('SAR-2023-002'),
    userId: generateUUID('user-ahmed-hassan'),
    userName: 'Ahmed Hassan',
    dateSubmitted: '2023-12-01T16:00:00Z',
    dateOfActivity: '2023-11-28T16:22:33Z',
    status: 'filed' as SARStatus,
    summary: 'Structuring pattern - 4 transactions totaling 37,900 SEK',
    transactions: [generateUUID('tx-004'), generateUUID('tx-005'), generateUUID('tx-006'), generateUUID('tx-007')],
    documents: [],
    notes: ['Multiple transactions just below 10,000 SEK threshold', 'SAR filed with authorities']
  },
  {
    id: generateUUID('SAR-2024-001'),
    userId: generateUUID('user-maria-rodriguez'),
    userName: 'Maria Rodriguez',
    dateSubmitted: '2023-12-18T10:00:00Z',
    dateOfActivity: '2023-12-16T01:15:33Z',
    status: 'submitted' as SARStatus,
    summary: 'Suspicious late-night transfers totaling 47,000 SEK',
    transactions: [generateUUID('tx-008'), generateUUID('tx-009')],
    documents: [],
    notes: ['Investigating purpose of late-night transfers', 'SAR submitted for review']
  },
  {
    id: generateUUID('SAR-2024-002'),
    userId: generateUUID('user-fatima-alzahra'),
    userName: 'Fatima Al-Zahra',
    dateSubmitted: '2023-12-22T09:00:00Z',
    dateOfActivity: '2023-12-21T11:30:00Z',
    status: 'filed' as SARStatus,
    summary: 'Sanctions violation - transfers to Iran totaling 75,000 SEK',
    transactions: [generateUUID('tx-012'), generateUUID('tx-013')],
    documents: [],
    notes: ['CRITICAL: Immediate sanctions violation', 'SAR filed with authorities']
  }
];

// ============================================================================
// NORMALIZED PATTERN DATA
// ============================================================================

export const normalizedPatterns: Pattern[] = [
  {
    id: generateUUID('PTN-001'),
    name: 'Structuring Pattern',
    description: 'Multiple transactions just below reporting threshold',
    matchCount: 4,
    category: 'structuring',
    createdAt: '2023-11-28T16:22:33Z'
  },
  {
    id: generateUUID('PTN-002'),
    name: 'High-Risk Corridor',
    description: 'Transactions to/from high-risk jurisdictions',
    matchCount: 3,
    category: 'high_risk_corridor',
    createdAt: '2023-11-09T14:30:45Z'
  },
  {
    id: generateUUID('PTN-003'),
    name: 'Suspicious Timing',
    description: 'Transactions during unusual hours',
    matchCount: 2,
    category: 'time_pattern',
    createdAt: '2023-12-16T01:15:33Z'
  }
];

export const normalizedPatternMatches: Record<string, PatternMatch[]> = {
  [generateUUID('PTN-001')]: [
    {
      id: generateUUID('MATCH-001'),
      patternId: generateUUID('PTN-001'),
      userId: generateUUID('user-ahmed-hassan'),
      userName: 'Ahmed Hassan',
      transactionId: generateUUID('tx-004'),
      country: 'Sweden',
      amount: 9500,
      currency: 'SEK',
      timestamp: '2023-11-28T14:05:22Z',
      createdAt: '2023-11-28T16:30:00Z'
    },
    {
      id: generateUUID('MATCH-002'),
      patternId: generateUUID('PTN-001'),
      userId: generateUUID('user-ahmed-hassan'),
      userName: 'Ahmed Hassan',
      transactionId: generateUUID('tx-005'),
      country: 'Sweden',
      amount: 9400,
      currency: 'SEK',
      timestamp: '2023-11-28T14:35:12Z',
      createdAt: '2023-11-28T16:30:00Z'
    },
    {
      id: generateUUID('MATCH-003'),
      patternId: generateUUID('PTN-001'),
      userId: generateUUID('user-ahmed-hassan'),
      userName: 'Ahmed Hassan',
      transactionId: generateUUID('tx-006'),
      country: 'Sweden',
      amount: 9700,
      currency: 'SEK',
      timestamp: '2023-11-28T15:17:45Z',
      createdAt: '2023-11-28T16:30:00Z'
    },
    {
      id: generateUUID('MATCH-004'),
      patternId: generateUUID('PTN-001'),
      userId: generateUUID('user-ahmed-hassan'),
      userName: 'Ahmed Hassan',
      transactionId: generateUUID('tx-007'),
      country: 'Sweden',
      amount: 9300,
      currency: 'SEK',
      timestamp: '2023-11-28T16:22:33Z',
      createdAt: '2023-11-28T16:30:00Z'
    }
  ],
  [generateUUID('PTN-002')]: [
    {
      id: generateUUID('MATCH-005'),
      patternId: generateUUID('PTN-002'),
      userId: generateUUID('user-elin-west'),
      userName: 'Elin West',
      transactionId: generateUUID('tx-001'),
      country: 'Somalia',
      amount: 15000,
      currency: 'SEK',
      timestamp: '2023-11-05T09:22:31Z',
      createdAt: '2023-11-09T15:00:00Z'
    },
    {
      id: generateUUID('MATCH-006'),
      patternId: generateUUID('PTN-002'),
      userId: generateUUID('user-elin-west'),
      userName: 'Elin West',
      transactionId: generateUUID('tx-002'),
      country: 'Somalia',
      amount: 12000,
      currency: 'SEK',
      timestamp: '2023-11-07T08:45:19Z',
      createdAt: '2023-11-09T15:00:00Z'
    },
    {
      id: generateUUID('MATCH-007'),
      patternId: generateUUID('PTN-002'),
      userId: generateUUID('user-elin-west'),
      userName: 'Elin West',
      transactionId: generateUUID('tx-003'),
      country: 'Somalia',
      amount: 18500,
      currency: 'SEK',
      timestamp: '2023-11-09T14:30:45Z',
      createdAt: '2023-11-09T15:00:00Z'
    }
  ],
  [generateUUID('PTN-003')]: [
    {
      id: generateUUID('MATCH-008'),
      patternId: generateUUID('PTN-003'),
      userId: generateUUID('user-maria-rodriguez'),
      userName: 'Maria Rodriguez',
      transactionId: generateUUID('tx-008'),
      country: 'Spain',
      amount: 25000,
      currency: 'SEK',
      timestamp: '2023-12-15T23:45:12Z',
      createdAt: '2023-12-16T02:00:00Z'
    },
    {
      id: generateUUID('MATCH-009'),
      patternId: generateUUID('PTN-003'),
      userId: generateUUID('user-maria-rodriguez'),
      userName: 'Maria Rodriguez',
      transactionId: generateUUID('tx-009'),
      country: 'Spain',
      amount: 22000,
      currency: 'SEK',
      timestamp: '2023-12-16T01:15:33Z',
      createdAt: '2023-12-16T02:00:00Z'
    }
  ]
};

// ============================================================================
// NORMALIZED DOCUMENT DATA
// ============================================================================

export const normalizedDocuments: Document[] = [
  // Elin West documents
  {
    id: generateUUID('doc-001'),
    userId: generateUUID('user-elin-west'),
    type: 'passport',
    fileName: 'elin_west_passport.pdf',
    uploadDate: '2023-01-15T10:00:00Z',
    status: 'verified',
    verifiedBy: generateUUID('admin-alex-nordstrom'),
    verificationDate: '2023-01-16T14:30:00Z'
  },
  {
    id: generateUUID('doc-002'),
    userId: generateUUID('user-elin-west'),
    type: 'utility_bill',
    fileName: 'elin_west_utility.pdf',
    uploadDate: '2023-01-15T10:05:00Z',
    status: 'verified',
    verifiedBy: generateUUID('admin-alex-nordstrom'),
    verificationDate: '2023-01-16T14:35:00Z'
  },
  // Ahmed Hassan documents
  {
    id: generateUUID('doc-003'),
    userId: generateUUID('user-ahmed-hassan'),
    type: 'passport',
    fileName: 'ahmed_hassan_passport.pdf',
    uploadDate: '2023-02-20T11:00:00Z',
    status: 'verified',
    verifiedBy: generateUUID('admin-lena-wikstrom'),
    verificationDate: '2023-02-21T09:15:00Z'
  },
  {
    id: generateUUID('doc-004'),
    userId: generateUUID('user-ahmed-hassan'),
    type: 'drivers_license',
    fileName: 'ahmed_hassan_license.pdf',
    uploadDate: '2023-02-20T11:10:00Z',
    status: 'verified',
    verifiedBy: generateUUID('admin-lena-wikstrom'),
    verificationDate: '2023-02-21T09:20:00Z'
  },
  // Maria Rodriguez documents
  {
    id: generateUUID('doc-005'),
    userId: generateUUID('user-maria-rodriguez'),
    type: 'passport',
    fileName: 'maria_rodriguez_passport.pdf',
    uploadDate: '2023-03-10T13:00:00Z',
    status: 'verified',
    verifiedBy: generateUUID('admin-alex-nordstrom'),
    verificationDate: '2023-03-11T10:45:00Z'
  },
  // Fatima Al-Zahra documents
  {
    id: generateUUID('doc-006'),
    userId: generateUUID('user-fatima-alzahra'),
    type: 'passport',
    fileName: 'fatima_alzahra_passport.pdf',
    uploadDate: '2023-04-05T15:00:00Z',
    status: 'rejected',
    verifiedBy: generateUUID('admin-johan-berg'),
    verificationDate: '2023-04-06T11:20:00Z'
  },
  {
    id: generateUUID('doc-007'),
    userId: generateUUID('user-fatima-alzahra'),
    type: 'other',
    fileName: 'fatima_alzahra_sanctions_check.pdf',
    uploadDate: '2023-04-06T12:00:00Z',
    status: 'rejected',
    verifiedBy: generateUUID('admin-johan-berg'),
    verificationDate: '2023-04-06T14:00:00Z'
  }
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getUserById = (userId: string): User | undefined => {
  return normalizedUsers.find(user => user.id === userId);
};

export const getTransactionsByUserId = (userId: string): Transaction[] => {
  return normalizedTransactions.filter(tx => tx.userId === userId);
};

export const getAlertsByUserId = (userId: string): TransactionAlert[] => {
  return normalizedAlerts.filter(alert => alert.userId === userId);
};

export const getCasesByUserId = (userId: string): ComplianceCaseDetails[] => {
  return normalizedComplianceCases.filter(case_ => case_.userId === userId);
};

export const getSARsByUserId = (userId: string): SAR[] => {
  return normalizedSARs.filter(sar => sar.userId === userId);
};

export const getDocumentsByUserId = (userId: string): Document[] => {
  return normalizedDocuments.filter(doc => doc.userId === userId);
};

export const getPatternMatchesByUserId = (userId: string): PatternMatch[] => {
  return Object.values(normalizedPatternMatches)
    .flat()
    .filter(match => match.userId === userId);
};

// ============================================================================
// EXPORT ALL NORMALIZED DATA
// ============================================================================

export const normalizedMockData = {
  users: normalizedUsers,
  transactions: normalizedTransactions,
  alerts: normalizedAlerts,
  cases: normalizedComplianceCases,
  sars: normalizedSARs,
  patterns: normalizedPatterns,
  patternMatches: normalizedPatternMatches,
  documents: normalizedDocuments
};
