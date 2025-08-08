import { SAR, Pattern, PatternMatch } from '@/types/sar';

// Mock SARs
export const mockSARs: SAR[] = [
  {
    id: 'SAR-2023-001',
    userId: '1',
    userName: 'Alex Nordström',
    dateSubmitted: '2023-11-15T09:34:21',
    dateOfActivity: '2023-11-10T00:00:00',
    status: 'submitted',
    summary: 'Multiple suspicious transactions to high-risk jurisdiction',
    transactions: ['TX-78901', 'TX-78902', 'TX-78903'],
    notes: ['Patterns consistent with money laundering']
  },
  {
    id: 'SAR-2023-002',
    userId: '3',
    userName: 'Lena Wikström',
    dateSubmitted: '2023-12-05T14:22:33',
    dateOfActivity: '2023-12-01T00:00:00',
    status: 'reviewed',
    summary: 'Unusual pattern of structuring transactions below reporting threshold',
    transactions: ['TX-82901', 'TX-82902', 'TX-82903', 'TX-82904'],
    notes: ['Follow-up investigation required']
  },
  {
    id: 'SAR-2024-001',
    userId: '4',
    userName: 'Astrid Lindqvist',
    dateSubmitted: '2024-01-22T11:15:44',
    dateOfActivity: '2024-01-15T00:00:00',
    status: 'draft',
    summary: 'Suspicious transaction patterns during non-business hours',
    transactions: ['TX-91245', 'TX-91246'],
  },
  {
    id: 'SAR-2024-002',
    userId: '2',
    userName: 'Johan Berg',
    dateSubmitted: '2024-02-10T16:42:19',
    dateOfActivity: '2024-02-05T00:00:00',
    status: 'submitted',
    summary: 'Large international transfers without clear business purpose',
    transactions: ['TX-95872', 'TX-95873'],
    notes: ['Subject has history of suspicious activity']
  }
];

// Mock Patterns
export const mockPatterns: Pattern[] = [
  {
    id: 'PTN-001',
    name: 'Multiple Small Transfers (Structuring)',
    description: 'Series of small transfers just below reporting thresholds to the same destination',
    matchCount: 14,
    category: 'structuring',
    createdAt: '2023-10-15T08:30:00'
  },
  {
    id: 'PTN-002',
    name: 'High-Risk Country Corridors',
    description: 'Transfers between countries with elevated risk profiles',
    matchCount: 8,
    category: 'high_risk_corridor',
    createdAt: '2023-11-01T10:15:00'
  },
  {
    id: 'PTN-003',
    name: 'After-Hours Activity Pattern',
    description: 'Transactions consistently occurring during non-business hours (1AM-4AM)',
    matchCount: 6,
    category: 'time_pattern',
    createdAt: '2023-12-05T14:20:00'
  }
];

// Mock Pattern Matches
export const mockPatternMatches: Record<string, PatternMatch[]> = {
  'PTN-001': [
    {
      id: 'MATCH-001',
      patternId: 'PTN-001',
      userId: '3',
      userName: 'Lena Wikström',
      transactionId: 'TX-82901',
      country: 'Sweden',
      amount: 9500,
      currency: 'SEK',
      timestamp: '2023-11-28T14:05:22',
      createdAt: '2023-11-28T14:05:22'
    },
    {
      id: 'MATCH-002',
      patternId: 'PTN-001',
      userId: '3',
      userName: 'Lena Wikström',
      transactionId: 'TX-82902',
      country: 'Sweden',
      amount: 9400,
      currency: 'SEK',
      timestamp: '2023-11-28T14:35:12',
      createdAt: '2023-11-28T14:35:12'
    },
    {
      id: 'MATCH-003',
      patternId: 'PTN-001',
      userId: '3',
      userName: 'Lena Wikström',
      transactionId: 'TX-82903',
      country: 'Sweden',
      amount: 9700,
      currency: 'SEK',
      timestamp: '2023-11-28T15:17:45',
      createdAt: '2023-11-28T15:17:45'
    }
  ],
  'PTN-002': [
    {
      id: 'MATCH-004',
      patternId: 'PTN-002',
      userId: '1',
      userName: 'Alex Nordström',
      transactionId: 'TX-78901',
      country: 'Somalia',
      amount: 15000,
      currency: 'SEK',
      timestamp: '2023-11-05T09:22:31',
      createdAt: '2023-11-05T09:22:31'
    },
    {
      id: 'MATCH-005',
      patternId: 'PTN-002',
      userId: '1',
      userName: 'Alex Nordström',
      transactionId: 'TX-78902',
      country: 'Somalia',
      amount: 12000,
      currency: 'SEK',
      timestamp: '2023-11-07T08:45:19',
      createdAt: '2023-11-07T08:45:19'
    }
  ],
  'PTN-003': [
    {
      id: 'MATCH-006',
      patternId: 'PTN-003',
      userId: '4',
      userName: 'Astrid Lindqvist',
      transactionId: 'TX-91245',
      country: 'Sweden',
      amount: 25000,
      currency: 'SEK',
      timestamp: '2024-01-10T02:12:41',
      createdAt: '2024-01-10T02:12:41'
    },
    {
      id: 'MATCH-007',
      patternId: 'PTN-003',
      userId: '4',
      userName: 'Astrid Lindqvist',
      transactionId: 'TX-91246',
      country: 'United Kingdom',
      amount: 22000,
      currency: 'SEK',
      timestamp: '2024-01-12T02:34:55',
      createdAt: '2024-01-12T02:34:55'
    }
  ]
};

// Mock available users for dropdown
export const mockUsers = [
  { id: '1', name: 'Alex Nordström' },
  { id: '2', name: 'Johan Berg' },
  { id: '3', name: 'Lena Wikström' },
  { id: '4', name: 'Astrid Lindqvist' }
];

// Mock transaction data for selection
export const mockAvailableTransactions = [
  { id: 'TX-78901', description: '15,000 SEK to Somalia on 2023-11-05' },
  { id: 'TX-78902', description: '12,000 SEK to Somalia on 2023-11-07' },
  { id: 'TX-78903', description: '18,500 SEK to Somalia on 2023-11-09' },
  { id: 'TX-82901', description: '9,500 SEK domestic transfer on 2023-11-28' },
  { id: 'TX-82902', description: '9,400 SEK domestic transfer on 2023-11-28' },
  { id: 'TX-82903', description: '9,700 SEK domestic transfer on 2023-11-28' },
  { id: 'TX-82904', description: '9,300 SEK domestic transfer on 2023-11-28' },
  { id: 'TX-91245', description: '25,000 SEK at 2:12 AM on 2024-01-10' },
  { id: 'TX-91246', description: '22,000 SEK to UK at 2:34 AM on 2024-01-12' },
  { id: 'TX-95872', description: '85,000 SEK to Cayman Islands on 2024-02-05' },
  { id: 'TX-95873', description: '72,000 SEK to Cayman Islands on 2024-02-06' }
];
