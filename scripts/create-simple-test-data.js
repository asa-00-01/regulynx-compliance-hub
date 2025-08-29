#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSimpleTestData() {
  console.log('🚀 Creating simple test data...\n');

  try {
    // First, create a customer organization
    console.log('🏢 Creating customer organization...');
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        id: '550e8400-e29b-41d4-a716-446655440100',
        name: 'Test Organization',
        domain: 'test-org.com',
        subscription_tier: 'premium',
        settings: {
          industry: 'Financial Services',
          size: 'medium',
          compliance_level: 'high'
        }
      })
      .select()
      .single();

    if (customerError && !customerError.message.includes('duplicate key')) {
      console.error('❌ Error creating customer:', customerError);
      return;
    }

    const customerId = customer?.id || '550e8400-e29b-41d4-a716-446655440100';
    console.log('✅ Customer organization ready');

    // Create organization customers
    console.log('👤 Creating organization customers...');
    const orgCustomers = [
      {
        id: '550e8400-e29b-41d4-a716-446655440101',
        customer_id: customerId,
        external_customer_id: 'CUST-001',
        full_name: 'Bob Wilson',
        email: 'bob.wilson@example.com',
        phone_number: '+1-555-123-4567',
        date_of_birth: '1988-11-10',
        nationality: 'UK',
        identity_number: 'ID-123456789',
        address: '10 Downing Street, London, UK',
        country_of_residence: 'UK',
        kyc_status: 'pending',
        risk_score: 75,
        is_pep: false,
        is_sanctioned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440102',
        customer_id: customerId,
        external_customer_id: 'CUST-002',
        full_name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        phone_number: '+1-555-987-6543',
        date_of_birth: '1990-05-15',
        nationality: 'US',
        identity_number: 'ID-987654321',
        address: '123 Main St, New York, US',
        country_of_residence: 'US',
        kyc_status: 'verified',
        risk_score: 25,
        is_pep: false,
        is_sanctioned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440103',
        customer_id: customerId,
        external_customer_id: 'CUST-003',
        full_name: 'Carol Davis',
        email: 'carol.davis@example.com',
        phone_number: '+1-555-456-7890',
        date_of_birth: '1985-08-22',
        nationality: 'CA',
        identity_number: 'ID-456789123',
        address: '456 Oak Ave, Toronto, CA',
        country_of_residence: 'CA',
        kyc_status: 'rejected',
        risk_score: 90,
        is_pep: true,
        is_sanctioned: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    const { error: orgError } = await supabase
      .from('organization_customers')
      .insert(orgCustomers);

    if (orgError && !orgError.message.includes('duplicate key')) {
      console.error('❌ Error creating organization customers:', orgError);
    } else {
      console.log('✅ Created 3 organization customers');
    }

    console.log('\n🎉 Simple test data created successfully!');
    console.log('📊 You should now see data in the KYC Verification Center');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  }
}

createSimpleTestData();
