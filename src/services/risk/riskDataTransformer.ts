
import { AMLTransaction } from '@/types/aml';
import { UnifiedUserData } from '@/context/compliance/types';

// Transform transaction data for rule evaluation
export function prepareTransactionData(transaction: AMLTransaction): any {
  const data = {
    amount: transaction.senderAmount,
    sender_country: transaction.senderCountryCode,
    receiver_country: transaction.receiverCountryCode,
    country: transaction.senderCountryCode,
    transaction_hour: new Date(transaction.timestamp).getHours(),
    involves_crypto: transaction.method === 'crypto',
    payment_method: transaction.method,
    // Enhanced data based on the rules we created
    frequency_24h: Math.floor(Math.random() * 10) + 1,
    unique_recipients_7d: Math.floor(Math.random() * 15) + 1,
    unique_countries_30d: Math.floor(Math.random() * 8) + 1,
    non_eu_countries_30d: Math.floor(Math.random() * 5),
  };
  
  console.log('Prepared transaction data:', data);
  return data;
}

// Transform user data for rule evaluation
export function prepareUserData(user: UnifiedUserData): any {
  // Mock income sources based on user data
  const incomeSourceOptions = ['employment', 'social_support', 'self_employment', 'gift_inheritance', 'property_sale', 'business_other'];
  const mockIncomeSource = incomeSourceOptions[Math.floor(Math.random() * incomeSourceOptions.length)];
  
  const data = {
    is_pep: user.isPEP,
    kyc_completion: user.kycStatus === 'verified' ? 100 : 60,
    sanctions_match: user.isSanctioned,
    age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 30,
    monthly_volume: user.riskScore * 1000,
    income_source: mockIncomeSource,
    cdd_score: user.riskScore,
    shell_company_risk: user.riskScore > 70,
    non_eu_countries_kyc: Math.floor(Math.random() * 5),
  };
  
  console.log('Prepared user data:', data);
  return data;
}
