import { createClient } from '@supabase/supabase-js';

// Use the same configuration as the main application
const SUPABASE_URL = "http://127.0.0.1:54321";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Generate realistic user data
const generateUsers = (count) => {
  const users = [];
  const firstNames = [
    'Alice', 'Bob', 'Carol', 'David', 'Emma', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack',
    'Kate', 'Liam', 'Mia', 'Noah', 'Olivia', 'Paul', 'Quinn', 'Ruby', 'Sam', 'Tara',
    'Uma', 'Victor', 'Wendy', 'Xavier', 'Yara', 'Zoe', 'Adam', 'Bella', 'Chris', 'Diana',
    'Ethan', 'Fiona', 'George', 'Hannah', 'Ian', 'Julia', 'Kevin', 'Laura', 'Mike', 'Nina',
    'Oscar', 'Penny', 'Ryan', 'Sarah', 'Tom', 'Vera', 'Will', 'Zara', 'Alex', 'Beth', 'Carl'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
    'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
    'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts'
  ];

  const countries = [
    'United States', 'Canada', 'United Kingdom', 'Germany', 'France', 'Australia', 'Japan', 'Brazil', 'India', 'Mexico',
    'Italy', 'Spain', 'Netherlands', 'Sweden', 'Norway', 'Denmark', 'Finland', 'Switzerland', 'Austria', 'Belgium'
  ];

  const kycStatuses = ['pending', 'verified', 'rejected', 'information_requested'];
  const riskScores = [15, 25, 35, 45, 55, 65, 75, 85, 95];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i + 1}@example.com`;
    
    // Generate realistic date of birth (18-80 years old)
    const age = Math.floor(Math.random() * 62) + 18;
    const birthYear = new Date().getFullYear() - age;
    const birthMonth = Math.floor(Math.random() * 12) + 1;
    const birthDay = Math.floor(Math.random() * 28) + 1;
    const dateOfBirth = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;
    
    const country = countries[Math.floor(Math.random() * countries.length)];
    const kycStatus = kycStatuses[Math.floor(Math.random() * kycStatuses.length)];
    const riskScore = riskScores[Math.floor(Math.random() * riskScores.length)];
    
    // Generate realistic flags
    const isPEP = Math.random() < 0.05; // 5% chance of being PEP
    const isSanctioned = Math.random() < 0.02; // 2% chance of being sanctioned
    
    // Generate phone number
    const phoneNumber = `+1${Math.floor(Math.random() * 9000000000) + 1000000000}`;
    
    // Generate identity number (SSN-like for US, other formats for other countries)
    const identityNumber = country === 'United States' 
      ? `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 90) + 10}-${Math.floor(Math.random() * 9000) + 1000}`
      : `${Math.floor(Math.random() * 900000000) + 100000000}`;

    const user = {
      full_name: fullName,
      email: email,
      date_of_birth: dateOfBirth,
      nationality: country,
      identity_number: identityNumber,
      phone_number: phoneNumber,
      address: `${Math.floor(Math.random() * 9999) + 1} ${lastName} Street, ${country}`,
      country_of_residence: country,
      risk_score: riskScore,
      is_pep: isPEP,
      is_sanctioned: isSanctioned,
      kyc_status: kycStatus,
      customer_id: '550e8400-e29b-41d4-a716-446655440001', // Use the existing customer ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    users.push(user);
  }

  return users;
};

const addUsers = async () => {
  try {
    console.log('🚀 Starting to add more KYC users...');
    
    // Generate 50 additional users
    const newUsers = generateUsers(50);
    
    console.log(`📝 Generated ${newUsers.length} users with varied KYC statuses and risk levels`);
    
    // Insert users in batches to avoid overwhelming the database
    const batchSize = 10;
    let insertedCount = 0;
    
    for (let i = 0; i < newUsers.length; i += batchSize) {
      const batch = newUsers.slice(i, i + batchSize);
      
      const { data, error } = await supabase
        .from('organization_customers')
        .insert(batch)
        .select('id, full_name, email, kyc_status, risk_score');
      
      if (error) {
        console.error('❌ Error inserting batch:', error);
        throw error;
      }
      
      insertedCount += batch.length;
      console.log(`✅ Inserted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} users (Total: ${insertedCount})`);
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log(`🎉 Successfully added ${insertedCount} new KYC users to the database!`);
    
    // Show some statistics
    const { data: totalUsers } = await supabase
      .from('organization_customers')
      .select('kyc_status, risk_score, is_pep, is_sanctioned')
      .eq('customer_id', '550e8400-e29b-41d4-a716-446655440001');
    
    if (totalUsers) {
      const stats = {
        total: totalUsers.length,
        byStatus: {},
        byRiskLevel: {
          low: totalUsers.filter(u => u.risk_score < 50).length,
          medium: totalUsers.filter(u => u.risk_score >= 50 && u.risk_score < 75).length,
          high: totalUsers.filter(u => u.risk_score >= 75).length
        },
        pep: totalUsers.filter(u => u.is_pep).length,
        sanctioned: totalUsers.filter(u => u.is_sanctioned).length
      };
      
      totalUsers.forEach(user => {
        stats.byStatus[user.kyc_status] = (stats.byStatus[user.kyc_status] || 0) + 1;
      });
      
      console.log('\n📊 Database Statistics:');
      console.log(`Total Users: ${stats.total}`);
      console.log('KYC Status Distribution:', stats.byStatus);
      console.log('Risk Level Distribution:', stats.byRiskLevel);
      console.log(`PEP Users: ${stats.pep}`);
      console.log(`Sanctioned Users: ${stats.sanctioned}`);
    }
    
    console.log('\n✨ You can now test pagination in the KYC Verification Center!');
    console.log('💡 Try different items per page (10, 20, 50, 100) to see pagination in action.');
    
  } catch (error) {
    console.error('❌ Failed to add users:', error);
    process.exit(1);
  }
};

// Run the script
addUsers();
