
import { AMLTransaction } from '@/types/aml';

const currencies = ['USD', 'EUR', 'GBP', 'SEK'] as const;
const countries = ['US', 'GB', 'SE', 'DE', 'FR', 'CA', 'AU'] as const;
const methods = ['bank', 'card', 'crypto', 'wire'] as const;
const statuses = ['completed', 'pending', 'failed', 'flagged'] as const;

export const generateMockTransaction = (id?: string): AMLTransaction => {
  const amount = Math.random() * 50000 + 100;
  const riskScore = Math.floor(Math.random() * 100);
  const senderCountry = countries[Math.floor(Math.random() * countries.length)];
  const receiverCountry = Math.random() > 0.7 ? countries[Math.floor(Math.random() * countries.length)] : senderCountry;
  
  // Generate risk factors as notes
  const riskFactors = [];
  if (amount > 10000) riskFactors.push('High value transaction');
  if (senderCountry !== receiverCountry) riskFactors.push('Cross-border transaction');
  if (riskScore > 70) riskFactors.push('Unusual transaction pattern detected');
  if (Math.random() > 0.8) riskFactors.push('Frequent transactions from sender');
  
  return {
    id: id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    senderUserId: `user_${Math.floor(Math.random() * 1000)}`,
    senderName: `Sender ${Math.floor(Math.random() * 1000)}`,
    receiverUserId: `user_${Math.floor(Math.random() * 1000)}`,
    receiverName: `Receiver ${Math.floor(Math.random() * 1000)}`,
    senderAmount: amount,
    senderCurrency: currencies[Math.floor(Math.random() * currencies.length)],
    receiverAmount: amount * (0.95 + Math.random() * 0.1), // Small exchange rate variation
    receiverCurrency: currencies[Math.floor(Math.random() * currencies.length)],
    senderCountryCode: senderCountry,
    receiverCountryCode: receiverCountry,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    reasonForSending: 'Payment for services',
    method: methods[Math.floor(Math.random() * methods.length)],
    isSuspect: riskScore > 70,
    riskScore,
    notes: riskFactors.join(', ') // Join factors as a single string
  };
};

export const generateMockTransactions = (count: number): AMLTransaction[] => {
  return Array.from({ length: count }, (_, i) => generateMockTransaction(`tx_${i + 1}`));
};
