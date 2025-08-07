
import { UnifiedUserData } from './types';
import { Document } from '@/types/supabase';

// Generate proper UUIDs for mock users
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Pre-generated UUIDs for consistency
const mockUserIds = [
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440002', 
  '550e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440005',
  '550e8400-e29b-41d4-a716-446655440006',
  '550e8400-e29b-41d4-a716-446655440007',
  '550e8400-e29b-41d4-a716-446655440008',
  '550e8400-e29b-41d4-a716-446655440009',
  '550e8400-e29b-41d4-a716-446655440010'
];

export const initializeMockData = (): UnifiedUserData[] => {
  const countries = ['United States', 'Spain', 'Egypt', 'Germany', 'France', 'United Kingdom', 'Canada', 'Australia', 'Japan', 'Brazil'];
  const nationalities = ['American', 'Spanish', 'Egyptian', 'German', 'French', 'British', 'Canadian', 'Australian', 'Japanese', 'Brazilian'];
  const kycStatuses: ('verified' | 'pending' | 'rejected' | 'information_requested')[] = ['verified', 'pending', 'rejected', 'information_requested'];
  
  const baseUsers = [
    { fullName: 'John Smith', email: 'john.smith@email.com', dateOfBirth: '1985-03-15', nationality: 'American', identityNumber: 'US123456789', phoneNumber: '+1-555-0101', address: '123 Main Street, New York, NY 10001', countryOfResidence: 'United States' },
    { fullName: 'Maria Garcia', email: 'maria.garcia@email.com', dateOfBirth: '1990-07-22', nationality: 'Spanish', identityNumber: 'ES987654321', phoneNumber: '+34-600-123456', address: 'Calle Mayor 45, Madrid, Spain', countryOfResidence: 'Spain' },
    { fullName: 'Ahmed Hassan', email: 'ahmed.hassan@email.com', dateOfBirth: '1978-12-03', nationality: 'Egyptian', identityNumber: 'EG456789123', phoneNumber: '+20-100-123456', address: '15 Tahrir Square, Cairo, Egypt', countryOfResidence: 'Egypt' },
    { fullName: 'Klaus Mueller', email: 'klaus.mueller@email.com', dateOfBirth: '1982-11-18', nationality: 'German', identityNumber: 'DE789123456', phoneNumber: '+49-176-12345678', address: 'Hauptstraße 12, Berlin, Germany', countryOfResidence: 'Germany' },
    { fullName: 'Sophie Dubois', email: 'sophie.dubois@email.com', dateOfBirth: '1995-05-08', nationality: 'French', identityNumber: 'FR321654987', phoneNumber: '+33-6-12-34-56-78', address: '23 Rue de la Paix, Paris, France', countryOfResidence: 'France' },
    { fullName: 'James Wilson', email: 'james.wilson@email.com', dateOfBirth: '1988-09-14', nationality: 'British', identityNumber: 'GB654321789', phoneNumber: '+44-7700-900123', address: '42 Baker Street, London, UK', countryOfResidence: 'United Kingdom' },
    { fullName: 'Emma Johnson', email: 'emma.johnson@email.com', dateOfBirth: '1992-02-28', nationality: 'Canadian', identityNumber: 'CA987123654', phoneNumber: '+1-416-555-0123', address: '789 Maple Avenue, Toronto, ON M5V 3A8', countryOfResidence: 'Canada' },
    { fullName: 'Liam O\'Connor', email: 'liam.oconnor@email.com', dateOfBirth: '1986-06-12', nationality: 'Australian', identityNumber: 'AU456987123', phoneNumber: '+61-400-123-456', address: '15 Collins Street, Melbourne, VIC 3000', countryOfResidence: 'Australia' },
    { fullName: 'Yuki Tanaka', email: 'yuki.tanaka@email.com', dateOfBirth: '1991-04-17', nationality: 'Japanese', identityNumber: 'JP123789456', phoneNumber: '+81-90-1234-5678', address: '2-1-1 Shibuya, Tokyo 150-0002', countryOfResidence: 'Japan' },
    { fullName: 'Carlos Silva', email: 'carlos.silva@email.com', dateOfBirth: '1984-08-25', nationality: 'Brazilian', identityNumber: 'BR789456123', phoneNumber: '+55-11-99999-9999', address: 'Rua Augusta 123, São Paulo, SP 01305-000', countryOfResidence: 'Brazil' },
  ];

  return baseUsers.map((userData, index) => {
    const userId = mockUserIds[index];
    const riskScore = Math.floor(Math.random() * 100);
    const isPEP = Math.random() < 0.1;
    const isSanctioned = Math.random() < 0.05;
    const kycStatus = kycStatuses[Math.floor(Math.random() * kycStatuses.length)];
    const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString();

    // Generate documents for each user - using correct Document type structure
    const documents: Document[] = [
      {
        id: `doc_${userId}_passport`,
        user_id: userId,
        type: 'passport' as const,
        file_name: `passport_${userId.split('-')[0]}.pdf`,
        file_path: `documents/${userId}/passport_${userId.split('-')[0]}.pdf`,
        upload_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'verified' as const,
        verified_by: 'admin_001',
        verification_date: new Date().toISOString(),
        extracted_data: {
          name: userData.fullName,
          idNumber: userData.identityNumber,
          dateOfBirth: userData.dateOfBirth,
          nationality: userData.nationality
        },
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: `doc_${userId}_id`,
        user_id: userId,
        type: 'id' as const,
        file_name: `id_${userId.split('-')[0]}.pdf`,
        file_path: `documents/${userId}/id_${userId.split('-')[0]}.pdf`,
        upload_date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending' as const,
        verified_by: null,
        verification_date: null,
        extracted_data: {
          name: userData.fullName,
          idNumber: userData.identityNumber,
          dateOfBirth: userData.dateOfBirth,
          nationality: userData.nationality
        },
        created_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: `doc_${userId}_license`,
        user_id: userId,
        type: 'license' as const,
        file_name: `license_${userId.split('-')[0]}.pdf`,
        file_path: `documents/${userId}/license_${userId.split('-')[0]}.pdf`,
        upload_date: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'rejected' as const,
        verified_by: null,
        verification_date: null,
        extracted_data: {
          name: userData.fullName,
          idNumber: userData.identityNumber,
          dateOfBirth: userData.dateOfBirth,
          nationality: userData.nationality
        },
        created_at: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - Math.random() * 21 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    // Generate transactions for each user with proper currency types
    const transactions = [
      {
        id: `tx_${userId}_1`,
        senderUserId: userId,
        senderName: userData.fullName,
        receiverUserId: `receiver_${userId}_1`,
        receiverName: 'Receiver 1',
        timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed' as const,
        senderAmount: 5000,
        receiverAmount: 4950,
        senderCurrency: 'USD' as const,
        receiverCurrency: 'USD' as const,
        senderCountryCode: 'US',
        receiverCountryCode: 'GB',
        method: 'bank' as const,
        reasonForSending: 'Personal transfer',
        isSuspect: false,
        riskScore: riskScore
      },
      {
        id: `tx_${userId}_2`,
        senderUserId: userId,
        senderName: userData.fullName,
        receiverUserId: `receiver_${userId}_2`,
        receiverName: 'Receiver 2',
        timestamp: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000).toISOString(),
        status: 'completed' as const,
        senderAmount: 3000,
        receiverAmount: 2950,
        senderCurrency: 'EUR' as const,
        receiverCurrency: 'EUR' as const,
        senderCountryCode: 'DE',
        receiverCountryCode: 'FR',
        method: 'bank' as const,
        reasonForSending: 'Services payment',
        isSuspect: false,
        riskScore: Math.floor(riskScore * 0.5)
      }
    ];

    return {
      id: userId,
      fullName: userData.fullName,
      email: userData.email,
      dateOfBirth: userData.dateOfBirth,
      nationality: userData.nationality,
      identityNumber: userData.identityNumber,
      phoneNumber: userData.phoneNumber,
      address: userData.address,
      countryOfResidence: userData.countryOfResidence,
      riskScore,
      isPEP,
      isSanctioned,
      kycStatus,
      createdAt,
      kycFlags: {
        userId: userId,
        is_registered: true,
        is_email_confirmed: Math.random() > 0.1,
        is_verified_pep: isPEP,
        is_sanction_list: isSanctioned,
        riskScore
      },
      documents,
      transactions,
      complianceCases: [],
      notes: []
    };
  });
};
