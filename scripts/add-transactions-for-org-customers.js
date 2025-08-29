#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Transaction types and descriptions for variety
const transactionTypes = [
  'wire_transfer',
  'ach_transfer', 
  'card_payment',
  'cash_deposit',
  'international_transfer',
  'loan_payment',
  'investment_transfer',
  'utility_payment',
  'insurance_payment',
  'tax_payment'
];

const transactionDescriptions = [
  'International wire transfer to family',
  'Business payment for services',
  'Online purchase from e-commerce site',
  'Cash deposit at ATM',
  'Investment portfolio rebalancing',
  'Loan repayment',
  'Utility bill payment',
  'Insurance premium payment',
  'Tax payment to government',
  'Charitable donation'
];

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK'];

const accountTypes = [
  'checking',
  'savings', 
  'business',
  'investment',
  'credit_card',
  'loan_account'
];

async function addTransactionsForOrgCustomers() {
  console.log('🚀 Adding 5 transactions for each organization customer...\n');

  try {
    // Get all organization customers
    const { data: orgCustomers, error: orgError } = await supabase
      .from('organization_customers')
      .select('id, customer_id, full_name, risk_score')
      .order('created_at', { ascending: true });

    if (orgError) {
      console.error('❌ Error fetching organization customers:', orgError);
      return;
    }

    if (!orgCustomers || orgCustomers.length === 0) {
      console.log('❌ No organization customers found');
      return;
    }

    console.log(`📋 Found ${orgCustomers.length} organization customers`);

    // Get the customer ID (assuming all org customers belong to the same customer)
    const customerId = orgCustomers[0].customer_id;

    const allTransactions = [];

    // Create 5 transactions for each organization customer
    for (const orgCustomer of orgCustomers) {
      console.log(`\n👤 Creating transactions for: ${orgCustomer.full_name} (Risk: ${orgCustomer.risk_score})`);

      for (let i = 1; i <= 5; i++) {
        // Vary the risk score based on the customer's base risk and transaction type
        const baseRisk = orgCustomer.risk_score;
        const transactionRiskVariation = Math.floor(Math.random() * 40) - 20; // -20 to +20
        const riskScore = Math.max(0, Math.min(100, baseRisk + transactionRiskVariation));

        // Determine status based on risk score
        let status;
        if (riskScore >= 80) {
          status = 'flagged';
        } else if (riskScore >= 60) {
          status = 'pending';
        } else {
          status = Math.random() > 0.3 ? 'approved' : 'pending';
        }

        // Create transaction data
        const transaction = {
          organization_customer_id: orgCustomer.id,
          customer_id: customerId,
          external_transaction_id: `TXN_${orgCustomer.id.slice(0, 8)}_${Date.now()}_${i}`,
          from_account: `${accountTypes[Math.floor(Math.random() * accountTypes.length)]}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          to_account: `${accountTypes[Math.floor(Math.random() * accountTypes.length)]}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
          amount: Math.floor(Math.random() * 50000) + 100, // $100 to $50,000
          currency: currencies[Math.floor(Math.random() * currencies.length)],
          transaction_type: transactionTypes[Math.floor(Math.random() * transactionTypes.length)],
          transaction_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date in last 30 days
          description: transactionDescriptions[Math.floor(Math.random() * transactionDescriptions.length)],
          risk_score: riskScore,
          status: status,
          flags: generateFlags(riskScore),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

        allTransactions.push(transaction);
        console.log(`   💳 Transaction ${i}: $${transaction.amount} ${transaction.currency} (Risk: ${riskScore}, Status: ${status})`);
      }
    }

    // Insert all transactions
    console.log(`\n💾 Inserting ${allTransactions.length} transactions...`);
    const { data: insertedTransactions, error: insertError } = await supabase
      .from('aml_transactions')
      .insert(allTransactions)
      .select('id, external_transaction_id, amount, currency, risk_score, status');

    if (insertError) {
      console.error('❌ Error inserting transactions:', insertError);
      return;
    }

    console.log(`✅ Successfully created ${insertedTransactions.length} transactions!`);

    // Show summary by status
    const statusSummary = {};
    const riskSummary = { low: 0, medium: 0, high: 0 };

    insertedTransactions.forEach(txn => {
      statusSummary[txn.status] = (statusSummary[txn.status] || 0) + 1;
      
      if (txn.risk_score < 40) riskSummary.low++;
      else if (txn.risk_score < 70) riskSummary.medium++;
      else riskSummary.high++;
    });

    console.log('\n📊 Transaction Summary:');
    console.log('   Status Distribution:');
    Object.entries(statusSummary).forEach(([status, count]) => {
      console.log(`     ${status}: ${count} transactions`);
    });

    console.log('\n   Risk Distribution:');
    console.log(`     Low (0-39): ${riskSummary.low} transactions`);
    console.log(`     Medium (40-69): ${riskSummary.medium} transactions`);
    console.log(`     High (70-100): ${riskSummary.high} transactions`);

    console.log('\n🎉 All transactions added successfully!');
    console.log('💡 You can now view these transactions in the AML Monitoring section');

  } catch (error) {
    console.error('❌ Error adding transactions:', error);
  }
}

function generateFlags(riskScore) {
  const flags = [];
  
  if (riskScore >= 80) {
    flags.push('high_risk', 'suspicious_pattern', 'large_amount');
  } else if (riskScore >= 60) {
    flags.push('medium_risk', 'unusual_frequency');
  } else if (riskScore >= 40) {
    flags.push('low_risk');
  }

  // Add random flags based on risk
  if (Math.random() > 0.7) flags.push('international_transfer');
  if (Math.random() > 0.8) flags.push('new_counterparty');
  if (Math.random() > 0.9) flags.push('unusual_time');

  return flags;
}

addTransactionsForOrgCustomers();
