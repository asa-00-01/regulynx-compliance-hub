#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read and parse the environment config
const configPath = join(__dirname, '../src/config/environment.ts');
let config;

try {
  // For development, use local Supabase
  config = {
    supabase: {
      url: "http://127.0.0.1:54321",
      anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0",
      serviceRoleKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU"
    }
  };
} catch (error) {
  console.error('Error loading config:', error);
  process.exit(1);
}

const supabase = createClient(config.supabase.url, config.supabase.anonKey);
const supabaseAdmin = createClient(config.supabase.url, config.supabase.serviceRoleKey);

// Test data configuration
const TEST_DATA = {
  admin: {
    email: 'admin@regulynx.com',
    password: 'password',
    name: 'Admin User',
    role: 'admin'
  },
  customer: {
    name: 'Test Organization',
    domain: 'test-org.com',
    subscription_tier: 'premium',
    settings: {
      industry: 'Financial Services',
      size: 'medium',
      compliance_level: 'high'
    }
  },
  users: [
    {
      email: 'john.doe@test-org.com',
      password: 'password123',
      name: 'John Doe',
      role: 'customer_admin'
    },
    {
      email: 'jane.smith@test-org.com',
      password: 'password123',
      name: 'Jane Smith',
      role: 'customer_compliance'
    },
    {
      email: 'mike.wilson@test-org.com',
      password: 'password123',
      name: 'Mike Wilson',
      role: 'customer_support'
    },
    {
      email: 'sarah.johnson@test-org.com',
      password: 'password123',
      name: 'Sarah Johnson',
      role: 'customer_compliance'
    },
    {
      email: 'david.brown@test-org.com',
      password: 'password123',
      name: 'David Brown',
      role: 'customer_support'
    },
    {
      email: 'emma.davis@test-org.com',
      password: 'password123',
      name: 'Emma Davis',
      role: 'customer_compliance'
    }
  ]
};

async function createAdminUser() {
  console.log('🔐 Creating admin user...');
  
  try {
    const { data: { user }, error } = await supabase.auth.signUp({
      email: TEST_DATA.admin.email,
      password: TEST_DATA.admin.password,
      options: {
        data: {
          name: TEST_DATA.admin.name,
          role: TEST_DATA.admin.role
        }
      }
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Admin user already exists');
        return await supabase.auth.signInWithPassword({
          email: TEST_DATA.admin.email,
          password: TEST_DATA.admin.password
        });
      }
      throw error;
    }

    console.log('✅ Admin user created successfully');
    return { data: { user }, error: null };
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

async function createTestCustomer() {
  console.log('🏢 Creating test customer organization...');
  
  try {
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .insert({
        name: TEST_DATA.customer.name,
        domain: TEST_DATA.customer.domain,
        subscription_tier: TEST_DATA.customer.subscription_tier,
        settings: TEST_DATA.customer.settings
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        console.log('✅ Test customer already exists');
        const { data: existingCustomer } = await supabaseAdmin
          .from('customers')
          .select('*')
          .eq('name', TEST_DATA.customer.name)
          .single();
        return { data: existingCustomer, error: null };
      }
      throw error;
    }

    console.log('✅ Test customer created successfully');
    return { data: customer, error: null };
  } catch (error) {
    console.error('❌ Error creating test customer:', error);
    throw error;
  }
}

async function createCustomerUsers(customerId) {
  console.log('👥 Creating customer users...');
  
  const createdUsers = [];
  
  for (const userData of TEST_DATA.users) {
    try {
      // Create auth user using admin client
      const { data: { user }, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          name: userData.name,
          role: userData.role
        }
      });

      if (authError) {
        console.log(`⚠️ User ${userData.email} might already exist:`, authError.message);
        // Try to get existing user
        const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
        const foundUser = existingUser.users.find(u => u.email === userData.email);
        if (foundUser) {
          createdUsers.push({ ...userData, id: foundUser.id });
          console.log(`✅ Found existing user: ${userData.name} (${userData.email})`);
        }
        continue;
      }

      // Create profile using admin client
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .insert({
          id: user.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          status: 'active',
          customer_id: customerId
        });

      if (profileError) {
        console.log(`⚠️ Profile for ${userData.email} might already exist:`, profileError.message);
      }

      // Assign customer role using admin client
      const { error: roleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: user.id,
          customer_id: customerId,
          role: userData.role
        });

      if (roleError) {
        console.log(`⚠️ Role for ${userData.email} might already exist:`, roleError.message);
      }

      createdUsers.push({ ...userData, id: user.id });
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    } catch (error) {
      console.error(`❌ Error creating user ${userData.email}:`, error);
    }
  }

  return createdUsers;
}

