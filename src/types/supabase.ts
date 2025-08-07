
import { Database } from '@/integrations/supabase/types';

// Export specific types from the Supabase schema
export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'information_requested';
export type CaseType = Database['public']['Enums']['case_type'];
export type CaseStatus = Database['public']['Enums']['case_status'];
export type DocumentType = Database['public']['Enums']['document_type'];
export type UserRole = Database['public']['Enums']['user_role'];
export type UserStatus = Database['public']['Enums']['user_status'];
export type CasePriority = Database['public']['Enums']['case_priority'];
export type CaseSource = Database['public']['Enums']['case_source'];
export type ActionType = Database['public']['Enums']['action_type'];
export type SARStatus = Database['public']['Enums']['sar_status'];
export type PatternCategory = Database['public']['Enums']['pattern_category'];
export type PlatformRole = Database['public']['Enums']['platform_role'];
export type CustomerRole = Database['public']['Enums']['customer_role'];

// Table row types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Document = Database['public']['Tables']['documents']['Row'];
export type ComplianceCase = Database['public']['Tables']['compliance_cases']['Row'];
export type CaseAction = Database['public']['Tables']['case_actions']['Row'];
export type AuditLog = Database['public']['Tables']['audit_logs']['Row'];
export type Rule = Database['public']['Tables']['rules']['Row'];
export type RiskMatch = Database['public']['Tables']['risk_matches']['Row'];
export type SAR = Database['public']['Tables']['sars']['Row'];
export type Pattern = Database['public']['Tables']['patterns']['Row'];
export type PatternMatch = Database['public']['Tables']['pattern_matches']['Row'];
export type IntegrationConfig = Database['public']['Tables']['integration_configs']['Row'];
export type IntegrationAPIKey = Database['public']['Tables']['integration_api_keys']['Row'];
export type DataIngestionLog = Database['public']['Tables']['data_ingestion_logs']['Row'];
export type ExternalCustomerMapping = Database['public']['Tables']['external_customer_mappings']['Row'];
export type ExternalTransactionMapping = Database['public']['Tables']['external_transaction_mappings']['Row'];
export type WebhookNotification = Database['public']['Tables']['webhook_notifications']['Row'];
export type UsageMetric = Database['public']['Tables']['usage_metrics']['Row'];
export type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
export type Subscriber = Database['public']['Tables']['subscribers']['Row'];
export type UserRole_Table = Database['public']['Tables']['user_roles']['Row'];
export type PlatformRole_Table = Database['public']['Tables']['platform_roles']['Row'];

// Insert types
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type DocumentInsert = Database['public']['Tables']['documents']['Insert'];
export type ComplianceCaseInsert = Database['public']['Tables']['compliance_cases']['Insert'];
export type CaseActionInsert = Database['public']['Tables']['case_actions']['Insert'];
export type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];
export type RuleInsert = Database['public']['Tables']['rules']['Insert'];
export type RiskMatchInsert = Database['public']['Tables']['risk_matches']['Insert'];
export type SARInsert = Database['public']['Tables']['sars']['Insert'];
export type PatternInsert = Database['public']['Tables']['patterns']['Insert'];
export type PatternMatchInsert = Database['public']['Tables']['pattern_matches']['Insert'];
export type IntegrationConfigInsert = Database['public']['Tables']['integration_configs']['Insert'];
export type IntegrationAPIKeyInsert = Database['public']['Tables']['integration_api_keys']['Insert'];
export type DataIngestionLogInsert = Database['public']['Tables']['data_ingestion_logs']['Insert'];
export type ExternalCustomerMappingInsert = Database['public']['Tables']['external_customer_mappings']['Insert'];
export type ExternalTransactionMappingInsert = Database['public']['Tables']['external_transaction_mappings']['Insert'];
export type WebhookNotificationInsert = Database['public']['Tables']['webhook_notifications']['Insert'];
export type UsageMetricInsert = Database['public']['Tables']['usage_metrics']['Insert'];
export type SubscriptionPlanInsert = Database['public']['Tables']['subscription_plans']['Insert'];
export type SubscriberInsert = Database['public']['Tables']['subscribers']['Insert'];
export type UserRoleInsert = Database['public']['Tables']['user_roles']['Insert'];
export type PlatformRoleInsert = Database['public']['Tables']['platform_roles']['Insert'];

// Update types
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type DocumentUpdate = Database['public']['Tables']['documents']['Update'];
export type ComplianceCaseUpdate = Database['public']['Tables']['compliance_cases']['Update'];
export type CaseActionUpdate = Database['public']['Tables']['case_actions']['Update'];
export type AuditLogUpdate = Database['public']['Tables']['audit_logs']['Update'];
export type RuleUpdate = Database['public']['Tables']['rules']['Update'];
export type RiskMatchUpdate = Database['public']['Tables']['risk_matches']['Update'];
export type SARUpdate = Database['public']['Tables']['sars']['Update'];
export type PatternUpdate = Database['public']['Tables']['patterns']['Update'];
export type PatternMatchUpdate = Database['public']['Tables']['pattern_matches']['Update'];
export type IntegrationConfigUpdate = Database['public']['Tables']['integration_configs']['Update'];
export type IntegrationAPIKeyUpdate = Database['public']['Tables']['integration_api_keys']['Update'];
export type DataIngestionLogUpdate = Database['public']['Tables']['data_ingestion_logs']['Update'];
export type ExternalCustomerMappingUpdate = Database['public']['Tables']['external_customer_mappings']['Update'];
export type ExternalTransactionMappingUpdate = Database['public']['Tables']['external_transaction_mappings']['Update'];
export type WebhookNotificationUpdate = Database['public']['Tables']['webhook_notifications']['Update'];
export type UsageMetricUpdate = Database['public']['Tables']['usage_metrics']['Update'];
export type SubscriptionPlanUpdate = Database['public']['Tables']['subscription_plans']['Update'];
export type SubscriberUpdate = Database['public']['Tables']['subscribers']['Update'];
export type UserRoleUpdate = Database['public']['Tables']['user_roles']['Update'];
export type PlatformRoleUpdate = Database['public']['Tables']['platform_roles']['Update'];
