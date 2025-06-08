import { Transaction, TransactionAlert } from '@/types/transaction';
import { mockTransactionsCollection } from '@/mocks/centralizedMockData';

// Transform AML transactions to Transaction format
const transformAMLToTransaction = (amlTx: any): Transaction => ({
  id: amlTx.id,
  userId: amlTx.senderUserId,
  userName: amlTx.senderName,
  amount: amlTx.senderAmount,
  currency: amlTx.senderCurrency as Transaction['currency'],
  timestamp: amlTx.timestamp,
  originCountry: amlTx.senderCountryCode,
  destinationCountry: amlTx.receiverCountryCode,
  method: amlTx.method as Transaction['method'],
  description: amlTx.reasonForSending,
  riskScore: amlTx.riskScore,
  flagged: amlTx.isSuspect
});

// Use centralized transaction data
export const generateMockTransactions = (count = 20): Transaction[] => {
  return mockTransactionsCollection.slice(0, count).map(transformAMLToTransaction);
};

// List of high risk countries (for demonstration)
export const HIGH_RISK_COUNTRIES = [
  'Afghanistan', 'North Korea', 'Iran', 'Myanmar', 'Syria', 
  'Yemen', 'Haiti', 'Iraq', 'Libya', 'Venezuela'
];

// Generate random transaction ID
const generateTransactionId = () => `TX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

// Generate a random date in the past 30 days
const randomPastDate = (daysAgo = 30) => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysAgo));
  // Add random hours and minutes
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date.toISOString();
};

// Common countries for transactions
const COMMON_COUNTRIES = [
  'Sweden', 'United States', 'Germany', 'United Kingdom', 'Norway', 
  'Denmark', 'Finland', 'France', 'Spain', 'Italy', 'China', 'Japan',
  'Canada', 'Australia', 'Brazil', 'India'
];

// Generate a random country, with a small chance of picking a high-risk one
const randomCountry = (highRiskProbability = 0.1) => {
  if (Math.random() < highRiskProbability) {
    return HIGH_RISK_COUNTRIES[Math.floor(Math.random() * HIGH_RISK_COUNTRIES.length)];
  }
  return COMMON_COUNTRIES[Math.floor(Math.random() * COMMON_COUNTRIES.length)];
};

// List of user IDs and names for mock transactions
const MOCK_USERS = [
  { id: 'user-1', name: 'John Smith' },
  { id: 'user-2', name: 'Maria Garcia' },
  { id: 'user-3', name: 'Ahmed Hassan' },
  { id: 'user-4', name: 'Li Wei' },
  { id: 'user-5', name: 'Sarah Johnson' },
  { id: 'user-6', name: 'Olaf Svensson' },
  { id: 'user-7', name: 'Aisha Patel' },
  { id: 'user-8', name: 'Carlos Rodriguez' }
];

// Pick a random user
const randomUser = () => {
  return MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
};

// Calculate risk score based on transaction properties
const calculateRiskScore = (transaction: Partial<Transaction>): number => {
  let score = 0;
  
  // Amount-based risk (higher amounts = higher risk)
  if (transaction.amount) {
    if (transaction.amount > 50000) score += 40;
    else if (transaction.amount > 10000) score += 25;
    else if (transaction.amount > 5000) score += 15;
    else if (transaction.amount > 1000) score += 5;
  }
  
  // Country-based risk
  if (HIGH_RISK_COUNTRIES.includes(transaction.originCountry || '')) score += 30;
  if (HIGH_RISK_COUNTRIES.includes(transaction.destinationCountry || '')) score += 30;
  
  // Method-based risk (cash and crypto are higher risk)
  if (transaction.method === 'cash') score += 20;
  if (transaction.method === 'crypto') score += 25;
  
  // Add some randomness (± 10 points)
  score += Math.floor(Math.random() * 20) - 10;
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, score));
};

// Generate a single mock transaction
export const generateMockTransaction = (
  overrides: Partial<Transaction> = {}
): Transaction => {
  const user = randomUser();
  const amount = overrides.amount ?? Math.round(Math.random() * 20000) + 100;
  const originCountry = overrides.originCountry ?? randomCountry(0.1);
  const destinationCountry = overrides.destinationCountry ?? randomCountry(0.1);
  const method = overrides.method ?? (['card', 'bank', 'cash', 'mobile', 'crypto'][Math.floor(Math.random() * 5)] as Transaction['method']);
  
  const transaction: Transaction = {
    id: overrides.id ?? generateTransactionId(),
    userId: overrides.userId ?? user.id,
    userName: overrides.userName ?? user.name,
    amount,
    currency: overrides.currency ?? (['SEK', 'USD', 'EUR', 'GBP'][Math.floor(Math.random() * 4)] as Transaction['currency']),
    timestamp: overrides.timestamp ?? randomPastDate(),
    originCountry,
    destinationCountry,
    method,
    description: overrides.description ?? `Payment to ${destinationCountry}`,
    riskScore: 0, // Placeholder, will be calculated
    flagged: false // Placeholder, will be determined
  };
  
  // Calculate risk score
  transaction.riskScore = overrides.riskScore ?? calculateRiskScore(transaction);
  
  // Determine if flagged
  transaction.flagged = overrides.flagged ?? (transaction.riskScore > 70);
  
  return transaction;
};

// Generate mock alerts based on transactions
export const generateMockAlerts = (transactions: Transaction[]): TransactionAlert[] => {
  return transactions
    .filter(t => t.flagged)
    .map(transaction => {
      let alertType: TransactionAlert['type'] = 'high_value';
      
      if (transaction.amount > 50000) {
        alertType = 'high_value';
      } else if (HIGH_RISK_COUNTRIES.includes(transaction.destinationCountry)) {
        alertType = 'high_risk_country';
      } else if (transaction.amount > 8000 && transaction.amount < 10000) {
        alertType = 'structuring';
      } else if (transaction.method === 'crypto') {
        alertType = 'suspicious_pattern';
      }
      
      return {
        id: `ALERT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        transactionId: transaction.id,
        userId: transaction.userId,
        userName: transaction.userName,
        type: alertType,
        description: getAlertDescription(alertType, transaction),
        timestamp: new Date().toISOString(),
        status: 'open',
        notes: []
      };
    });
};

// Get alert description based on type and transaction
function getAlertDescription(
  type: TransactionAlert['type'], 
  transaction: Transaction
): string {
  switch (type) {
    case 'high_value':
      return `Large transaction of ${transaction.amount} ${transaction.currency} detected`;
    case 'high_risk_country':
      return `Transaction to high-risk country (${transaction.destinationCountry})`;
    case 'structuring':
      return `Possible structuring - amount ${transaction.amount} ${transaction.currency} is just below reporting threshold`;
    case 'suspicious_pattern':
      return `Suspicious transaction pattern detected using ${transaction.method}`;
    case 'frequency':
      return `Unusual transaction frequency detected for user`;
    default:
      return `Suspicious transaction flagged for review`;
  }
}

// Create a mock dataset with transactions and alerts
export const createMockTransactionData = () => {
  const transactions = generateMockTransactions(25);
  const alerts = generateMockAlerts(transactions);
  return { transactions, alerts };
};

// Export mock data
export const mockTransactionData = createMockTransactionData();