async function createSampleOrganizationCustomers(customerId, customerUsers) {
  console.log('👤 Creating sample organization customers...');
  
  const orgCustomers = [];
  const names = ['Alice Johnson', 'Bob Smith', 'Carol Davis', 'David Wilson', 'Eva Brown'];
  
  for (let i = 0; i < 5; i++) {
    // Only assign a customer user if we have valid users with IDs
    const validUsers = customerUsers.filter(user => user.id);
    const assignedUser = validUsers.length > 0 ? validUsers[Math.floor(Math.random() * validUsers.length)] : null;
    
    const orgCustomer = {
      id: crypto.randomUUID(),
      customer_id: customerId,
      external_customer_id: `CUST-${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      full_name: names[i],
      email: `${names[i].toLowerCase().replace(' ', '.')}@example.com`,
      phone_number: `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      date_of_birth: new Date(1980 + Math.floor(Math.random() * 40), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
      nationality: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
      identity_number: `ID-${Math.random().toString(36).substr(2, 10).toUpperCase()}`,
      address: `${Math.floor(Math.random() * 9999) + 1} Main St, City, Country`,
      country_of_residence: ['US', 'UK', 'CA', 'AU', 'DE'][Math.floor(Math.random() * 5)],
      kyc_status: ['verified', 'pending', 'rejected', 'information_requested'][Math.floor(Math.random() * 4)],
      risk_score: Math.floor(Math.random() * 100),
      is_pep: Math.random() > 0.9,
      is_sanctioned: Math.random() > 0.95,
      created_by: assignedUser?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    orgCustomers.push(orgCustomer);
  }

  try {
    const { error } = await supabaseAdmin
      .from('organization_customers')
      .insert(orgCustomers);

    if (error) {
      console.log('⚠️ Some organization customers might already exist:', error.message);
      // Try to get existing organization customers
      const { data: existingOrgCustomers } = await supabaseAdmin
        .from('organization_customers')
        .select('*')
        .eq('customer_id', customerId);
      
      if (existingOrgCustomers && existingOrgCustomers.length > 0) {
        console.log(`✅ Found ${existingOrgCustomers.length} existing organization customers`);
        return existingOrgCustomers;
      }
    } else {
      console.log(`✅ Created ${orgCustomers.length} sample organization customers`);
    }
  } catch (error) {
    console.error('❌ Error creating organization customers:', error);
  }

  return orgCustomers;
}

async function createSampleTransactions(customerId, users, orgCustomers) {
  console.log('💳 Creating sample AML transactions...');
  
  const transactions = [];
  const transactionTypes = ['deposit', 'withdrawal', 'transfer', 'payment'];
  const statuses = ['pending', 'approved', 'rejected', 'flagged'];
  
  for (let i = 0; i < 50; i++) {
    const user = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;
    const validOrgCustomers = orgCustomers.filter(oc => oc.id);
    const orgCustomer = validOrgCustomers.length > 0 ? validOrgCustomers[Math.floor(Math.random() * validOrgCustomers.length)] : null;
    const transaction = {
      id: crypto.randomUUID(),
      organization_customer_id: orgCustomer?.id || null, // Only use valid org customer ID
      customer_id: customerId,
      external_transaction_id: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      from_account: `ACC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      to_account: `ACC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      amount: Math.floor(Math.random() * 10000) + 100,
      currency: 'USD',
      transaction_type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
      transaction_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      description: `Sample transaction ${i + 1}`,
      risk_score: Math.floor(Math.random() * 100),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    transactions.push(transaction);
  }

  try {
    const { error } = await supabaseAdmin
      .from('aml_transactions')
      .insert(transactions);

    if (error) {
      console.log('⚠️ Some transactions might already exist:', error.message);
    } else {
      console.log(`✅ Created ${transactions.length} sample AML transactions`);
    }
  } catch (error) {
    console.error('❌ Error creating transactions:', error);
  }

  return transactions;
}

async function createSampleDocuments(customerId, users, orgCustomers) {
  console.log('📄 Creating sample documents...');
  
  const documents = [];
  const documentTypes = ['passport', 'drivers_license', 'national_id', 'utility_bill', 'bank_statement', 'proof_of_income', 'other'];
  const statuses = ['pending', 'verified', 'rejected', 'information_requested'];
  
  for (let i = 0; i < 30; i++) {
    const user = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;
    const validOrgCustomers = orgCustomers.filter(oc => oc.id);
    const orgCustomer = validOrgCustomers.length > 0 ? validOrgCustomers[Math.floor(Math.random() * validOrgCustomers.length)] : null;
    
    const document = {
      id: crypto.randomUUID(),
      customer_id: customerId,
      organization_customer_id: orgCustomer?.id || null,
      user_id: user?.id || null,
      type: documentTypes[Math.floor(Math.random() * documentTypes.length)],
      file_name: `document_${i + 1}.pdf`,
      file_path: `/uploads/documents/document_${i + 1}.pdf`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      upload_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    documents.push(document);
  }

  try {
    const { error } = await supabaseAdmin
      .from('documents')
      .insert(documents);

    if (error) {
      console.log('⚠️ Some documents might already exist:', error.message);
    } else {
      console.log(`✅ Created ${documents.length} sample documents`);
    }
  } catch (error) {
    console.error('❌ Error creating documents:', error);
  }

  return documents;
}

async function createSampleCases(customerId, users, transactions, documents, orgCustomers) {
  console.log('📋 Creating sample compliance cases...');
  
  const cases = [];
  const caseTypes = ['kyc_review', 'aml_alert', 'sanctions_hit', 'pep_review', 'transaction_monitoring', 'suspicious_activity', 'document_review', 'compliance_breach'];
  const priorities = ['low', 'medium', 'high', 'critical'];
  const statuses = ['open', 'in_progress', 'escalated', 'resolved', 'closed'];
  
  for (let i = 0; i < 20; i++) {
    const user = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;
    const validOrgCustomers = orgCustomers.filter(oc => oc.id);
    const orgCustomer = validOrgCustomers.length > 0 ? validOrgCustomers[Math.floor(Math.random() * validOrgCustomers.length)] : null;
    const caseType = caseTypes[Math.floor(Math.random() * caseTypes.length)];
    
    const complianceCase = {
      id: crypto.randomUUID(),
      customer_id: customerId,
      organization_customer_id: orgCustomer?.id || null,
      user_id: user?.id || null,
      type: caseType,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      source: 'system_alert',
      user_name: orgCustomer?.full_name || user?.name || 'System',
      description: `Sample ${caseType} case for testing purposes`,
      risk_score: Math.floor(Math.random() * 100),
      assigned_to: user?.id || null,
      assigned_to_name: user?.name || 'System',
      created_by: user?.id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    cases.push(complianceCase);
  }

  try {
    const { error } = await supabaseAdmin
      .from('compliance_cases')
      .insert(cases);

    if (error) {
      console.log('⚠️ Some cases might already exist:', error.message);
    } else {
      console.log(`✅ Created ${cases.length} sample compliance cases`);
    }
  } catch (error) {
    console.error('❌ Error creating cases:', error);
  }

  return cases;
}

async function createSampleEscalations(cases, users) {
  console.log('🚨 Creating sample escalations...');
  
  const escalations = [];
  
  for (let i = 0; i < 10; i++) {
    const caseItem = cases[Math.floor(Math.random() * cases.length)];
    const user = users.length > 0 ? users[Math.floor(Math.random() * users.length)] : null;
    
    const escalation = {
      id: crypto.randomUUID(),
      case_id: caseItem.id,
      escalation_level: Math.floor(Math.random() * 5) + 1,
      reason: `Sample escalation reason ${i + 1}`,
      escalated_from_user_id: user?.id || null,
      escalated_to_user_id: users.length > 0 ? users[Math.floor(Math.random() * users.length)].id : null,
      escalated_to_role: 'customer_admin',
      escalation_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      resolved_at: Math.random() > 0.5 ? new Date().toISOString() : null
    };
    
    escalations.push(escalation);
  }

  try {
    const { error } = await supabaseAdmin
      .from('escalation_history')
      .insert(escalations);

    if (error) {
      console.log('⚠️ Some escalations might already exist:', error.message);
    } else {
      console.log(`✅ Created ${escalations.length} sample escalations`);
    }
  } catch (error) {
    console.error('❌ Error creating escalations:', error);
  }

  return escalations;
}

async function createSampleNewsConfiguration(customerId) {
  console.log('📰 Creating sample news configuration...');
  
  try {
    const { error } = await supabaseAdmin
      .from('news_configurations')
      .insert({
        customer_id: customerId,
        default_categories: ['compliance', 'regulatory', 'financial', 'technology'],
        refresh_interval: 30,
        max_articles_per_source: 50,
        enable_auto_refresh: true,
        enable_notifications: true
      });

    if (error) {
      console.log('⚠️ News configuration might already exist:', error.message);
    } else {
      console.log('✅ Created sample news configuration');
    }
  } catch (error) {
    console.error('❌ Error creating news configuration:', error);
  }
}

async function main() {
  console.log('🚀 Starting test data setup...\n');

  try {
    // Step 1: Create admin user
    const { data: { user: adminUser } } = await createAdminUser();
    
    // Step 2: Create test customer organization
    const { data: customer } = await createTestCustomer();
    
    // Step 3: Create customer users
    const customerUsers = await createCustomerUsers(customer.id);
    
    // Step 4: Create organization customers first
    const orgCustomers = await createSampleOrganizationCustomers(customer.id, customerUsers);
    
    // Step 5: Create sample data
    let transactions = [];
    let documents = [];
    let cases = [];
    let escalations = [];
    
    if (customerUsers.length === 0) {
      console.log('⚠️ No customer users created, creating sample data without user references...');
      
      // Create sample data without user references
      transactions = await createSampleTransactions(customer.id, [], orgCustomers);
      documents = await createSampleDocuments(customer.id, [], orgCustomers);
      cases = await createSampleCases(customer.id, [], transactions, documents, orgCustomers);
      escalations = await createSampleEscalations(cases, []);
    } else {
      // Create sample data with user references
      transactions = await createSampleTransactions(customer.id, customerUsers, orgCustomers);
      documents = await createSampleDocuments(customer.id, customerUsers, orgCustomers);
      cases = await createSampleCases(customer.id, customerUsers, transactions, documents, orgCustomers);
      escalations = await createSampleEscalations(cases, customerUsers);
    }
    
    // Step 5: Create news configuration
    await createSampleNewsConfiguration(customer.id);

    console.log('\n🎉 Test data setup completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Admin user: ${TEST_DATA.admin.email}`);
    console.log(`   • Customer organization: ${customer.name}`);
    console.log(`   • Customer users: ${customerUsers.length}`);
    console.log(`   • Organization customers: ${orgCustomers.length}`);
    console.log(`   • Transactions: ${transactions.length}`);
    console.log(`   • Documents: ${documents.length}`);
    console.log(`   • Compliance cases: ${cases.length}`);
    console.log(`   • Escalations: ${escalations.length}`);
    
    console.log('\n🔑 Login Credentials:');
    console.log(`   • Admin: ${TEST_DATA.admin.email} / ${TEST_DATA.admin.password}`);
    customerUsers.forEach(user => {
      console.log(`   • ${user.name}: ${user.email} / ${user.password}`);
    });
    
    console.log('\n✨ You can now test the complete application flow!');

  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

// Run the setup
main();
