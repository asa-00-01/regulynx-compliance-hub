
import { UnifiedUserData } from '@/context/compliance/types';
import { AMLTransaction } from '@/types/aml';
import { Document } from '@/types';
import { ComplianceCaseDetails } from '@/types/case';

// Base customer data with realistic information
export const baseCustomers = [
  {
    id: 'user_001',
    fullName: 'John Smith',
    email: 'john.smith@email.com',
    dateOfBirth: '1985-03-15',
    nationality: 'American',
    identityNumber: 'US123456789',
    phoneNumber: '+1-555-0101',
    address: '123 Main Street, New York, NY 10001',
    countryOfResidence: 'United States',
    riskScore: 25,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified' as const
  },
  {
    id: 'user_002',
    fullName: 'Maria Garcia',
    email: 'maria.garcia@email.com',
    dateOfBirth: '1990-07-22',
    nationality: 'Spanish',
    identityNumber: 'ES987654321',
    phoneNumber: '+34-600-123456',
    address: 'Calle Mayor 45, Madrid, Spain',
    countryOfResidence: 'Spain',
    riskScore: 35,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified' as const
  },
  {
    id: 'user_003',
    fullName: 'Ahmed Hassan',
    email: 'ahmed.hassan@email.com',
    dateOfBirth: '1978-12-03',
    nationality: 'Egyptian',
    identityNumber: 'EG456789123',
    phoneNumber: '+20-100-123456',
    address: '15 Tahrir Square, Cairo, Egypt',
    countryOfResidence: 'Egypt',
    riskScore: 65,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'pending' as const
  },
  {
    id: 'user_004',
    fullName: 'Li Wei',
    email: 'li.wei@email.com',
    dateOfBirth: '1982-09-18',
    nationality: 'Chinese',
    identityNumber: 'CN789123456',
    phoneNumber: '+86-138-0013-8000',
    address: '88 Nanjing Road, Shanghai, China',
    countryOfResidence: 'China',
    riskScore: 45,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified' as const
  },
  {
    id: 'user_005',
    fullName: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    dateOfBirth: '1995-01-12',
    nationality: 'Canadian',
    identityNumber: 'CA321654987',
    phoneNumber: '+1-416-555-0123',
    address: '456 Queen Street, Toronto, ON M5V 2A8',
    countryOfResidence: 'Canada',
    riskScore: 20,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified' as const
  },
  {
    id: 'user_006',
    fullName: 'Viktor Petrov',
    email: 'viktor.petrov@email.com',
    dateOfBirth: '1975-11-30',
    nationality: 'Russian',
    identityNumber: 'RU654321987',
    phoneNumber: '+7-495-123-4567',
    address: 'Tverskaya Street 10, Moscow, Russia',
    countryOfResidence: 'Russia',
    riskScore: 85,
    isPEP: true,
    isSanctioned: false,
    kycStatus: 'information_requested' as const
  },
  {
    id: 'user_007',
    fullName: 'Fatima Al-Zahra',
    email: 'fatima.alzahra@email.com',
    dateOfBirth: '1988-04-25',
    nationality: 'Emirati',
    identityNumber: 'AE147258369',
    phoneNumber: '+971-50-123-4567',
    address: 'Sheikh Zayed Road, Dubai, UAE',
    countryOfResidence: 'United Arab Emirates',
    riskScore: 55,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified' as const
  },
  {
    id: 'user_008',
    fullName: 'Carlos Rodriguez',
    email: 'carlos.rodriguez@email.com',
    dateOfBirth: '1983-08-14',
    nationality: 'Colombian',
    identityNumber: 'CO852963741',
    phoneNumber: '+57-300-123-4567',
    address: 'Carrera 11, Bogotá, Colombia',
    countryOfResidence: 'Colombia',
    riskScore: 75,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'pending' as const
  },
  {
    id: 'user_009',
    fullName: 'Emma Wilson',
    email: 'emma.wilson@email.com',
    dateOfBirth: '1992-06-08',
    nationality: 'British',
    identityNumber: 'GB369852147',
    phoneNumber: '+44-20-7946-0958',
    address: '10 Downing Street, London, UK',
    countryOfResidence: 'United Kingdom',
    riskScore: 30,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified' as const
  },
  {
    id: 'user_010',
    fullName: 'Raj Patel',
    email: 'raj.patel@email.com',
    dateOfBirth: '1979-02-14',
    nationality: 'Indian',
    identityNumber: 'IN741852963',
    phoneNumber: '+91-98765-43210',
    address: 'Marine Drive, Mumbai, India',
    countryOfResidence: 'India',
    riskScore: 40,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified' as const
  },
  {
    id: 'user_011',
    fullName: 'Anna Kowalski',
    email: 'anna.kowalski@email.com',
    dateOfBirth: '1987-10-05',
    nationality: 'Polish',
    identityNumber: 'PL258741369',
    phoneNumber: '+48-123-456-789',
    address: 'Krakowskie Przedmieście 5, Warsaw, Poland',
    countryOfResidence: 'Poland',
    riskScore: 25,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified' as const
  },
  {
    id: 'user_012',
    fullName: 'Mohammad Al-Rashid',
    email: 'mohammad.alrashid@email.com',
    dateOfBirth: '1981-05-20',
    nationality: 'Saudi',
    identityNumber: 'SA159753486',
    phoneNumber: '+966-50-123-4567',
    address: 'King Fahd Road, Riyadh, Saudi Arabia',
    countryOfResidence: 'Saudi Arabia',
    riskScore: 70,
    isPEP: false,
    isSanctioned: true,
    kycStatus: 'rejected' as const
  },
  {
    id: 'user_013',
    fullName: 'Sophie Dubois',
    email: 'sophie.dubois@email.com',
    dateOfBirth: '1993-09-12',
    nationality: 'French',
    identityNumber: 'FR357951486',
    phoneNumber: '+33-1-42-86-83-00',
    address: 'Champs-Élysées 100, Paris, France',
    countryOfResidence: 'France',
    riskScore: 15,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified' as const
  },
  {
    id: 'user_014',
    fullName: 'Klaus Mueller',
    email: 'klaus.mueller@email.com',
    dateOfBirth: '1976-12-28',
    nationality: 'German',
    identityNumber: 'DE486159753',
    phoneNumber: '+49-30-12345678',
    address: 'Unter den Linden 1, Berlin, Germany',
    countryOfResidence: 'Germany',
    riskScore: 35,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified' as const
  },
  {
    id: 'user_015',
    fullName: 'Isabella Silva',
    email: 'isabella.silva@email.com',
    dateOfBirth: '1989-11-16',
    nationality: 'Brazilian',
    identityNumber: 'BR753486159',
    phoneNumber: '+55-11-98765-4321',
    address: 'Avenida Paulista 1000, São Paulo, Brazil',
    countryOfResidence: 'Brazil',
    riskScore: 50,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'pending' as const
  }
];

