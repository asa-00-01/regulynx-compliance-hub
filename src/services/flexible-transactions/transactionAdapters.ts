import { 
  FlexibleTransaction, 
  RemittanceTransaction, 
  BankTransaction, 
  PaymentServiceProviderTransaction,
  CryptoExchangeTransaction,
  FintechTransaction,
  FinancialInstitutionType,
  TransactionAdapter,
  ValidationResult
} from '@/types/flexible-transactions';

// Base adapter class
abstract class BaseTransactionAdapter implements TransactionAdapter {
  abstract institution_type: FinancialInstitutionType;
  
  abstract transformToFlexible(transaction: any): FlexibleTransaction;
  abstract transformFromFlexible(transaction: FlexibleTransaction): any;
  
  validateTransaction(transaction: FlexibleTransaction): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Common validation
    if (!transaction.external_transaction_id) {
      errors.push('External transaction ID is required');
    }
    
    if (!transaction.organization_customer_id) {
      errors.push('Organization customer ID is required');
    }
    
    if (!transaction.customer_id) {
      errors.push('Customer ID is required');
    }
    
    if (transaction.amount <= 0) {
      errors.push('Amount must be greater than 0');
    }
    
    if (!transaction.currency) {
      errors.push('Currency is required');
    }
    
    if (!transaction.transaction_date) {
      errors.push('Transaction date is required');
    }
    
