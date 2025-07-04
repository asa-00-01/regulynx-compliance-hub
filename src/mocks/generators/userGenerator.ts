import { UnifiedUserData } from '@/context/compliance/types';

// Generate UUID v4
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface BaseUserProfile {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  nationality: string;
  identityNumber: string;
  phoneNumber: string;
  address: string;
  countryOfResidence: string;
  riskScore: number;
  isPEP: boolean;
  isSanctioned: boolean;
  kycStatus: 'verified' | 'pending' | 'rejected' | 'information_requested';
}

// Comprehensive user profiles with realistic data
export const userProfiles: BaseUserProfile[] = [
  {
    id: generateUUID(),
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
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'pending'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'information_requested'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'pending'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'rejected'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
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
    kycStatus: 'pending'
  },
  {
    id: generateUUID(),
    fullName: 'Hiroshi Tanaka',
    email: 'hiroshi.tanaka@email.com',
    dateOfBirth: '1984-07-11',
    nationality: 'Japanese',
    identityNumber: 'JP456789012',
    phoneNumber: '+81-90-1234-5678',
    address: '2-3-1 Shibuya, Tokyo 150-0002, Japan',
    countryOfResidence: 'Japan',
    riskScore: 22,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
    fullName: 'Olga Volkov',
    email: 'olga.volkov@email.com',
    dateOfBirth: '1991-02-28',
    nationality: 'Ukrainian',
    identityNumber: 'UA987654321',
    phoneNumber: '+380-67-123-4567',
    address: 'Khreshchatyk 15, Kyiv, Ukraine',
    countryOfResidence: 'Ukraine',
    riskScore: 68,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'information_requested'
  },
  {
    id: generateUUID(),
    fullName: 'Peter Hansen',
    email: 'peter.hansen@email.com',
    dateOfBirth: '1980-11-14',
    nationality: 'Danish',
    identityNumber: 'DK123789456',
    phoneNumber: '+45-12-34-56-78',
    address: 'Strøget 25, Copenhagen, Denmark',
    countryOfResidence: 'Denmark',
    riskScore: 18,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
    fullName: 'Priya Sharma',
    email: 'priya.sharma@email.com',
    dateOfBirth: '1986-05-22',
    nationality: 'Indian',
    identityNumber: 'IN987321654',
    phoneNumber: '+91-98765-12345',
    address: 'Connaught Place, New Delhi, India',
    countryOfResidence: 'India',
    riskScore: 33,
    isPEP: false,
    isSanctioned: false,
    kycStatus: 'verified'
  },
  {
    id: generateUUID(),
    fullName: 'Hassan Al-Mahmoud',
    email: 'hassan.almahmoud@email.com',
    dateOfBirth: '1977-09-03',
    nationality: 'Qatari',
    identityNumber: 'QA654987123',
    phoneNumber: '+974-55-123456',
    address: 'Corniche Road, Doha, Qatar',
    countryOfResidence: 'Qatar',
    riskScore: 78,
    isPEP: true,
    isSanctioned: false,
    kycStatus: 'information_requested'
  }
];
