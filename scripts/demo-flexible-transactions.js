#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Simple adapter functions for the demo
const adapters = {
  remittance: (transaction) => ({
    external_transaction_id: transaction.external_transaction_id || transaction.transaction_id,
    organization_customer_id: transaction.organization_customer_id || transaction.sender_id,
    customer_id: transaction.customer_id,
    institution_type: 'remittance',
    amount: parseFloat(transaction.amount) || 0,
    currency: transaction.currency || 'USD',
    transaction_date: transaction.transaction_date || transaction.created_at || new Date().toISOString(),
    risk_score: transaction.risk_score || 0,
    status: transaction.status || 'pending',
    flags: transaction.flags || [],
    institution_data: {
      sender_name: transaction.sender_name || '',
      sender_phone: transaction.sender_phone || transaction.sender_phone_number || '',
      sender_id_type: transaction.sender_id_type || transaction.sender_identification_type || 'passport',
      sender_id_number: transaction.sender_id_number || transaction.sender_identification_number || '',
      sender_country: transaction.sender_country || transaction.sender_country_code || 'US',
      sender_city: transaction.sender_city || transaction.sender_city_name || '',
      sender_address: transaction.sender_address || transaction.sender_street_address || '',
      receiver_name: transaction.receiver_name || transaction.beneficiary_name || '',
      receiver_phone: transaction.receiver_phone || transaction.beneficiary_phone || '',
      receiver_country: transaction.receiver_country || transaction.beneficiary_country || 'US',
      receiver_city: transaction.receiver_city || transaction.beneficiary_city || '',
      receiver_address: transaction.receiver_address || transaction.beneficiary_address || '',
      receiver_bank_name: transaction.receiver_bank_name || transaction.beneficiary_bank_name,
      receiver_account_number: transaction.receiver_account_number || transaction.beneficiary_account_number,
      receiver_routing_number: transaction.receiver_routing_number || transaction.beneficiary_routing_number,
      exchange_rate: parseFloat(transaction.exchange_rate) || 1.0,
      fees: parseFloat(transaction.fees) || 0,
      purpose_of_remittance: transaction.purpose_of_remittance || transaction.purpose || 'family_support',
      payment_method: transaction.payment_method || transaction.delivery_method || 'bank_transfer',
      pickup_location: transaction.pickup_location || transaction.agent_location,
      pickup_code: transaction.pickup_code || transaction.reference_code,
      sender_relationship_to_receiver: transaction.sender_relationship_to_receiver || transaction.relationship || 'family',
      source_of_funds: transaction.source_of_funds || transaction.funding_source || 'salary',
      occupation: transaction.occupation || transaction.sender_occupation || '',
      monthly_income: transaction.monthly_income ? parseFloat(transaction.monthly_income) : undefined,
      transaction_channel: transaction.transaction_channel || transaction.channel || 'online',
      agent_id: transaction.agent_id || transaction.agent_identifier,
      agent_location: transaction.agent_location || transaction.agent_branch
    }
  }),
  
  bank: (transaction) => ({
    external_transaction_id: transaction.external_transaction_id || transaction.transaction_id,
    organization_customer_id: transaction.organization_customer_id || transaction.customer_id,
    customer_id: transaction.customer_id,
    institution_type: 'bank',
    amount: parseFloat(transaction.amount) || 0,
    currency: transaction.currency || 'USD',
    transaction_date: transaction.transaction_date || transaction.created_at || new Date().toISOString(),
    risk_score: transaction.risk_score || 0,
    status: transaction.status || 'pending',
    flags: transaction.flags || [],
    institution_data: {
      from_account: transaction.from_account || transaction.debit_account || '',
      to_account: transaction.to_account || transaction.credit_account || '',
      from_account_type: transaction.from_account_type || transaction.debit_account_type || 'checking',
      to_account_type: transaction.to_account_type || transaction.credit_account_type || 'checking',
      from_account_holder: transaction.from_account_holder || transaction.debit_account_holder || '',
      to_account_holder: transaction.to_account_holder || transaction.credit_account_holder || '',
      from_bank_name: transaction.from_bank_name || transaction.debit_bank_name || '',
      to_bank_name: transaction.to_bank_name || transaction.credit_bank_name || '',
      from_bank_routing: transaction.from_bank_routing || transaction.debit_routing_number || '',
      to_bank_routing: transaction.to_bank_routing || transaction.credit_routing_number || '',
      transaction_type: transaction.transaction_type || transaction.type || 'wire_transfer',
      description: transaction.description || transaction.memo || '',
      reference_number: transaction.reference_number || transaction.reference || '',
      batch_id: transaction.batch_id || transaction.batch_number,
      clearing_house: transaction.clearing_house || transaction.clearing_system,
      settlement_date: transaction.settlement_date || transaction.settled_at,
      chargeback_reference: transaction.chargeback_reference || transaction.chargeback_id,
      merchant_category_code: transaction.merchant_category_code || transaction.mcc,
      merchant_name: transaction.merchant_name || transaction.merchant,
      merchant_id: transaction.merchant_id || transaction.merchant_identifier,
      terminal_id: transaction.terminal_id || transaction.pos_terminal,
      authorization_code: transaction.authorization_code || transaction.auth_code
    }
  }),
  
  payment_service_provider: (transaction) => ({
    external_transaction_id: transaction.external_transaction_id || transaction.transaction_id,
    organization_customer_id: transaction.organization_customer_id || transaction.customer_id,
    customer_id: transaction.customer_id,
    institution_type: 'payment_service_provider',
    amount: parseFloat(transaction.amount) || 0,
    currency: transaction.currency || 'USD',
    transaction_date: transaction.transaction_date || transaction.created_at || new Date().toISOString(),
    risk_score: transaction.risk_score || 0,
    status: transaction.status || 'pending',
    flags: transaction.flags || [],
    institution_data: {
      merchant_id: transaction.merchant_id || transaction.merchant_identifier || '',
      merchant_name: transaction.merchant_name || transaction.merchant || '',
      merchant_category: transaction.merchant_category || transaction.mcc_description || '',
      merchant_country: transaction.merchant_country || transaction.merchant_country_code || 'US',
      customer_id: transaction.customer_id || transaction.cardholder_id || '',
      customer_email: transaction.customer_email || transaction.email || '',
      customer_phone: transaction.customer_phone || transaction.phone,
      payment_method: transaction.payment_method || transaction.method || 'credit_card',
      card_type: transaction.card_type || transaction.card_brand,
      card_last_four: transaction.card_last_four || transaction.last_four,
      card_country: transaction.card_country || transaction.card_issuing_country,
      digital_wallet_type: transaction.digital_wallet_type || transaction.wallet_type,
      crypto_currency: transaction.crypto_currency || transaction.crypto,
      crypto_wallet_address: transaction.crypto_wallet_address || transaction.wallet_address,
      transaction_type: transaction.transaction_type || transaction.type || 'purchase',
      subscription_id: transaction.subscription_id || transaction.recurring_id,
      recurring_payment: transaction.recurring_payment || transaction.is_recurring || false,
      billing_cycle: transaction.billing_cycle || transaction.recurring_cycle,
      invoice_id: transaction.invoice_id || transaction.invoice,
      order_id: transaction.order_id || transaction.order,
      shipping_address: transaction.shipping_address || transaction.ship_to,
      billing_address: transaction.billing_address || transaction.bill_to,
      ip_address: transaction.ip_address || transaction.client_ip || '',
      user_agent: transaction.user_agent || transaction.browser || '',
      device_fingerprint: transaction.device_fingerprint || transaction.fingerprint,
      risk_indicators: transaction.risk_indicators || transaction.risk_flags || [],
      fraud_score: transaction.fraud_score ? parseFloat(transaction.fraud_score) : undefined,
      avs_result: transaction.avs_result || transaction.address_verification,
      cvv_result: transaction.cvv_result || transaction.cvv_verification,
      three_d_secure_result: transaction.three_d_secure_result || transaction['3ds_result']
    }
  }),
  
  crypto_exchange: (transaction) => ({
    external_transaction_id: transaction.external_transaction_id || transaction.transaction_id,
    organization_customer_id: transaction.organization_customer_id || transaction.user_id,
    customer_id: transaction.customer_id,
    institution_type: 'crypto_exchange',
    amount: parseFloat(transaction.amount) || 0,
    currency: transaction.currency || 'USD',
    transaction_date: transaction.transaction_date || transaction.created_at || new Date().toISOString(),
    risk_score: transaction.risk_score || 0,
    status: transaction.status || 'pending',
    flags: transaction.flags || [],
    institution_data: {
      from_currency: transaction.from_currency || transaction.source_currency || '',
      to_currency: transaction.to_currency || transaction.destination_currency || '',
      from_wallet_address: transaction.from_wallet_address || transaction.source_wallet || '',
      to_wallet_address: transaction.to_wallet_address || transaction.destination_wallet || '',
      from_wallet_type: transaction.from_wallet_type || transaction.source_wallet_type || 'hot_wallet',
      to_wallet_type: transaction.to_wallet_type || transaction.destination_wallet_type || 'hot_wallet',
      transaction_type: transaction.transaction_type || transaction.type || 'trade',
      exchange_rate: parseFloat(transaction.exchange_rate) || 1.0,
      fees: parseFloat(transaction.fees) || 0,
      network_fee: transaction.network_fee ? parseFloat(transaction.network_fee) : undefined,
      blockchain_network: transaction.blockchain_network || transaction.network || '',
      transaction_hash: transaction.transaction_hash || transaction.tx_hash,
      block_number: transaction.block_number ? parseInt(transaction.block_number) : undefined,
      confirmations: transaction.confirmations ? parseInt(transaction.confirmations) : undefined,
      mempool_status: transaction.mempool_status || transaction.status,
      gas_price: transaction.gas_price ? parseFloat(transaction.gas_price) : undefined,
      gas_limit: transaction.gas_limit ? parseInt(transaction.gas_limit) : undefined,
      smart_contract_address: transaction.smart_contract_address || transaction.contract_address,
      smart_contract_method: transaction.smart_contract_method || transaction.contract_method,
      smart_contract_data: transaction.smart_contract_data || transaction.contract_data,
      kyc_level: transaction.kyc_level || transaction.verification_level || 'none',
      source_of_funds: transaction.source_of_funds || transaction.funding_source || '',
      purpose_of_transaction: transaction.purpose_of_transaction || transaction.purpose || '',
      destination_exchange: transaction.destination_exchange || transaction.target_exchange,
      destination_exchange_kyc_level: transaction.destination_exchange_kyc_level || transaction.target_kyc_level
    }
  }),
  
  fintech: (transaction) => ({
    external_transaction_id: transaction.external_transaction_id || transaction.transaction_id,
    organization_customer_id: transaction.organization_customer_id || transaction.user_id,
    customer_id: transaction.customer_id,
    institution_type: 'fintech',
    amount: parseFloat(transaction.amount) || 0,
    currency: transaction.currency || 'USD',
    transaction_date: transaction.transaction_date || transaction.created_at || new Date().toISOString(),
    risk_score: transaction.risk_score || 0,
    status: transaction.status || 'pending',
    flags: transaction.flags || [],
    institution_data: {
      app_user_id: transaction.app_user_id || transaction.user_id || '',
      app_session_id: transaction.app_session_id || transaction.session_id || '',
      transaction_category: transaction.transaction_category || transaction.category || '',
      merchant_name: transaction.merchant_name || transaction.merchant,
      merchant_id: transaction.merchant_id || transaction.merchant_identifier,
      payment_method: transaction.payment_method || transaction.method || 'bank_transfer',
      card_type: transaction.card_type || transaction.card_brand,
      digital_wallet_type: transaction.digital_wallet_type || transaction.wallet_type,
      transaction_type: transaction.transaction_type || transaction.type || 'payment',
      investment_type: transaction.investment_type || transaction.investment_category,
      loan_type: transaction.loan_type || transaction.loan_category,
      savings_goal: transaction.savings_goal || transaction.goal,
      budget_category: transaction.budget_category || transaction.budget,
      recurring_transaction: transaction.recurring_transaction || transaction.is_recurring || false,
      recurring_frequency: transaction.recurring_frequency || transaction.recurring_cycle,
      split_transaction: transaction.split_transaction || transaction.is_split || false,
      split_details: transaction.split_details || transaction.split_info,
      location_data: transaction.location_data || transaction.location,
      device_info: transaction.device_info || {
        device_type: transaction.device_type || 'unknown',
        os_version: transaction.os_version || 'unknown',
        app_version: transaction.app_version || 'unknown',
        ip_address: transaction.ip_address || ''
      },
      biometric_used: transaction.biometric_used || transaction.biometric || false,
      two_factor_used: transaction.two_factor_used || transaction.mfa || false,
      risk_factors: transaction.risk_factors || transaction.risk_indicators || []
    }
  })
};