// Generate consistent transactions for each user
export const generateTransactionsForUser = (userId: string, userName: string, riskScore: number): AMLTransaction[] => {
  const baseTransactions: Partial<AMLTransaction>[] = [
    {
      senderAmount: riskScore > 70 ? 75000 : riskScore > 50 ? 25000 : 5000,
      receiverAmount: riskScore > 70 ? 74000 : riskScore > 50 ? 24500 : 4950,
      senderCurrency: 'USD',
      receiverCurrency: 'USD',
      senderCountryCode: 'US',
      receiverCountryCode: riskScore > 70 ? 'AF' : riskScore > 50 ? 'TR' : 'GB',
      method: riskScore > 70 ? 'crypto' : riskScore > 50 ? 'cash' : 'bank',
      reasonForSending: riskScore > 70 ? 'Investment' : riskScore > 50 ? 'Business payment' : 'Personal transfer',
      isSuspect: riskScore > 60,
      riskScore
    },
    {
      senderAmount: 3000,
      receiverAmount: 2950,
      senderCurrency: 'EUR',
      receiverCurrency: 'EUR',
      senderCountryCode: 'DE',
      receiverCountryCode: 'FR',
      method: 'bank',
      reasonForSending: 'Services payment',
      isSuspect: false,
      riskScore: Math.max(10, riskScore - 20)
    }
  ];

  return baseTransactions.map((tx, index) => ({
    id: `tx_${userId}_${index + 1}`,
    senderUserId: userId,
    senderName: userName,
    receiverUserId: `receiver_${userId}_${index + 1}`,
    receiverName: `Receiver ${index + 1}`,
    timestamp: new Date(Date.now() - (index + 1) * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed' as const,
    ...tx
  } as AMLTransaction));
};

// Generate consistent documents for each user
export const generateDocumentsForUser = (userId: string): Document[] => {
  const documentTypes = ['passport', 'id', 'license'] as const;
  const statuses = ['verified', 'pending', 'rejected'] as const;
  
  return documentTypes.map((type, index) => ({
    id: `doc_${userId}_${type}`,
    userId,
    type,
    fileName: `${type}_${userId}.pdf`,
    uploadDate: new Date(Date.now() - (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: index === 0 ? 'verified' : index === 1 ? 'pending' : 'rejected',
    verifiedBy: index === 0 ? 'admin_001' : undefined,
    verificationDate: index === 0 ? new Date(Date.now() - index * 6 * 24 * 60 * 60 * 1000).toISOString() : undefined,
    extractedData: {
      name: baseCustomers.find(c => c.id === userId)?.fullName || 'Unknown',
      idNumber: baseCustomers.find(c => c.id === userId)?.identityNumber || 'Unknown',
      dateOfBirth: baseCustomers.find(c => c.id === userId)?.dateOfBirth || 'Unknown',
      nationality: baseCustomers.find(c => c.id === userId)?.nationality || 'Unknown'
    }
  }));
};

// Generate consistent compliance cases
export const generateComplianceCasesForUser = (userId: string, userName: string, riskScore: number): ComplianceCaseDetails[] => {
  if (riskScore < 50) return []; // Low risk users don't have cases
  
  const cases: ComplianceCaseDetails[] = [];
  
  if (riskScore > 70) {
    cases.push({
      id: `case_${userId}_high_risk`,
      userId,
      userName,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'aml',
      status: 'under_review',
      riskScore,
      description: `High-risk user with score ${riskScore} - requires enhanced due diligence`,
      assignedTo: 'admin_001',
      assignedToName: 'Alex Nordström',
      priority: 'critical',
      source: 'risk_assessment'
    });
  }
  
  if (riskScore > 60) {
    cases.push({
      id: `case_${userId}_kyc_review`,
      userId,
      userName,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      type: 'kyc',
      status: 'open',
      riskScore,
      description: 'KYC documentation requires additional verification',
      assignedTo: 'admin_002',
      assignedToName: 'Johan Berg',
      priority: 'high',
      source: 'kyc_flag'
    });
  }
  
  return cases;
};

// Generate the complete unified user data
export const generateUnifiedUserData = (): UnifiedUserData[] => {
  return baseCustomers.map(customer => {
    const transactions = generateTransactionsForUser(customer.id, customer.fullName, customer.riskScore);
    const documents = generateDocumentsForUser(customer.id);
    const complianceCases = generateComplianceCasesForUser(customer.id, customer.fullName, customer.riskScore);
    
    return {
      ...customer,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      kycFlags: {
        userId: customer.id,
        is_registered: true,
        is_email_confirmed: customer.kycStatus === 'verified',
        is_verified_pep: customer.isPEP,
        is_sanction_list: customer.isSanctioned,
        riskScore: customer.riskScore
      },
      documents,
      transactions,
      complianceCases,
      notes: []
    };
  });
};

// Export the generated data
export const unifiedMockData = generateUnifiedUserData();

// Export individual collections for backward compatibility
export const mockUsersCollection = unifiedMockData;
export const mockTransactionsCollection = unifiedMockData.flatMap(user => user.transactions);
export const mockDocumentsCollection = unifiedMockData.flatMap(user => user.documents);
export const mockComplianceCasesCollection = unifiedMockData.flatMap(user => user.complianceCases);
