
import { TransactionCurrency, TransactionMethod } from './transaction';

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'flagged';

export interface AMLTransaction {
  id: string;
  senderUserId: string;
  senderName: string;
  receiverUserId?: string;
  receiverName?: string;
  senderAmount: number;
  senderCurrency: TransactionCurrency;
  receiverAmount?: number;
  receiverCurrency?: TransactionCurrency;
  senderCountry?: string;
  senderCountryCode: string;
  receiverCountry?: string;
  receiverCountryCode: string;
  amount?: number;
  currency?: TransactionCurrency;
  timestamp: string;
  type?: string;
  status: TransactionStatus;
  reasonForSending: string;
  method: TransactionMethod;
  isSuspect: boolean;
  riskScore: number; // 0-100
  flags: string[]; // Add missing flags property
  notes?: string[];
}

export interface CountryRisk {
  countryCode: string;
  countryName: string;
  riskLevel: 'high' | 'medium' | 'low';
}

export const HIGH_RISK_COUNTRIES: CountryRisk[] = [
  { countryCode: 'AF', countryName: 'Afghanistan', riskLevel: 'high' },
  { countryCode: 'IR', countryName: 'Iran', riskLevel: 'high' },
  { countryCode: 'KP', countryName: 'North Korea', riskLevel: 'high' },
  { countryCode: 'RU', countryName: 'Russia', riskLevel: 'high' },
  { countryCode: 'SY', countryName: 'Syria', riskLevel: 'high' },
  { countryCode: 'VE', countryName: 'Venezuela', riskLevel: 'high' },
  { countryCode: 'BY', countryName: 'Belarus', riskLevel: 'high' },
  { countryCode: 'MM', countryName: 'Myanmar', riskLevel: 'high' },
  { countryCode: 'CU', countryName: 'Cuba', riskLevel: 'medium' },
  { countryCode: 'SO', countryName: 'Somalia', riskLevel: 'medium' },
  { countryCode: 'YE', countryName: 'Yemen', riskLevel: 'medium' }
];