    if (transaction.risk_score < 0 || transaction.risk_score > 100) {
      errors.push('Risk score must be between 0 and 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

// Remittance Transaction Adapter
export class RemittanceTransactionAdapter extends BaseTransactionAdapter {
  institution_type: FinancialInstitutionType = 'remittance';
  
  transformToFlexible(transaction: any): RemittanceTransaction {
    return {
      id: transaction.id || `remittance_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      created_at: transaction.created_at || new Date().toISOString(),
      updated_at: transaction.updated_at || new Date().toISOString(),
      
      // Remittance-specific fields
      sender_name: transaction.sender_name || transaction.sender_name || '',
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
    };
  }
  
  transformFromFlexible(transaction: RemittanceTransaction): any {
    return {
      transaction_id: transaction.external_transaction_id,
      sender_id: transaction.organization_customer_id,
      sender_name: transaction.sender_name,
      sender_phone_number: transaction.sender_phone,
      sender_identification_type: transaction.sender_id_type,
      sender_identification_number: transaction.sender_id_number,
      sender_country_code: transaction.sender_country,
      sender_city_name: transaction.sender_city,
      sender_street_address: transaction.sender_address,
      beneficiary_name: transaction.receiver_name,
      beneficiary_phone: transaction.receiver_phone,
      beneficiary_country: transaction.receiver_country,
      beneficiary_city: transaction.receiver_city,
      beneficiary_address: transaction.receiver_address,
      beneficiary_bank_name: transaction.receiver_bank_name,
      beneficiary_account_number: transaction.receiver_account_number,
      beneficiary_routing_number: transaction.receiver_routing_number,
      amount: transaction.amount,
      currency: transaction.currency,
      exchange_rate: transaction.exchange_rate,
      fees: transaction.fees,
      purpose: transaction.purpose_of_remittance,
      delivery_method: transaction.payment_method,
      agent_location: transaction.pickup_location,
      reference_code: transaction.pickup_code,
      relationship: transaction.sender_relationship_to_receiver,
      funding_source: transaction.source_of_funds,
      sender_occupation: transaction.occupation,
      monthly_income: transaction.monthly_income,
      channel: transaction.transaction_channel,
      agent_identifier: transaction.agent_id,
      agent_branch: transaction.agent_location,
      status: transaction.status,
      risk_score: transaction.risk_score,
      created_at: transaction.created_at
    };
  }
}

// Bank Transaction Adapter
export class BankTransactionAdapter extends BaseTransactionAdapter {
  institution_type: FinancialInstitutionType = 'bank';
  
  transformToFlexible(transaction: any): BankTransaction {
    return {
      id: transaction.id || `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      created_at: transaction.created_at || new Date().toISOString(),
      updated_at: transaction.updated_at || new Date().toISOString(),
      
      // Bank-specific fields
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
    };
  }
  
  transformFromFlexible(transaction: BankTransaction): any {
    return {
      transaction_id: transaction.external_transaction_id,
      customer_id: transaction.organization_customer_id,
      debit_account: transaction.from_account,
      credit_account: transaction.to_account,
      debit_account_type: transaction.from_account_type,
      credit_account_type: transaction.to_account_type,
      debit_account_holder: transaction.from_account_holder,
      credit_account_holder: transaction.to_account_holder,
      debit_bank_name: transaction.from_bank_name,
      credit_bank_name: transaction.to_bank_name,
      debit_routing_number: transaction.from_bank_routing,
      credit_routing_number: transaction.to_bank_routing,
      amount: transaction.amount,
      currency: transaction.currency,
      type: transaction.transaction_type,
      memo: transaction.description,
      reference: transaction.reference_number,
      batch_number: transaction.batch_id,
      clearing_system: transaction.clearing_house,
      settled_at: transaction.settlement_date,
      chargeback_id: transaction.chargeback_reference,
      mcc: transaction.merchant_category_code,
      merchant: transaction.merchant_name,
      merchant_identifier: transaction.merchant_id,
      pos_terminal: transaction.terminal_id,
      auth_code: transaction.authorization_code,
      status: transaction.status,
      risk_score: transaction.risk_score,
      created_at: transaction.created_at
    };
  }
}

// Payment Service Provider Transaction Adapter
export class PaymentServiceProviderTransactionAdapter extends BaseTransactionAdapter {
  institution_type: FinancialInstitutionType = 'payment_service_provider';
  
  transformToFlexible(transaction: any): PaymentServiceProviderTransaction {
    return {
      id: transaction.id || `psp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      created_at: transaction.created_at || new Date().toISOString(),
      updated_at: transaction.updated_at || new Date().toISOString(),
      
      // PSP-specific fields
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
      three_d_secure_result: transaction.three_d_secure_result || transaction.3ds_result
    };
  }
  
  transformFromFlexible(transaction: PaymentServiceProviderTransaction): any {
    return {
      transaction_id: transaction.external_transaction_id,
      customer_id: transaction.organization_customer_id,
      merchant_identifier: transaction.merchant_id,
      merchant: transaction.merchant_name,
      mcc_description: transaction.merchant_category,
      merchant_country_code: transaction.merchant_country,
      cardholder_id: transaction.customer_id,
      email: transaction.customer_email,
      phone: transaction.customer_phone,
      method: transaction.payment_method,
      card_brand: transaction.card_type,
      last_four: transaction.card_last_four,
      card_issuing_country: transaction.card_country,
      wallet_type: transaction.digital_wallet_type,
      crypto: transaction.crypto_currency,
      wallet_address: transaction.crypto_wallet_address,
      type: transaction.transaction_type,
      recurring_id: transaction.subscription_id,
      is_recurring: transaction.recurring_payment,
      recurring_cycle: transaction.billing_cycle,
      invoice: transaction.invoice_id,
      order: transaction.order_id,
      ship_to: transaction.shipping_address,
      bill_to: transaction.billing_address,
      client_ip: transaction.ip_address,
      browser: transaction.user_agent,
      fingerprint: transaction.device_fingerprint,
      risk_flags: transaction.risk_indicators,
      fraud_score: transaction.fraud_score,
      address_verification: transaction.avs_result,
      cvv_verification: transaction.cvv_result,
      '3ds_result': transaction.three_d_secure_result,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      risk_score: transaction.risk_score,
      created_at: transaction.created_at
    };
  }
}

// Crypto Exchange Transaction Adapter
export class CryptoExchangeTransactionAdapter extends BaseTransactionAdapter {
  institution_type: FinancialInstitutionType = 'crypto_exchange';
  
  transformToFlexible(transaction: any): CryptoExchangeTransaction {
    return {
      id: transaction.id || `crypto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      created_at: transaction.created_at || new Date().toISOString(),
      updated_at: transaction.updated_at || new Date().toISOString(),
      
      // Crypto-specific fields
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
    };
  }
  
  transformFromFlexible(transaction: CryptoExchangeTransaction): any {
    return {
      transaction_id: transaction.external_transaction_id,
      user_id: transaction.organization_customer_id,
      source_currency: transaction.from_currency,
      destination_currency: transaction.to_currency,
      source_wallet: transaction.from_wallet_address,
      destination_wallet: transaction.to_wallet_address,
      source_wallet_type: transaction.from_wallet_type,
      destination_wallet_type: transaction.to_wallet_type,
      type: transaction.transaction_type,
      exchange_rate: transaction.exchange_rate,
      fees: transaction.fees,
      network_fee: transaction.network_fee,
      network: transaction.blockchain_network,
      tx_hash: transaction.transaction_hash,
      block_number: transaction.block_number,
      confirmations: transaction.confirmations,
      status: transaction.mempool_status,
      gas_price: transaction.gas_price,
      gas_limit: transaction.gas_limit,
      contract_address: transaction.smart_contract_address,
      contract_method: transaction.smart_contract_method,
      contract_data: transaction.smart_contract_data,
      verification_level: transaction.kyc_level,
      funding_source: transaction.source_of_funds,
      purpose: transaction.purpose_of_transaction,
      target_exchange: transaction.destination_exchange,
      target_kyc_level: transaction.destination_exchange_kyc_level,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      risk_score: transaction.risk_score,
      created_at: transaction.created_at
    };
  }
}

// Fintech Transaction Adapter
export class FintechTransactionAdapter extends BaseTransactionAdapter {
  institution_type: FinancialInstitutionType = 'fintech';
  
  transformToFlexible(transaction: any): FintechTransaction {
    return {
      id: transaction.id || `fintech_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
      created_at: transaction.created_at || new Date().toISOString(),
      updated_at: transaction.updated_at || new Date().toISOString(),
      
      // Fintech-specific fields
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
    };
  }
  
  transformFromFlexible(transaction: FintechTransaction): any {
    return {
      transaction_id: transaction.external_transaction_id,
      user_id: transaction.organization_customer_id,
      session_id: transaction.app_session_id,
      category: transaction.transaction_category,
      merchant: transaction.merchant_name,
      merchant_identifier: transaction.merchant_id,
      method: transaction.payment_method,
      card_brand: transaction.card_type,
      wallet_type: transaction.digital_wallet_type,
      type: transaction.transaction_type,
      investment_category: transaction.investment_type,
      loan_category: transaction.loan_type,
      goal: transaction.savings_goal,
      budget: transaction.budget_category,
      is_recurring: transaction.recurring_transaction,
      recurring_cycle: transaction.recurring_frequency,
      is_split: transaction.split_transaction,
      split_info: transaction.split_details,
      location: transaction.location_data,
      device_type: transaction.device_info.device_type,
      os_version: transaction.device_info.os_version,
      app_version: transaction.device_info.app_version,
      ip_address: transaction.device_info.ip_address,
      biometric: transaction.biometric_used,
      mfa: transaction.two_factor_used,
      risk_indicators: transaction.risk_factors,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      risk_score: transaction.risk_score,
      created_at: transaction.created_at
    };
  }
}

// Adapter factory
export class TransactionAdapterFactory {
  private static adapters: Map<FinancialInstitutionType, TransactionAdapter> = new Map([
    ['remittance', new RemittanceTransactionAdapter()],
    ['bank', new BankTransactionAdapter()],
    ['payment_service_provider', new PaymentServiceProviderTransactionAdapter()],
    ['crypto_exchange', new CryptoExchangeTransactionAdapter()],
    ['fintech', new FintechTransactionAdapter()]
  ]);
  
  static getAdapter(institutionType: FinancialInstitutionType): TransactionAdapter {
    const adapter = this.adapters.get(institutionType);
    if (!adapter) {
      throw new Error(`No adapter found for institution type: ${institutionType}`);
    }
    return adapter;
  }
  
  static registerAdapter(institutionType: FinancialInstitutionType, adapter: TransactionAdapter): void {
    this.adapters.set(institutionType, adapter);
  }
  
  static getSupportedTypes(): FinancialInstitutionType[] {
    return Array.from(this.adapters.keys());
  }
}
