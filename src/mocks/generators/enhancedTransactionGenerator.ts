
import { AMLTransaction } from '@/types/aml';
import { EnhancedUserProfile } from './enhancedUserGenerator';

// Generate realistic transaction patterns based on user profile
export const generateRealisticTransactions = (user: EnhancedUserProfile): AMLTransaction[] => {
  const transactions: AMLTransaction[] = [];
  const now = new Date();
  
  // Determine transaction count based on frequency
  const getTransactionCount = (): number => {
    switch (user.frequencyOfTransaction) {
      case 'lessThanOncePerMonth': return Math.floor(Math.random() * 2) + 1;
      case 'oncePerMonth': return Math.floor(Math.random() * 3) + 2;
      case 'atleastTwoTimesPerMonth': return Math.floor(Math.random() * 5) + 4;
      case 'oncePerWeek': return Math.floor(Math.random() * 8) + 6;
      case 'moreThanOncePerWeek': return Math.floor(Math.random() * 12) + 10;
      default: return 3;
    }
  };

  // Get amount range based on transfer habit
  const getAmountRange = (): [number, number] => {
    switch (user.transferHabit) {
      case 'lessThanOneThousandSEK': return [100, 999];
      case 'oneToFiveThousandSEK': return [1000, 5000];
      case 'lessThanfiveThousandSEK': return [500, 4999];
      case 'fiveToTenThousandSEK': return [5000, 10000];
      case 'moreThanTenThousandSEK': return [10000, 50000];
      default: return [1000, 5000];
    }
  };

  // Generate receiver names based on relationship
  const generateReceiverName = (relationship: string): string => {
    const familyNames = ['Hassan Ali', 'Amina Hassan', 'Omar Abdullah', 'Fatima Ibrahim'];
    const friendNames = ['Sofia Martinez', 'Carlos Rodriguez', 'Anna Lindberg', 'Erik Svensson'];
    const businessNames = ['Al-Baraka Trading Co', 'Nordic Import Export', 'Mediterranean Services Ltd'];
    
    switch (relationship) {
      case 'family': return familyNames[Math.floor(Math.random() * familyNames.length)];
      case 'friends': return friendNames[Math.floor(Math.random() * friendNames.length)];
      case 'business': return businessNames[Math.floor(Math.random() * businessNames.length)];
      default: return 'Unknown Recipient';
    }
  };

  const transactionCount = getTransactionCount();
  const [minAmount, maxAmount] = getAmountRange();

  for (let i = 0; i < transactionCount; i++) {
    // Generate transaction date within last 90 days, weighted towards recent dates
    const daysAgo = Math.floor(Math.pow(Math.random(), 2) * 90);
    const transactionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    // Pick random receiver country from user's usual destinations
    const receiverCountry = user.receiverCountries[Math.floor(Math.random() * user.receiverCountries.length)];
    
    // Pick random relationship type
    const relationship = user.recipientRelationship[Math.floor(Math.random() * user.recipientRelationship.length)];
    
    // Generate amount within user's typical range
    const amount = Math.floor(Math.random() * (maxAmount - minAmount)) + minAmount;
    
    // Calculate fees (1-3% typically)
    const feePercentage = 0.01 + Math.random() * 0.02;
    const receiverAmount = Math.floor(amount * (1 - feePercentage));

    // Determine risk factors
    const isHighRiskCountry = ['Somalia', 'Somaliland', 'Iraq', 'Syria', 'Afghanistan'].includes(receiverCountry);
    const isLargeAmount = amount > 15000;
    const isFrequentSender = user.frequencyOfTransaction === 'moreThanOncePerWeek';
    
    // Calculate transaction risk score
    let transactionRiskScore = 30; // Base score
    if (isHighRiskCountry) transactionRiskScore += 25;
    if (isLargeAmount) transactionRiskScore += 20;
    if (isFrequentSender) transactionRiskScore += 15;
    if (user.isPEP) transactionRiskScore += 20;
    
    const transaction: AMLTransaction = {
      id: `tx_${user.id}_${i + 1}`,
      senderUserId: user.id,
      senderName: user.fullName,
      receiverUserId: `receiver_${user.id}_${i + 1}`,
      receiverName: generateReceiverName(relationship),
      timestamp: transactionDate.toISOString(),
      status: Math.random() > 0.05 ? 'completed' : 'pending',
      senderAmount: amount,
      receiverAmount,
      senderCurrency: 'SEK',
      receiverCurrency: 'SEK', // Simplified for this example
      senderCountryCode: 'SE',
      receiverCountryCode: getCountryCode(receiverCountry),
      method: Math.random() > 0.3 ? 'bank' : 'mobile',
      reasonForSending: getReasonForSending(relationship, amount),
      isSuspect: transactionRiskScore > 70,
      riskScore: Math.min(100, transactionRiskScore)
    };

    transactions.push(transaction);
  }

  return transactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

// Helper function to get country codes
const getCountryCode = (country: string): string => {
  const countryCodes: Record<string, string> = {
    'Somalia': 'SO',
    'Somaliland': 'SO',
    'Egypt': 'EG',
    'Jordan': 'JO',
    'Lebanon': 'LB',
    'Spain': 'ES',
    'Colombia': 'CO',
    'Mexico': 'MX',
    'Norway': 'NO',
    'Denmark': 'DK',
    'Finland': 'FI',
    'Iraq': 'IQ',
    'Syria': 'SY',
    'Turkey': 'TR'
  };
  return countryCodes[country] || 'XX';
};

// Generate realistic reasons for sending based on relationship and amount
const getReasonForSending = (relationship: string, amount: number): string => {
  const familyReasons = ['Family support', 'Medical expenses', 'Education fees', 'Living expenses'];
  const friendReasons = ['Personal loan', 'Shared expenses', 'Gift', 'Travel expenses'];
  const businessReasons = ['Payment for goods', 'Services rendered', 'Business investment', 'Trade settlement'];
  
  if (relationship === 'family') {
    return amount > 10000 ? 'Medical expenses' : familyReasons[Math.floor(Math.random() * familyReasons.length)];
  } else if (relationship === 'business') {
    return businessReasons[Math.floor(Math.random() * businessReasons.length)];
  } else {
    return friendReasons[Math.floor(Math.random() * friendReasons.length)];
  }
};
