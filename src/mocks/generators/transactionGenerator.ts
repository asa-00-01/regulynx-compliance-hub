
import { AMLTransaction } from '@/types/aml';
import { userProfiles } from './userGenerator';

const getRandomDateInPast = (daysBack: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  return date.toISOString();
};

const getRandomAmount = (riskScore: number): number => {
  // Higher risk users tend to have larger transaction amounts
  if (riskScore > 70) return Math.floor(Math.random() * 100000) + 50000;
  if (riskScore > 50) return Math.floor(Math.random() * 50000) + 10000;
  if (riskScore > 30) return Math.floor(Math.random() * 25000) + 5000;
  return Math.floor(Math.random() * 10000) + 1000;
};

const getReceivingCountry = (riskScore: number): string => {
  const highRiskCountries = ['AF', 'IR', 'KP', 'SY', 'VE', 'BY', 'MM'];
  const mediumRiskCountries = ['RU', 'CU', 'SO', 'YE', 'TR'];
  const lowRiskCountries = ['GB', 'DE', 'FR', 'CA', 'AU', 'SE', 'NO', 'DK'];
  
  if (riskScore > 70) {
    return highRiskCountries[Math.floor(Math.random() * highRiskCountries.length)];
  } else if (riskScore > 50) {
    return mediumRiskCountries[Math.floor(Math.random() * mediumRiskCountries.length)];
  } else {
    return lowRiskCountries[Math.floor(Math.random() * lowRiskCountries.length)];
  }
};

const getTransactionMethod = (riskScore: number): 'card' | 'bank' | 'cash' | 'mobile' | 'crypto' => {
  if (riskScore > 70) return Math.random() > 0.6 ? 'crypto' : 'cash';
  if (riskScore > 50) return Math.random() > 0.7 ? 'cash' : 'bank';
  return Math.random() > 0.8 ? 'mobile' : 'bank';
};

const getReasonForSending = (riskScore: number): string => {
  const highRiskReasons = ['Investment', 'Business loan', 'Property purchase', 'Consulting fee'];
  const mediumRiskReasons = ['Business payment', 'Invoice payment', 'Service fee', 'Equipment purchase'];
  const lowRiskReasons = ['Personal transfer', 'Family support', 'Gift', 'Tuition payment', 'Travel expenses'];
  
  if (riskScore > 70) {
    return highRiskReasons[Math.floor(Math.random() * highRiskReasons.length)];
  } else if (riskScore > 50) {
    return mediumRiskReasons[Math.floor(Math.random() * mediumRiskReasons.length)];
  } else {
    return lowRiskReasons[Math.floor(Math.random() * lowRiskReasons.length)];
  }
};

export const generateTransactionsForUser = (user: typeof userProfiles[0], count: number = 5): AMLTransaction[] => {
  const transactions: AMLTransaction[] = [];
  
  for (let i = 0; i < count; i++) {
    const amount = getRandomAmount(user.riskScore);
    const receiverCountry = getReceivingCountry(user.riskScore);
    const method = getTransactionMethod(user.riskScore);
    const reason = getReasonForSending(user.riskScore);
    
    transactions.push({
      id: `tx_${user.id}_${i + 1}`,
      senderUserId: user.id,
      senderName: user.fullName,
      receiverUserId: `receiver_${user.id}_${i + 1}`,
      receiverName: `Receiver ${i + 1}`,
      timestamp: getRandomDateInPast(90),
      status: Math.random() > 0.1 ? 'completed' : 'pending',
      senderAmount: amount,
      receiverAmount: amount * 0.98, // 2% fee
      senderCurrency: 'USD',
      receiverCurrency: 'USD',
      senderCountryCode: user.countryOfResidence === 'United States' ? 'US' : 
                        user.countryOfResidence === 'Spain' ? 'ES' :
                        user.countryOfResidence === 'Egypt' ? 'EG' :
                        user.countryOfResidence === 'China' ? 'CN' :
                        user.countryOfResidence === 'Canada' ? 'CA' :
                        user.countryOfResidence === 'Russia' ? 'RU' :
                        user.countryOfResidence === 'United Arab Emirates' ? 'AE' :
                        user.countryOfResidence === 'Colombia' ? 'CO' :
                        user.countryOfResidence === 'United Kingdom' ? 'GB' :
                        user.countryOfResidence === 'India' ? 'IN' :
                        user.countryOfResidence === 'Poland' ? 'PL' :
                        user.countryOfResidence === 'Saudi Arabia' ? 'SA' :
                        user.countryOfResidence === 'France' ? 'FR' :
                        user.countryOfResidence === 'Germany' ? 'DE' :
                        user.countryOfResidence === 'Brazil' ? 'BR' :
                        user.countryOfResidence === 'Japan' ? 'JP' :
                        user.countryOfResidence === 'Ukraine' ? 'UA' :
                        user.countryOfResidence === 'Denmark' ? 'DK' :
                        user.countryOfResidence === 'Qatar' ? 'QA' : 'US',
      receiverCountryCode: receiverCountry,
      method,
      reasonForSending: reason,
      isSuspect: user.riskScore > 60 && Math.random() > 0.7,
      riskScore: Math.max(10, user.riskScore + Math.floor(Math.random() * 20 - 10)),
      notes: user.riskScore > 70 ? ['High-value transaction', 'Enhanced monitoring required'] : []
    });
  }
  
  return transactions;
};

export const generateAllTransactions = (): AMLTransaction[] => {
  return userProfiles.flatMap(user => generateTransactionsForUser(user, Math.floor(Math.random() * 8) + 3));
};
