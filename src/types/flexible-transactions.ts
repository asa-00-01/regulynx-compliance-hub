// Base transaction interface that all transaction types extend
export interface BaseTransaction {
  id: string;
  external_transaction_id: string;
  organization_customer_id: string;
  customer_id: string;
  amount: number;
  currency: string;
  transaction_date: string;
  risk_score: number;
  status: 'pending' | 'approved' | 'rejected' | 'flagged' | 'completed' | 'failed';
  flags: string[];
  created_at: string;
  updated_at: string;
}

// Financial Institution Types
export type FinancialInstitutionType = 
  | 'remittance'
  | 'bank'
  | 'payment_service_provider'
  | 'crypto_exchange'
  | 'fintech'
  | 'money_service_business'
  | 'credit_union'
  | 'investment_firm';

// Remittance Business Transaction Structure
export interface RemittanceTransaction extends BaseTransaction {
  institution_type: 'remittance';
  sender_name: string;
  sender_phone: string;
  sender_id_type: string;
  sender_id_number: string;
  sender_country: string;
  sender_city: string;
  sender_address: string;
  receiver_name: string;
  receiver_phone: string;
  receiver_country: string;
  receiver_city: string;
  receiver_address: string;
  receiver_bank_name?: string;
  receiver_account_number?: string;
  receiver_routing_number?: string;
  exchange_rate: number;
  fees: number;
  purpose_of_remittance: string;
  payment_method: 'bank_transfer' | 'cash_pickup' | 'mobile_money' | 'card_delivery';
  pickup_location?: string;
  pickup_code?: string;
  sender_relationship_to_receiver: string;
  source_of_funds: string;
  occupation: string;
  monthly_income?: number;
  transaction_channel: 'online' | 'mobile_app' | 'agent_location' | 'phone';
  agent_id?: string;
  agent_location?: string;
}

// Bank Transaction Structure
export interface BankTransaction extends BaseTransaction {
  institution_type: 'bank';
  from_account: string;
  to_account: string;
  from_account_type: 'checking' | 'savings' | 'business' | 'investment' | 'credit_card';
  to_account_type: 'checking' | 'savings' | 'business' | 'investment' | 'credit_card';
  from_account_holder: string;
  to_account_holder: string;
  from_bank_name: string;
  to_bank_name: string;
  from_bank_routing: string;
  to_bank_routing: string;
  transaction_type: 'wire_transfer' | 'ach_transfer' | 'check_deposit' | 'atm_withdrawal' | 'card_payment' | 'loan_payment';
  description: string;
  reference_number: string;
  batch_id?: string;
  clearing_house?: string;
  settlement_date?: string;
  chargeback_reference?: string;
  merchant_category_code?: string;
  merchant_name?: string;
  merchant_id?: string;
  terminal_id?: string;
  authorization_code?: string;
}

// Payment Service Provider Transaction Structure
export interface PaymentServiceProviderTransaction extends BaseTransaction {
  institution_type: 'payment_service_provider';
  merchant_id: string;
  merchant_name: string;
  merchant_category: string;
  merchant_country: string;
  customer_id: string;
  customer_email: string;
  customer_phone?: string;
  payment_method: 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet' | 'crypto';
  card_type?: 'visa' | 'mastercard' | 'amex' | 'discover';
  card_last_four?: string;
  card_country?: string;
  digital_wallet_type?: 'paypal' | 'apple_pay' | 'google_pay' | 'stripe';
  crypto_currency?: string;
  crypto_wallet_address?: string;
  transaction_type: 'purchase' | 'refund' | 'chargeback' | 'dispute' | 'subscription';
  subscription_id?: string;
  recurring_payment?: boolean;
  billing_cycle?: string;
  invoice_id?: string;
  order_id?: string;
  shipping_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  billing_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  ip_address: string;
  user_agent: string;
  device_fingerprint?: string;
  risk_indicators: string[];
  fraud_score?: number;
  avs_result?: string;
  cvv_result?: string;
  three_d_secure_result?: string;
}

// Crypto Exchange Transaction Structure
export interface CryptoExchangeTransaction extends BaseTransaction {
  institution_type: 'crypto_exchange';
  from_currency: string;
  to_currency: string;
  from_wallet_address: string;
  to_wallet_address: string;
  from_wallet_type: 'hot_wallet' | 'cold_wallet' | 'external';
  to_wallet_type: 'hot_wallet' | 'cold_wallet' | 'external';
  transaction_type: 'deposit' | 'withdrawal' | 'trade' | 'transfer';
  exchange_rate: number;
  fees: number;
  network_fee?: number;
  blockchain_network: string;
  transaction_hash?: string;
  block_number?: number;
  confirmations?: number;
  mempool_status?: string;
  gas_price?: number;
  gas_limit?: number;
  smart_contract_address?: string;
  smart_contract_method?: string;
  smart_contract_data?: string;
  kyc_level: 'none' | 'basic' | 'enhanced' | 'verified';
  source_of_funds: string;
  purpose_of_transaction: string;
  destination_exchange?: string;
  destination_exchange_kyc_level?: string;
}

