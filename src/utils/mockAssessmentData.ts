
import { AMLTransaction } from '@/types/aml';

export function getMockTransactions(): AMLTransaction[] {
  return [
    {
      id: 'tx_high_risk_001',
      senderUserId: 'user_001',
      senderName: 'Ahmed Hassan',
      receiverUserId: 'user_002',
      receiverName: 'Jane Doe',
      senderAmount: 18000,
      receiverAmount: 17850,
      senderCurrency: 'USD' as const,
      receiverCurrency: 'USD' as const,
      senderCountryCode: 'AF', // High risk country
      receiverCountryCode: 'US',
      method: 'crypto' as const,
      timestamp: new Date().toISOString(),
      status: 'completed' as const,
      reasonForSending: 'Business payment',
      isSuspect: true,
      riskScore: 75
    },
    {
      id: 'tx_medium_risk_002',
      senderUserId: 'user_003',
      senderName: 'Michael Johnson',
      receiverUserId: 'user_004',
      receiverName: 'Sofia Rodriguez',
      senderAmount: 8500,
      receiverAmount: 8400,
      senderCurrency: 'USD' as const,
      receiverCurrency: 'USD' as const,
      senderCountryCode: 'US',
      receiverCountryCode: 'CO',
      method: 'bank' as const,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
      reasonForSending: 'Investment',
      isSuspect: false,
      riskScore: 45
    },
    {
      id: 'tx_low_risk_003',
      senderUserId: 'user_005',
      senderName: 'Lisa Chen',
      receiverUserId: 'user_006',
      receiverName: 'David Johnson',
      senderAmount: 2500,
      receiverAmount: 2475,
      senderCurrency: 'USD' as const,
      receiverCurrency: 'USD' as const,
      senderCountryCode: 'SG',
      receiverCountryCode: 'UK',
      method: 'bank' as const,
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
      status: 'completed' as const,
      reasonForSending: 'Personal transfer',
      isSuspect: false,
      riskScore: 15
    }
  ];
}
