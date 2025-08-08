export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      aml_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          customer_id: string
          description: string | null
          external_transaction_id: string
          flags: Json | null
          from_account: string
          id: string
          organization_customer_id: string
          risk_score: number
          status: string
          to_account: string
          transaction_date: string
          transaction_type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          customer_id: string
          description?: string | null
          external_transaction_id: string
          flags?: Json | null
          from_account: string
          id?: string
          organization_customer_id: string
          risk_score?: number
          status?: string
          to_account: string
          transaction_date: string
          transaction_type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          customer_id?: string
          description?: string | null
          external_transaction_id?: string
          flags?: Json | null
          from_account?: string
          id?: string
          organization_customer_id?: string
          risk_score?: number
          status?: string
          to_account?: string
          transaction_date?: string
          transaction_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "aml_transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "aml_transactions_organization_customer_id_fkey"
            columns: ["organization_customer_id"]
            isOneToOne: false
            referencedRelation: "organization_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      case_actions: {
        Row: {
          action_by: string | null
          action_by_name: string | null
          action_date: string
          action_type: Database["public"]["Enums"]["action_type"]
          case_id: string
          description: string
          details: Json | null
          id: string
        }
        Insert: {
          action_by?: string | null
          action_by_name?: string | null
          action_date?: string
          action_type: Database["public"]["Enums"]["action_type"]
          case_id: string
          description: string
          details?: Json | null
          id?: string
        }
        Update: {
          action_by?: string | null
          action_by_name?: string | null
          action_date?: string
          action_type?: Database["public"]["Enums"]["action_type"]
          case_id?: string
          description?: string
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      compliance_cases: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string
          documents: string[] | null
          id: string
          organization_customer_id: string | null
          priority: string
          related_alerts: string[] | null
          related_transactions: string[] | null
          resolved_at: string | null
          risk_score: number
          source: Database["public"]["Enums"]["case_source"] | null
          status: Database["public"]["Enums"]["case_status"]
          type: Database["public"]["Enums"]["case_type"]
          updated_at: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description: string
          documents?: string[] | null
          id?: string
          organization_customer_id?: string | null
          priority: string
          related_alerts?: string[] | null
          related_transactions?: string[] | null
          resolved_at?: string | null
          risk_score: number
          source?: Database["public"]["Enums"]["case_source"] | null
          status?: Database["public"]["Enums"]["case_status"]
          type: Database["public"]["Enums"]["case_type"]
          updated_at?: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          assigned_to?: string | null
          assigned_to_name?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string | null
          description?: string
          documents?: string[] | null
          id?: string
          organization_customer_id?: string | null
          priority?: string
          related_alerts?: string[] | null
          related_transactions?: string[] | null
          resolved_at?: string | null
          risk_score?: number
          source?: Database["public"]["Enums"]["case_source"] | null
          status?: Database["public"]["Enums"]["case_status"]
          type?: Database["public"]["Enums"]["case_type"]
          updated_at?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_cases_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_cases_organization_customer_id_fkey"
            columns: ["organization_customer_id"]
            isOneToOne: false
            referencedRelation: "organization_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string
          domain: string | null
          id: string
          name: string
          settings: Json
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          domain?: string | null
          id?: string
          name: string
          settings?: Json
          subscription_tier?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          domain?: string | null
          id?: string
          name?: string
          settings?: Json
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_ingestion_logs: {
        Row: {
          client_id: string
          created_at: string
          error_count: number
          error_details: Json | null
          id: string
          ingestion_type: string
          processing_time_ms: number | null
          record_count: number
          status: string
          success_count: number
        }
        Insert: {
          client_id: string
          created_at?: string
          error_count?: number
          error_details?: Json | null
          id?: string
          ingestion_type: string
          processing_time_ms?: number | null
          record_count?: number
          status: string
          success_count?: number
        }
        Update: {
          client_id?: string
          created_at?: string
          error_count?: number
          error_details?: Json | null
          id?: string
          ingestion_type?: string
          processing_time_ms?: number | null
          record_count?: number
          status?: string
          success_count?: number
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          customer_id: string | null
          extracted_data: Json | null
          file_name: string
          file_path: string
          id: string
          organization_customer_id: string | null
          status: string
          type: string
          updated_at: string
          upload_date: string
          user_id: string
          verification_date: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          extracted_data?: Json | null
          file_name: string
          file_path: string
          id?: string
          organization_customer_id?: string | null
          status: string
          type: string
          updated_at?: string
          upload_date?: string
          user_id: string
          verification_date?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          extracted_data?: Json | null
          file_name?: string
          file_path?: string
          id?: string
          organization_customer_id?: string | null
          status?: string
          type?: string
          updated_at?: string
          upload_date?: string
          user_id?: string
          verification_date?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_organization_customer_id_fkey"
            columns: ["organization_customer_id"]
            isOneToOne: false
            referencedRelation: "organization_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      external_customer_mappings: {
        Row: {
          client_id: string
          created_at: string
          customer_data: Json
          external_customer_id: string
          id: string
          internal_user_id: string
          last_synced_at: string | null
          sync_status: string
        }
        Insert: {
          client_id: string
          created_at?: string
          customer_data: Json
          external_customer_id: string
          id?: string
          internal_user_id: string
          last_synced_at?: string | null
          sync_status?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          customer_data?: Json
          external_customer_id?: string
          id?: string
          internal_user_id?: string
          last_synced_at?: string | null
          sync_status?: string
        }
        Relationships: []
      }
      external_transaction_mappings: {
        Row: {
          client_id: string
          compliance_status: string | null
          created_at: string
          external_customer_id: string
          external_transaction_id: string
          id: string
          risk_assessment: Json | null
          transaction_data: Json
        }
        Insert: {
          client_id: string
          compliance_status?: string | null
          created_at?: string
          external_customer_id: string
          external_transaction_id: string
          id?: string
          risk_assessment?: Json | null
          transaction_data: Json
        }
        Update: {
          client_id?: string
          compliance_status?: string | null
          created_at?: string
          external_customer_id?: string
          external_transaction_id?: string
          id?: string
          risk_assessment?: Json | null
          transaction_data?: Json
        }
        Relationships: []
      }
      integration_api_keys: {
        Row: {
          client_id: string
          created_at: string
          expires_at: string | null
          id: string
          is_active: boolean
          key_hash: string
          key_name: string
          last_used_at: string | null
          permissions: Json
        }
        Insert: {
          client_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash: string
          key_name: string
          last_used_at?: string | null
          permissions?: Json
        }
        Update: {
          client_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          key_hash?: string
          key_name?: string
          last_used_at?: string | null
          permissions?: Json
        }
        Relationships: []
      }
      integration_configs: {
        Row: {
          api_key_hash: string | null
          batch_frequency: string | null
          client_id: string
          client_name: string
          created_at: string
          data_mapping: Json
          id: string
          integration_type: string
          status: string
          updated_at: string
          webhook_url: string | null
        }
        Insert: {
          api_key_hash?: string | null
          batch_frequency?: string | null
          client_id: string
          client_name: string
          created_at?: string
          data_mapping?: Json
          id?: string
          integration_type: string
          status?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Update: {
          api_key_hash?: string | null
          batch_frequency?: string | null
          client_id?: string
          client_name?: string
          created_at?: string
          data_mapping?: Json
          id?: string
          integration_type?: string
          status?: string
          updated_at?: string
          webhook_url?: string | null
        }
        Relationships: []
      }
      organization_customers: {
        Row: {
          address: string | null
          country_of_residence: string | null
          created_at: string
          created_by: string | null
          customer_id: string
          date_of_birth: string | null
          email: string | null
          external_customer_id: string | null
          full_name: string
          id: string
          identity_number: string | null
          is_pep: boolean
          is_sanctioned: boolean
          kyc_status: string
          nationality: string | null
          phone_number: string | null
          risk_score: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          country_of_residence?: string | null
          created_at?: string
          created_by?: string | null
          customer_id: string
          date_of_birth?: string | null
          email?: string | null
          external_customer_id?: string | null
          full_name: string
          id?: string
          identity_number?: string | null
          is_pep?: boolean
          is_sanctioned?: boolean
          kyc_status?: string
          nationality?: string | null
          phone_number?: string | null
          risk_score?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          country_of_residence?: string | null
          created_at?: string
          created_by?: string | null
          customer_id?: string
          date_of_birth?: string | null
          email?: string | null
          external_customer_id?: string | null
          full_name?: string
          id?: string
          identity_number?: string | null
          is_pep?: boolean
          is_sanctioned?: boolean
          kyc_status?: string
          nationality?: string | null
          phone_number?: string | null
          risk_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_customers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      pattern_matches: {
        Row: {
          amount: number
          country: string
          created_at: string
          currency: string
          id: string
          pattern_id: string
          timestamp: string
          transaction_id: string
          user_id: string
          user_name: string
        }
        Insert: {
          amount: number
          country: string
          created_at?: string
          currency: string
          id?: string
          pattern_id: string
          timestamp: string
          transaction_id: string
          user_id: string
          user_name: string
        }
        Update: {
          amount?: number
          country?: string
          created_at?: string
          currency?: string
          id?: string
          pattern_id?: string
          timestamp?: string
          transaction_id?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "pattern_matches_pattern_id_fkey"
            columns: ["pattern_id"]
            isOneToOne: false
            referencedRelation: "patterns"
            referencedColumns: ["id"]
          },
        ]
      }
      patterns: {
        Row: {
          category: Database["public"]["Enums"]["pattern_category"]
          created_at: string
          description: string
          id: string
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["pattern_category"]
          created_at?: string
          description: string
          id?: string
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["pattern_category"]
          created_at?: string
          description?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      platform_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["platform_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["platform_role"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          customer_id: string | null
          email: string
          id: string
          name: string
          risk_score: number
          role: Database["public"]["Enums"]["user_role"]
          status: Database["public"]["Enums"]["user_status"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          customer_id?: string | null
          email: string
          id: string
          name: string
          risk_score?: number
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string
          id?: string
          name?: string
          risk_score?: number
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_matches: {
        Row: {
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          match_data: Json | null
          matched_at: string | null
          rule_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          match_data?: Json | null
          matched_at?: string | null
          rule_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          match_data?: Json | null
          matched_at?: string | null
          rule_id?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          category: string
          condition: Json
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          risk_score: number
          rule_id: string
          rule_name: string
          updated_at: string | null
        }
        Insert: {
          category: string
          condition: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          risk_score: number
          rule_id: string
          rule_name: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          condition?: Json
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          risk_score?: number
          rule_id?: string
          rule_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sars: {
        Row: {
          created_at: string
          date_of_activity: string
          date_submitted: string
          documents: string[] | null
          id: string
          notes: string[] | null
          status: Database["public"]["Enums"]["sar_status"]
          summary: string
          transactions: string[]
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          date_of_activity: string
          date_submitted: string
          documents?: string[] | null
          id?: string
          notes?: string[] | null
          status: Database["public"]["Enums"]["sar_status"]
          summary: string
          transactions: string[]
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          date_of_activity?: string
          date_submitted?: string
          documents?: string[] | null
          id?: string
          notes?: string[] | null
          status?: Database["public"]["Enums"]["sar_status"]
          summary?: string
          transactions?: string[]
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          trial_end: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          max_cases: number | null
          max_transactions: number | null
          max_users: number | null
          name: string
          plan_id: string
          price_monthly: number
          price_yearly: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_cases?: number | null
          max_transactions?: number | null
          max_users?: number | null
          name: string
          plan_id: string
          price_monthly: number
          price_yearly: number
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          max_cases?: number | null
          max_transactions?: number | null
          max_users?: number | null
          name?: string
          plan_id?: string
          price_monthly?: number
          price_yearly?: number
        }
        Relationships: []
      }
      usage_metrics: {
        Row: {
          count: number
          created_at: string
          date: string
          id: string
          metric_type: string
          user_id: string | null
        }
        Insert: {
          count?: number
          created_at?: string
          date?: string
          id?: string
          metric_type: string
          user_id?: string | null
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          id?: string
          metric_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          customer_id: string | null
          id: string
          role: Database["public"]["Enums"]["customer_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          customer_id?: string | null
          id?: string
          role: Database["public"]["Enums"]["customer_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["customer_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_notifications: {
        Row: {
          client_id: string
          created_at: string
          delivered_at: string | null
          event_type: string
          id: string
          last_attempt_at: string | null
          payload: Json
          retry_count: number
          status: string
          webhook_url: string
        }
        Insert: {
          client_id: string
          created_at?: string
          delivered_at?: string | null
          event_type: string
          id?: string
          last_attempt_at?: string | null
          payload: Json
          retry_count?: number
          status?: string
          webhook_url: string
        }
        Update: {
          client_id?: string
          created_at?: string
          delivered_at?: string | null
          event_type?: string
          id?: string
          last_attempt_at?: string | null
          payload?: Json
          retry_count?: number
          status?: string
          webhook_url?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_customer_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["customer_role"][]
      }
      get_user_platform_roles: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["platform_role"][]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
      has_customer_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["customer_role"]
        }
        Returns: boolean
      }
      has_platform_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["platform_role"]
        }
        Returns: boolean
      }
      is_platform_owner: {
        Args: { _user_id: string }
        Returns: boolean
      }
      track_usage: {
        Args: { metric_type: string }
        Returns: undefined
      }
    }
    Enums: {
      action_type:
        | "created"
        | "updated"
        | "assigned"
        | "resolved"
        | "closed"
        | "commented"
      case_action_type:
        | "note"
        | "status_change"
        | "assignment"
        | "document_request"
        | "escalation"
        | "resolution"
      case_priority: "low" | "medium" | "high" | "critical"
      case_source:
        | "manual"
        | "system"
        | "external"
        | "transaction_alert"
        | "kyc_flag"
        | "sanctions_hit"
        | "risk_assessment"
      case_status: "open" | "in_progress" | "resolved" | "closed"
      case_type: "kyc" | "aml" | "sanctions" | "fraud" | "other"
      customer_role:
        | "customer_admin"
        | "customer_compliance"
        | "customer_executive"
        | "customer_support"
      document_status: "pending" | "verified" | "rejected"
      document_type:
        | "passport"
        | "drivers_license"
        | "utility_bill"
        | "bank_statement"
        | "other"
      pattern_category:
        | "structuring"
        | "round_amounts"
        | "velocity"
        | "geographic"
        | "time_based"
      platform_role: "platform_admin" | "platform_support"
      sar_status: "draft" | "submitted" | "filed" | "rejected"
      user_role: "admin" | "complianceOfficer" | "executive" | "support"
      user_status: "active" | "pending" | "suspended" | "banned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      action_type: [
        "created",
        "updated",
        "assigned",
        "resolved",
        "closed",
        "commented",
      ],
      case_action_type: [
        "note",
        "status_change",
        "assignment",
        "document_request",
        "escalation",
        "resolution",
      ],
      case_priority: ["low", "medium", "high", "critical"],
      case_source: [
        "manual",
        "system",
        "external",
        "transaction_alert",
        "kyc_flag",
        "sanctions_hit",
        "risk_assessment",
      ],
      case_status: ["open", "in_progress", "resolved", "closed"],
      case_type: ["kyc", "aml", "sanctions", "fraud", "other"],
      customer_role: [
        "customer_admin",
        "customer_compliance",
        "customer_executive",
        "customer_support",
      ],
      document_status: ["pending", "verified", "rejected"],
      document_type: [
        "passport",
        "drivers_license",
        "utility_bill",
        "bank_statement",
        "other",
      ],
      pattern_category: [
        "structuring",
        "round_amounts",
        "velocity",
        "geographic",
        "time_based",
      ],
      platform_role: ["platform_admin", "platform_support"],
      sar_status: ["draft", "submitted", "filed", "rejected"],
      user_role: ["admin", "complianceOfficer", "executive", "support"],
      user_status: ["active", "pending", "suspended", "banned"],
    },
  },
} as const
