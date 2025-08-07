
import { generateTransactions } from './generators/enhancedTransactionGenerator';
import { generateUsers } from './generators/enhancedUserGenerator';
import { generateDocuments } from './generators/enhancedDocumentGenerator';
import { generateAllCases } from './generators/caseGenerator';
import { generateNews } from './generators/newsGenerator';
import { AMLTransaction } from '@/types/aml';
import { ComplianceCase } from '@/types/compliance';
import { UnifiedUserData } from '@/context/compliance/types';
import { Document } from '@/types/supabase';
import { NewsItem } from '@/types/news';

// Constants for data generation
const TRANSACTION_COUNT = 1000;
const USER_COUNT = 200;
const DOCUMENT_COUNT = 150;
const CASE_COUNT = 80;
const NEWS_COUNT = 25;

// Generate enhanced transactions with proper AMLTransaction interface
const generatedTransactions = generateTransactions(TRANSACTION_COUNT);
export const mockTransactions: AMLTransaction[] = generatedTransactions.map(transaction => ({
  id: transaction.id,
  senderUserId: transaction.senderUserId,
  senderName: transaction.senderName,
  senderAmount: transaction.senderAmount,
  senderCurrency: transaction.senderCurrency,
  senderCountry: transaction.senderCountryCode,
  senderCountryCode: transaction.senderCountryCode,
  receiverName: transaction.receiverName,
  receiverAmount: transaction.receiverAmount,
  receiverCurrency: transaction.receiverCurrency,
  receiverCountry: transaction.receiverCountryCode,
  receiverCountryCode: transaction.receiverCountryCode,
  amount: transaction.senderAmount,
  currency: transaction.senderCurrency,
  timestamp: transaction.timestamp,
  type: 'transfer',
  status: transaction.status,
  riskScore: transaction.riskScore,
  flags: transaction.isSuspect ? ['High Risk'] : [],
}));

// Generate mock users
export const mockUsers: UnifiedUserData[] = generateUsers(USER_COUNT);

// Generate mock documents  
export const mockDocuments: Document[] = generateDocuments(DOCUMENT_COUNT);

// Generate mock cases with correct status values
const generatedCases = generateAllCases();
export const mockCases: ComplianceCase[] = generatedCases.map(caseData => ({
  ...caseData,
  // Ensure status is one of the allowed values, convert pending_info to under_review
  status: caseData.status === 'pending_info' ? 'under_review' : caseData.status as 'open' | 'under_review' | 'escalated' | 'closed',
}));

// Generate mock news
export const mockNews: NewsItem[] = generateNews(NEWS_COUNT);

// Export with consistent naming for backward compatibility
export const mockTransactionsCollection = mockTransactions;
export const unifiedMockData = mockUsers;
export const mockDocumentsCollection = mockDocuments;
export const mockComplianceCasesCollection = mockCases;

// Export statistics for dashboard use
export const mockStats = {
  transactions: {
    total: mockTransactions.length,
    highRisk: mockTransactions.filter(t => t.riskScore > 70).length,
    flagged: mockTransactions.filter(t => t.flags.length > 0).length,
  },
  users: {
    total: mockUsers.length,
    verified: mockUsers.filter(u => u.kycStatus === 'verified').length,
    pending: mockUsers.filter(u => u.kycStatus === 'pending').length,
    flagged: mockUsers.filter(u => u.kycStatus === 'rejected').length,
  },
  documents: {
    total: mockDocuments.length,
    verified: mockDocuments.filter(d => d.status === 'verified').length,
    pending: mockDocuments.filter(d => d.status === 'pending').length,
    rejected: mockDocuments.filter(d => d.status === 'rejected').length,
  },
  cases: {
    total: mockCases.length,
    open: mockCases.filter(c => c.status === 'open').length,
    underReview: mockCases.filter(c => c.status === 'under_review').length,
    escalated: mockCases.filter(c => c.status === 'escalated').length,
    closed: mockCases.filter(c => c.status === 'closed').length,
  },
};

console.log('Mock data initialized:', {
  transactions: mockTransactions.length,
  users: mockUsers.length,
  documents: mockDocuments.length,
  cases: mockCases.length,
  news: mockNews.length,
});