// Sample transaction data for different institution types
const sampleTransactions = {
  remittance: [
    {
      transaction_id: 'REM_001',
      sender_id: 'org_cust_001',
      sender_name: 'Maria Rodriguez',
      sender_phone_number: '+1-555-0123',
      sender_identification_type: 'passport',
      sender_identification_number: 'US123456789',
      sender_country_code: 'US',
      sender_city_name: 'Miami',
      sender_street_address: '123 Calle Ocho, Miami, FL',
      beneficiary_name: 'Carlos Rodriguez',
      beneficiary_phone: '+52-55-1234-5678',
      beneficiary_country: 'MX',
      beneficiary_city: 'Mexico City',
      beneficiary_address: '456 Avenida Reforma, Mexico City',
      beneficiary_bank_name: 'Banco de Mexico',
      beneficiary_account_number: '1234567890',
      beneficiary_routing_number: '012345678',
      amount: 2500.00,
      currency: 'USD',
      exchange_rate: 18.50,
      fees: 15.00,
      purpose: 'family_support',
      delivery_method: 'bank_transfer',
      relationship: 'family',
      funding_source: 'salary',
      sender_occupation: 'Nurse',
      monthly_income: 4500,
      channel: 'online',
      status: 'completed',
      risk_score: 35,
      created_at: new Date().toISOString()
    },
    {
      transaction_id: 'REM_002',
      sender_id: 'org_cust_002',
      sender_name: 'Ahmed Hassan',
      sender_phone_number: '+1-555-0456',
      sender_identification_type: 'drivers_license',
      sender_identification_number: 'CA987654321',
      sender_country_code: 'CA',
      sender_city_name: 'Toronto',
      sender_street_address: '789 Yonge Street, Toronto, ON',
      beneficiary_name: 'Fatima Hassan',
      beneficiary_phone: '+20-2-1234-5678',
      beneficiary_country: 'EG',
      beneficiary_city: 'Cairo',
      beneficiary_address: '321 Tahrir Square, Cairo',
      amount: 1500.00,
      currency: 'CAD',
      exchange_rate: 12.75,
      fees: 12.00,
      purpose: 'education',
      delivery_method: 'cash_pickup',
      agent_location: 'Western Union - Cairo Central',
      reference_code: 'WU123456789',
      relationship: 'family',
      funding_source: 'business_income',
      sender_occupation: 'Software Engineer',
      monthly_income: 6500,
      channel: 'mobile_app',
      status: 'pending',
      risk_score: 65,
      created_at: new Date().toISOString()
    }
  ],
  
  bank: [
    {
      transaction_id: 'BANK_001',
      customer_id: 'org_cust_003',
      debit_account: '1234567890',
      credit_account: '0987654321',
      debit_account_type: 'checking',
      credit_account_type: 'savings',
      debit_account_holder: 'John Smith',
      credit_account_holder: 'John Smith',
      debit_bank_name: 'Chase Bank',
      credit_bank_name: 'Chase Bank',
      debit_routing_number: '021000021',
      credit_routing_number: '021000021',
      amount: 5000.00,
      currency: 'USD',
      type: 'wire_transfer',
      memo: 'Transfer to savings account',
      reference: 'REF123456',
      status: 'completed',
      risk_score: 15,
      created_at: new Date().toISOString()
    },
    {
      transaction_id: 'BANK_002',
      customer_id: 'org_cust_004',
      debit_account: '1111222233',
      credit_account: '4444555566',
      debit_account_type: 'business',
      credit_account_type: 'checking',
      debit_account_holder: 'ABC Corporation',
      credit_account_holder: 'XYZ Company',
      debit_bank_name: 'Wells Fargo',
      credit_bank_name: 'Bank of America',
      debit_routing_number: '121000248',
      credit_routing_number: '026009593',
      amount: 25000.00,
      currency: 'USD',
      type: 'wire_transfer',
      memo: 'Payment for services rendered',
      reference: 'INV-2024-001',
      batch_number: 'BATCH001',
      clearing_system: 'CHIPS',
      status: 'pending',
      risk_score: 75,
      created_at: new Date().toISOString()
    }
  ],
  
  payment_service_provider: [
    {
      transaction_id: 'PSP_001',
      customer_id: 'org_cust_005',
      merchant_identifier: 'MERCH_001',
      merchant: 'Amazon.com',
      mcc_description: 'Online Retail',
      merchant_country_code: 'US',
      cardholder_id: 'cardholder_001',
      email: 'john.doe@example.com',
      phone: '+1-555-0789',
      method: 'credit_card',
      card_brand: 'visa',
      last_four: '1234',
      card_issuing_country: 'US',
      amount: 299.99,
      currency: 'USD',
      type: 'purchase',
      client_ip: '192.168.1.100',
      browser: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      fingerprint: 'fp_123456789',
      risk_flags: ['new_merchant', 'high_value'],
      fraud_score: 25,
      address_verification: 'Y',
      cvv_verification: 'M',
      status: 'completed',
      risk_score: 20,
      created_at: new Date().toISOString()
    },
    {
      transaction_id: 'PSP_002',
      customer_id: 'org_cust_006',
      merchant_identifier: 'MERCH_002',
      merchant: 'International Gaming Site',
      mcc_description: 'Online Gaming',
      merchant_country_code: 'CY',
      cardholder_id: 'cardholder_002',
      email: 'jane.smith@example.com',
      phone: '+1-555-0123',
      method: 'credit_card',
      card_brand: 'mastercard',
      last_four: '5678',
      card_issuing_country: 'US',
      amount: 1500.00,
      currency: 'USD',
      type: 'purchase',
      client_ip: '203.0.113.1',
      browser: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      fingerprint: 'fp_987654321',
      risk_flags: ['international_merchant', 'gaming', 'high_value'],
      fraud_score: 85,
      address_verification: 'N',
      cvv_verification: 'N',
      status: 'flagged',
      risk_score: 90,
      created_at: new Date().toISOString()
    }
  ],
  
  crypto_exchange: [
    {
      transaction_id: 'CRYPTO_001',
      user_id: 'org_cust_007',
      source_currency: 'USD',
      destination_currency: 'BTC',
      source_wallet: 'hot_wallet_001',
      destination_wallet: 'user_wallet_abc123',
      source_wallet_type: 'hot_wallet',
      destination_wallet_type: 'external',
      type: 'trade',
      exchange_rate: 45000.00,
      fees: 25.00,
      network_fee: 5.00,
      network: 'Bitcoin',
      tx_hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      block_number: 750000,
      confirmations: 6,
      status: 'confirmed',
      verification_level: 'enhanced',
      funding_source: 'bank_transfer',
      purpose: 'investment',
      amount: 1000.00,
      currency: 'USD',
      status: 'completed',
      risk_score: 45,
      created_at: new Date().toISOString()
    },
    {
      transaction_id: 'CRYPTO_002',
      user_id: 'org_cust_008',
      source_currency: 'ETH',
      destination_currency: 'USDT',
      source_wallet: 'user_wallet_def456',
      destination_wallet: 'hot_wallet_002',
      source_wallet_type: 'external',
      destination_wallet_type: 'hot_wallet',
      type: 'withdrawal',
      exchange_rate: 3200.00,
      fees: 15.00,
      network_fee: 10.00,
      network: 'Ethereum',
      tx_hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      block_number: 18000000,
      confirmations: 12,
      status: 'confirmed',
      verification_level: 'basic',
      funding_source: 'crypto_mining',
      purpose: 'trading',
      amount: 5000.00,
      currency: 'USD',
      status: 'completed',
      risk_score: 80,
      created_at: new Date().toISOString()
    }
  ],
  
  fintech: [
    {
      transaction_id: 'FINTECH_001',
      user_id: 'org_cust_009',
      session_id: 'sess_123456789',
      category: 'food_dining',
      merchant: 'Uber Eats',
      merchant_identifier: 'uber_eats_001',
      method: 'digital_wallet',
      wallet_type: 'apple_pay',
      type: 'payment',
      amount: 45.67,
      currency: 'USD',
      is_recurring: false,
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        city: 'New York',
        country: 'US'
      },
      device_type: 'iPhone',
      os_version: 'iOS 17.0',
      app_version: '1.2.3',
      ip_address: '192.168.1.101',
      biometric: true,
      mfa: false,
      risk_indicators: ['location_mismatch'],
      status: 'completed',
      risk_score: 15,
      created_at: new Date().toISOString()
    },
    {
      transaction_id: 'FINTECH_002',
      user_id: 'org_cust_010',
      session_id: 'sess_987654321',
      category: 'investment',
      type: 'investment',
      investment_category: 'stocks',
      amount: 10000.00,
      currency: 'USD',
      is_recurring: true,
      recurring_cycle: 'monthly',
      location: {
        latitude: 37.7749,
        longitude: -122.4194,
        city: 'San Francisco',
        country: 'US'
      },
      device_type: 'Android',
      os_version: 'Android 13',
      app_version: '2.1.0',
      ip_address: '192.168.1.102',
      biometric: true,
      mfa: true,
      risk_indicators: ['high_value', 'recurring'],
      status: 'pending',
      risk_score: 55,
      created_at: new Date().toISOString()
    }
  ]
};

