
import { AMLTransaction } from '@/types/aml';

// Utility function to generate a random number within a range
const getRandomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

// Utility function to generate a random boolean value
const getRandomBoolean = (): boolean => {
  return Math.random() < 0.5;
};

// Utility function to generate a random item from an array
const getRandomItem = <T>(array: T[]): T => {
  const randomIndex = Math.floor(Math.random() * array.length);
  return array[randomIndex];
};

// Function to generate a realistic-sounding name
const generateName = (): string => {
  const firstNames = ['Alice', 'Bob', 'Charlie', 'David', 'Eve', 'Grace', 'Jack', 'Jane', 'Kevin', 'Linda'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Wilson'];
  return `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}`;
};

// Function to generate a random country code
const generateCountryCode = (): string => {
  const countryCodes = ['US', 'GB', 'CA', 'DE', 'FR', 'AU', 'JP', 'CN', 'IN', 'BR'];
  return getRandomItem(countryCodes);
};

// Function to generate a random transaction status
const generateTransactionStatus = (): AMLTransaction['status'] => {
  const statuses: AMLTransaction['status'][] = ['completed', 'pending', 'failed', 'flagged'];
  return getRandomItem(statuses);
};

// Function to generate a random method
const generateMethod = (): 'card' | 'bank' | 'cash' | 'mobile' | 'crypto' => {
  const methods: ('card' | 'bank' | 'cash' | 'mobile' | 'crypto')[] = ['bank', 'card', 'mobile', 'crypto'];
  return getRandomItem(methods);
};

// Function to generate a random reason for sending
const generateReasonForSending = (): string => {
  const reasons = ['Personal transfer', 'Bill payment', 'Investment', 'Salary', 'Gift'];
  return getRandomItem(reasons);
};

export const generateTransactions = (count: number = 100): AMLTransaction[] => {
  return Array.from({ length: count }, () => {
    const id = `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const senderUserId = `USER-${Math.floor(Math.random() * 500)}`;
    const senderName = generateName();
    const receiverUserId = `USER-${Math.floor(Math.random() * 500)}`;
    const receiverName = generateName();
    const timestamp = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(); // Up to 30 days in the past
    const status = generateTransactionStatus();
    const senderAmount = getRandomNumber(10, 10000);
    const receiverAmount = senderAmount - getRandomNumber(0, 100); // Simulate fees
    const senderCurrency = 'USD' as const;
    const receiverCurrency = 'USD' as const;
    const senderCountryCode = generateCountryCode();
    const receiverCountryCode = generateCountryCode();
    const method = generateMethod();
    const reasonForSending = generateReasonForSending();
    const isSuspect = getRandomBoolean();
    const riskScore = getRandomNumber(0, 100);

    return {
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
      flags: isSuspect ? ['High Risk', 'Suspicious Pattern'] : [], // Add the missing flags property
      notes: []
    };
  });
};
