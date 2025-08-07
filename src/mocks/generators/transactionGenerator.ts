import { AMLTransaction, TransactionStatus } from '@/types/aml';

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const getRandomValue = (array: any[]) => array[Math.floor(Math.random() * array.length)];

const generateRandomAmount = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

const generateRandomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

export const generateMockTransactions = (count: number = 50): AMLTransaction[] => {
  return Array.from({ length: count }, () => {
    const id = generateUUID();
    const senderUserId = generateUUID();
    const receiverUserId = generateUUID();
    const senderName = `Sender ${Math.floor(Math.random() * 100)}`;
    const receiverName = `Receiver ${Math.floor(Math.random() * 100)}`;
    const timestamp = generateRandomDate(new Date(2023, 0, 1), new Date());
    const statuses: TransactionStatus[] = ['pending', 'completed', 'failed', 'flagged'];
    const status = getRandomValue(statuses);
    const senderAmount = generateRandomAmount(100, 10000);
    const receiverAmount = senderAmount - generateRandomAmount(0, 10);
    const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
    const senderCurrency = getRandomValue(currencies);
    const receiverCurrency = senderCurrency;
    const countryCodes = ['US', 'CA', 'GB', 'DE', 'FR'];
    const senderCountryCode = getRandomValue(countryCodes);
    const receiverCountryCode = getRandomValue(countryCodes);
    const methods = ['bank', 'credit_card', 'paypal'];
    const method = getRandomValue(methods);
    const reasons = ['invoice', 'gift', 'investment', 'personal'];
    const reasonForSending = getRandomValue(reasons);
    const isSuspect = Math.random() < 0.2;
    const riskScore = Math.floor(Math.random() * 100);

    const transaction = {
      id,
      senderUserId,
      senderName,
      receiverUserId,
      receiverName,
      timestamp,
      status,
      senderAmount,
      receiverAmount,
      senderCurrency,
      receiverCurrency,
      senderCountryCode,
      receiverCountryCode,
      method,
      reasonForSending,
      isSuspect,
      riskScore,
      flags: isSuspect ? ['High Risk'] : [], // Add the missing flags property
      notes: []
    };

    return transaction as AMLTransaction;
  });
};