async function demoFlexibleTransactions() {
  console.log('🚀 Demonstrating Flexible Transaction System\n');
  
  try {
    // Get customer ID
    const { data: customers } = await supabase
      .from('customers')
      .select('id')
      .limit(1);
    
    if (!customers || customers.length === 0) {
      console.log('❌ No customers found. Please run the test data setup first.');
      return;
    }
    
    const customerId = customers[0].id;
    console.log(`📋 Using customer ID: ${customerId}\n`);
    
    // Get organization customers
    const { data: orgCustomers } = await supabase
      .from('organization_customers')
      .select('id, full_name')
      .eq('customer_id', customerId)
      .limit(10);
    
    if (!orgCustomers || orgCustomers.length === 0) {
      console.log('❌ No organization customers found. Please run the test data setup first.');
      return;
    }
    
    console.log(`👥 Found ${orgCustomers.length} organization customers\n`);
    
    // Process each institution type
    for (const [institutionType, transactions] of Object.entries(sampleTransactions)) {
      console.log(`\n🏦 Processing ${institutionType.toUpperCase()} transactions:`);
      
      const adapter = adapters[institutionType];
      const flexibleTransactions = [];
      
      for (let i = 0; i < transactions.length; i++) {
        const rawTransaction = transactions[i];
        
        // Assign organization customer ID
        const orgCustomer = orgCustomers[i % orgCustomers.length];
        rawTransaction.organization_customer_id = orgCustomer.id;
        rawTransaction.customer_id = customerId;
        
        // Transform to flexible format
        const flexibleTransaction = adapter(rawTransaction);
        
        // Basic validation
        const errors = [];
        if (!flexibleTransaction.external_transaction_id) errors.push('Missing external transaction ID');
        if (!flexibleTransaction.organization_customer_id) errors.push('Missing organization customer ID');
        if (flexibleTransaction.amount <= 0) errors.push('Invalid amount');
        if (flexibleTransaction.risk_score < 0 || flexibleTransaction.risk_score > 100) errors.push('Invalid risk score');
        
        if (errors.length === 0) {
          flexibleTransactions.push(flexibleTransaction);
          console.log(`   ✅ Transaction ${i + 1}: ${flexibleTransaction.external_transaction_id} (${flexibleTransaction.amount} ${flexibleTransaction.currency})`);
        } else {
          console.log(`   ❌ Transaction ${i + 1}: Validation failed - ${errors.join(', ')}`);
        }
      }
      
      // Insert flexible transactions
      if (flexibleTransactions.length > 0) {
        const { data: insertedTransactions, error } = await supabase
          .from('flexible_transactions')
          .insert(flexibleTransactions)
          .select('id, external_transaction_id, institution_type, amount, currency, risk_score, status');
        
        if (error) {
          console.log(`   ❌ Error inserting ${institutionType} transactions:`, error.message);
        } else {
          console.log(`   ✅ Successfully inserted ${insertedTransactions.length} ${institutionType} transactions`);
          
          // Show risk distribution
          const riskDistribution = {
            low: insertedTransactions.filter(t => t.risk_score < 40).length,
            medium: insertedTransactions.filter(t => t.risk_score >= 40 && t.risk_score < 70).length,
            high: insertedTransactions.filter(t => t.risk_score >= 70).length
          };
          
          console.log(`      📊 Risk Distribution: Low(${riskDistribution.low}) Medium(${riskDistribution.medium}) High(${riskDistribution.high})`);
        }
      }
    }
    
    // Show summary
    console.log('\n📊 Summary:');
    const { data: allTransactions } = await supabase
      .from('flexible_transactions')
      .select('institution_type, amount, risk_score, status')
      .eq('customer_id', customerId);
    
    if (allTransactions) {
      const summary = allTransactions.reduce((acc, txn) => {
        if (!acc[txn.institution_type]) {
          acc[txn.institution_type] = { count: 0, total_amount: 0, avg_risk: 0 };
        }
        acc[txn.institution_type].count++;
        acc[txn.institution_type].total_amount += parseFloat(txn.amount);
        acc[txn.institution_type].avg_risk += txn.risk_score;
        return acc;
      }, {});
      
      Object.entries(summary).forEach(([type, data]) => {
        data.avg_risk = Math.round(data.avg_risk / data.count);
        console.log(`   ${type.toUpperCase()}: ${data.count} transactions, $${data.total_amount.toFixed(2)} total, ${data.avg_risk} avg risk`);
      });
    }
    
    console.log('\n🎉 Flexible transaction system demonstration completed!');
    console.log('💡 You can now view these transactions in the application with institution-specific fields.');
    
  } catch (error) {
    console.error('❌ Error demonstrating flexible transactions:', error);
  }
}

// Run the demo
demoFlexibleTransactions();
