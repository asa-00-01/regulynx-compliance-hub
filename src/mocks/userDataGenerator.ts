
import { KYCUser, UserFlags } from '@/types/kyc';
import { unifiedMockData } from '@/mocks/centralizedMockData';

// Use centralized data instead of generating new users
export const generateMockUser = (id: string): KYCUser & { flags: UserFlags } => {
  // Try to find user in centralized data first
  const centralizedUser = unifiedMockData.find(user => user.id === id);
  
  if (centralizedUser) {
    return {
      id: centralizedUser.id,
      fullName: centralizedUser.fullName,
      email: centralizedUser.email,
      dateOfBirth: centralizedUser.dateOfBirth || '',
      identityNumber: centralizedUser.identityNumber || '',
      address: centralizedUser.address || '',
      phoneNumber: centralizedUser.phoneNumber || '',
      createdAt: centralizedUser.createdAt,
      updatedAt: centralizedUser.createdAt,
      flags: centralizedUser.kycFlags
    };
  }

  // Fallback to old generation logic for any missing users
  const countries = [
    'United States', 'United Kingdom', 'Germany', 'France', 'Canada',
    'Australia', 'Japan', 'China', 'Brazil', 'Sweden'
  ];

  const firstNames = [
    'John', 'Sarah', 'Michael', 'Emma', 'David', 
    'Anna', 'Robert', 'Maria', 'James', 'Lisa'
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones',
    'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'
  ];

  const randomDate = (start: Date, end: Date) => {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
  };

  const generateRandomName = () => {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${firstName} ${lastName}`;
  };

  const generateRandomEmail = (name: string) => {
    const nameParts = name.toLowerCase().split(' ');
    const domains = ['gmail.com', 'outlook.com', 'yahoo.com', 'company.com'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `${nameParts[0]}.${nameParts[1]}@${domain}`;
  };

  const generateRandomAddress = () => {
    const streetNumbers = Math.floor(Math.random() * 1000) + 1;
    const streetNames = ['Main St', 'Oak Ave', 'Park Rd', 'Lake Dr', 'Hill Blvd'];
    const streetName = streetNames[Math.floor(Math.random() * streetNames.length)];
    const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
    const city = cities[Math.floor(Math.random() * cities.length)];
    const states = ['NY', 'CA', 'IL', 'TX', 'AZ'];
    const state = states[Math.floor(Math.random() * states.length)];
    
    return `${streetNumbers} ${streetName}, ${city}, ${state}`;
  };

  const generateRandomPhoneNumber = () => {
    return `+1${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 1000)}${Math.floor(Math.random() * 10000)}`;
  };

  const fullName = generateRandomName();
  const email = generateRandomEmail(fullName);
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 40);
  const fiftyYearsAgo = new Date();
  fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 70);
  
  const dateOfBirth = randomDate(fiftyYearsAgo, tenYearsAgo).substring(0, 10);
  const createdAt = randomDate(new Date('2022-01-01'), new Date()).toString();
  const updatedAt = randomDate(new Date(createdAt), new Date()).toString();
  const identityNumber = Math.floor(Math.random() * 10000000000).toString();
  
  const isPEP = Math.random() < 0.2;
  const isSanctioned = Math.random() < 0.1;
  const riskScore = isPEP ? 
    Math.floor(Math.random() * 25) + 65 : 
    isSanctioned ? 
      Math.floor(Math.random() * 15) + 80 : 
      Math.floor(Math.random() * 70) + 15;
  
  return {
    id,
    fullName,
    email,
    dateOfBirth,
    identityNumber,
    address: generateRandomAddress(),
    phoneNumber: generateRandomPhoneNumber(),
    createdAt,
    updatedAt,
    flags: {
      userId: id,
      is_registered: true,
      is_email_confirmed: Math.random() > 0.1,
      is_verified_pep: isPEP,
      is_sanction_list: isSanctioned,
      riskScore
    }
  };
};