// Fintech Transaction Structure
export interface FintechTransaction extends BaseTransaction {
  institution_type: 'fintech';
  app_user_id: string;
  app_session_id: string;
  transaction_category: string;
  merchant_name?: string;
  merchant_id?: string;
  payment_method: 'bank_transfer' | 'card' | 'digital_wallet' | 'crypto' | 'points';
  card_type?: string;
  digital_wallet_type?: string;
  transaction_type: 'payment' | 'transfer' | 'investment' | 'loan' | 'savings' | 'budget';
  investment_type?: 'stocks' | 'bonds' | 'etf' | 'crypto' | 'real_estate';
  loan_type?: 'personal' | 'business' | 'mortgage' | 'auto';
  savings_goal?: string;
  budget_category?: string;
  recurring_transaction?: boolean;
  recurring_frequency?: string;
  split_transaction?: boolean;
  split_details?: Array<{
    user_id: string;
    amount: number;
    description: string;
  }>;
  location_data?: {
    latitude: number;
    longitude: number;
    city: string;
    country: string;
  };
  device_info: {
    device_type: string;
    os_version: string;
    app_version: string;
    ip_address: string;
  };
  biometric_used?: boolean;
  two_factor_used?: boolean;
  risk_factors: string[];
}

// Union type for all transaction types
export type FlexibleTransaction = 
  | RemittanceTransaction
  | BankTransaction
  | PaymentServiceProviderTransaction
  | CryptoExchangeTransaction
  | FintechTransaction;

// Institution Configuration
export interface InstitutionConfig {
  institution_type: FinancialInstitutionType;
  institution_name: string;
  supported_currencies: string[];
  supported_countries: string[];
  transaction_schema: Record<string, any>;
  risk_rules: RiskRule[];
  compliance_requirements: ComplianceRequirement[];
  custom_fields: CustomField[];
}

// Risk Rules for different institutions
export interface RiskRule {
  id: string;
  name: string;
  description: string;
  conditions: RiskCondition[];
  risk_score_adjustment: number;
  flags: string[];
  enabled: boolean;
}

export interface RiskCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'in' | 'not_in';
  value: any;
  logical_operator?: 'AND' | 'OR';
}

// Compliance Requirements
export interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  required_fields: string[];
  validation_rules: ValidationRule[];
  reporting_requirements: ReportingRequirement[];
}

export interface ValidationRule {
  field: string;
  rule_type: 'required' | 'format' | 'range' | 'custom';
  validation_logic: string;
  error_message: string;
}

export interface ReportingRequirement {
  report_type: 'ctr' | 'sar' | 'str' | 'custom';
  threshold_amount?: number;
  frequency: 'immediate' | 'daily' | 'weekly' | 'monthly';
  fields_to_report: string[];
}

// Custom Fields for institutions
export interface CustomField {
  id: string;
  name: string;
  display_name: string;
  field_type: 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'boolean';
  required: boolean;
  validation_rules?: ValidationRule[];
  options?: string[]; // For select/multiselect fields
  default_value?: any;
  help_text?: string;
}

// Transaction Adapter Interface
export interface TransactionAdapter {
  institution_type: FinancialInstitutionType;
  transformToFlexible(transaction: any): FlexibleTransaction;
  transformFromFlexible(transaction: FlexibleTransaction): any;
  validateTransaction(transaction: FlexibleTransaction): ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Transaction Service Interface
export interface FlexibleTransactionService {
  getTransactions(filters?: TransactionFilters): Promise<FlexibleTransaction[]>;
  getTransaction(id: string): Promise<FlexibleTransaction | null>;
  createTransaction(transaction: Omit<FlexibleTransaction, 'id' | 'created_at' | 'updated_at'>): Promise<FlexibleTransaction>;
  updateTransaction(id: string, updates: Partial<FlexibleTransaction>): Promise<FlexibleTransaction>;
  deleteTransaction(id: string): Promise<void>;
  getTransactionStats(filters?: TransactionFilters): Promise<TransactionStats>;
}

export interface TransactionFilters {
  institution_type?: FinancialInstitutionType;
  date_range?: { from: string; to: string };
  amount_range?: { min: number; max: number };
  currency?: string;
  status?: string;
  risk_level?: 'low' | 'medium' | 'high';
  customer_id?: string;
  organization_customer_id?: string;
  search_term?: string;
}

export interface TransactionStats {
  total_transactions: number;
  total_amount: number;
  average_amount: number;
  flagged_transactions: number;
  high_risk_transactions: number;
  status_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  currency_distribution: Record<string, number>;
}
