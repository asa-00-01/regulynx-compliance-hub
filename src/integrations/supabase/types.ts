export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_configurations: {
        Row: {
          available_tools: Json | null
          created_at: string | null
          customer_id: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          response_categories: Json | null
          settings: Json | null
          system_prompt: string
          updated_at: string | null
        }
        Insert: {
          available_tools?: Json | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          response_categories?: Json | null
          settings?: Json | null
          system_prompt: string
          updated_at?: string | null
        }
        Update: {
          available_tools?: Json | null
          created_at?: string | null
          customer_id?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          response_categories?: Json | null
          settings?: Json | null
          system_prompt?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_configurations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_interactions: {
        Row: {
          confidence: number | null
          configuration_id: string | null
          created_at: string | null
          customer_id: string | null
          id: string
          message: string
          metadata: Json | null
          processing_time: number | null
          response: string
          session_id: string | null
          tools_used: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          confidence?: number | null
          configuration_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          message: string
          metadata?: Json | null
          processing_time?: number | null
          response: string
          session_id?: string | null
          tools_used?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          confidence?: number | null
          configuration_id?: string | null
          created_at?: string | null
          customer_id?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          processing_time?: number | null
          response?: string
          session_id?: string | null
          tools_used?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_interactions_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "ai_configurations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_interactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
      }
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
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_logs: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string
          duration_seconds: number | null
          error_message: string | null
          file_path: string | null
          file_size: number | null
          id: string
          status: string
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          status: string
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          status?: string
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
        Relationships: [
          {
            foreignKeyName: "case_actions_action_by_fkey"
            columns: ["action_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_actions_action_by_fkey"
            columns: ["action_by"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_actions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "compliance_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_document: {
        Row: {
          case_id: string
          created_at: string | null
          document_id: string
          id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          document_id: string
          id?: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          document_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_document_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "compliance_case"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_document_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document"
            referencedColumns: ["id"]
          },
        ]
      }
      case_event: {
        Row: {
          case_id: string
          created_at: string | null
          created_by: string | null
          description: string
          event_type: string
          id: string
          metadata: Json | null
        }
        Insert: {
          case_id: string
          created_at?: string | null
          created_by?: string | null
          description: string
          event_type: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          case_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          event_type?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "case_event_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "compliance_case"
            referencedColumns: ["id"]
          },
        ]
      }
      case_transaction: {
        Row: {
          case_id: string
          created_at: string | null
          id: string
          transaction_id: string
        }
        Insert: {
          case_id: string
          created_at?: string | null
          id?: string
          transaction_id: string
        }
        Update: {
          case_id?: string
          created_at?: string | null
          id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_transaction_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "compliance_case"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_transaction_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transaction"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_case: {
        Row: {
          assigned_to: string | null
          case_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          organisation_customer_id: string
          priority: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          case_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organisation_customer_id: string
          priority: string
          resolved_at?: string | null
          resolved_by?: string | null
          status: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          case_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organisation_customer_id?: string
          priority?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_case_organisation_customer_id_fkey"
            columns: ["organisation_customer_id"]
            isOneToOne: false
            referencedRelation: "organisation_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_cases: {
        Row: {
          assigned_to: string | null
          assigned_to_name: string | null
          created_at: string
          created_by: string | null
          customer_id: string | null
          description: string
          documents: Json | null
          id: string
          organization_customer_id: string | null
          priority: string
          related_alerts: Json | null
          related_transactions: Json | null
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
          documents?: Json | null
          id?: string
          organization_customer_id?: string | null
          priority: string
          related_alerts?: Json | null
          related_transactions?: Json | null
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
          documents?: Json | null
          id?: string
          organization_customer_id?: string | null
          priority?: string
          related_alerts?: Json | null
          related_transactions?: Json | null
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
            foreignKeyName: "compliance_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_cases_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "compliance_cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_ai_settings: {
        Row: {
          created_at: string | null
          custom_categories: Json | null
          custom_tools: Json | null
          customer_id: string | null
          default_configuration_id: string | null
          id: string
          limits: Json | null
          openai_api_key: string | null
          preferences: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_categories?: Json | null
          custom_tools?: Json | null
          customer_id?: string | null
          default_configuration_id?: string | null
          id?: string
          limits?: Json | null
          openai_api_key?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_categories?: Json | null
          custom_tools?: Json | null
          customer_id?: string | null
          default_configuration_id?: string | null
          id?: string
          limits?: Json | null
          openai_api_key?: string | null
          preferences?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_ai_settings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
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
      deployment_logs: {
        Row: {
          branch: string | null
          build_duration_seconds: number | null
          commit_hash: string | null
          completed_at: string | null
          created_at: string
          deployed_by: string | null
          deployment_duration_seconds: number | null
          deployment_id: string
          environment: string
          error_message: string | null
          id: string
          rollback_reason: string | null
          status: string
          version: string
        }
        Insert: {
          branch?: string | null
          build_duration_seconds?: number | null
          commit_hash?: string | null
          completed_at?: string | null
          created_at?: string
          deployed_by?: string | null
          deployment_duration_seconds?: number | null
          deployment_id: string
          environment: string
          error_message?: string | null
          id?: string
          rollback_reason?: string | null
          status: string
          version: string
        }
        Update: {
          branch?: string | null
          build_duration_seconds?: number | null
          commit_hash?: string | null
          completed_at?: string | null
          created_at?: string
          deployed_by?: string | null
          deployment_duration_seconds?: number | null
          deployment_id?: string
          environment?: string
          error_message?: string | null
          id?: string
          rollback_reason?: string | null
          status?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "deployment_logs_deployed_by_fkey"
            columns: ["deployed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deployment_logs_deployed_by_fkey"
            columns: ["deployed_by"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      document: {
        Row: {
          created_at: string | null
          file_name: string
          file_size_bytes: number | null
          id: string
          metadata: Json | null
          mime_type: string
          organisation_customer_id: string
          status: string
          storage_uri: string
          type: string
          updated_at: string | null
          uploaded_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          mime_type: string
          organisation_customer_id: string
          status: string
          storage_uri: string
          type: string
          updated_at?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_size_bytes?: number | null
          id?: string
          metadata?: Json | null
          mime_type?: string
          organisation_customer_id?: string
          status?: string
          storage_uri?: string
          type?: string
          updated_at?: string | null
          uploaded_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_organisation_customer_id_fkey"
            columns: ["organisation_customer_id"]
            isOneToOne: false
            referencedRelation: "organisation_customer"
            referencedColumns: ["id"]
          },
        ]
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
          type: Database["public"]["Enums"]["document_type"]
          updated_at: string
          upload_date: string
          user_id: string | null
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
          status?: string
          type: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          upload_date?: string
          user_id?: string | null
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
          type?: Database["public"]["Enums"]["document_type"]
          updated_at?: string
          upload_date?: string
          user_id?: string | null
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
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      environment_validations: {
        Row: {
          environment: string
          id: string
          message: string
          recommendation: string | null
          severity: string
          status: string
          validated_at: string
          validation_type: string
        }
        Insert: {
          environment: string
          id?: string
          message: string
          recommendation?: string | null
          severity: string
          status: string
          validated_at?: string
          validation_type: string
        }
        Update: {
          environment?: string
          id?: string
          message?: string
          recommendation?: string | null
          severity?: string
          status?: string
          validated_at?: string
          validation_type?: string
        }
        Relationships: []
      }
      error_logs: {
        Row: {
          additional_context: Json | null
          created_at: string
          environment: string | null
          error_id: string
          error_message: string
          error_stack: string | null
          error_type: string
          id: string
          resolved: boolean | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          additional_context?: Json | null
          created_at?: string
          environment?: string | null
          error_id: string
          error_message: string
          error_stack?: string | null
          error_type: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          additional_context?: Json | null
          created_at?: string
          environment?: string | null
          error_id?: string
          error_message?: string
          error_stack?: string | null
          error_type?: string
          id?: string
          resolved?: boolean | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "error_logs_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_logs_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "error_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_history: {
        Row: {
          case_id: string
          escalated_from_user_id: string | null
          escalated_to_role: Database["public"]["Enums"]["customer_role"] | null
          escalated_to_user_id: string | null
          escalation_date: string | null
          escalation_level: number
          escalation_rule_id: string | null
          id: string
          new_assigned_to: string | null
          new_priority: string | null
          previous_assigned_to: string | null
          previous_priority: string | null
          reason: string
          resolution_notes: string | null
          resolved_at: string | null
        }
        Insert: {
          case_id: string
          escalated_from_user_id?: string | null
          escalated_to_role?:
            | Database["public"]["Enums"]["customer_role"]
            | null
          escalated_to_user_id?: string | null
          escalation_date?: string | null
          escalation_level: number
          escalation_rule_id?: string | null
          id?: string
          new_assigned_to?: string | null
          new_priority?: string | null
          previous_assigned_to?: string | null
          previous_priority?: string | null
          reason: string
          resolution_notes?: string | null
          resolved_at?: string | null
        }
        Update: {
          case_id?: string
          escalated_from_user_id?: string | null
          escalated_to_role?:
            | Database["public"]["Enums"]["customer_role"]
            | null
          escalated_to_user_id?: string | null
          escalation_date?: string | null
          escalation_level?: number
          escalation_rule_id?: string | null
          id?: string
          new_assigned_to?: string | null
          new_priority?: string | null
          previous_assigned_to?: string | null
          previous_priority?: string | null
          reason?: string
          resolution_notes?: string | null
          resolved_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalation_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "compliance_cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_escalated_from_user_id_fkey"
            columns: ["escalated_from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_escalated_from_user_id_fkey"
            columns: ["escalated_from_user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_escalated_to_user_id_fkey"
            columns: ["escalated_to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_escalated_to_user_id_fkey"
            columns: ["escalated_to_user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_escalation_rule_id_fkey"
            columns: ["escalation_rule_id"]
            isOneToOne: false
            referencedRelation: "escalation_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_new_assigned_to_fkey"
            columns: ["new_assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_new_assigned_to_fkey"
            columns: ["new_assigned_to"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_previous_assigned_to_fkey"
            columns: ["previous_assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_history_previous_assigned_to_fkey"
            columns: ["previous_assigned_to"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_notifications: {
        Row: {
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          escalation_history_id: string
          id: string
          message: string
          notification_type: string
          read_at: string | null
          recipient_email: string | null
          recipient_phone: string | null
          recipient_user_id: string | null
          retry_count: number | null
          sent_at: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          escalation_history_id: string
          id?: string
          message: string
          notification_type: string
          read_at?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          recipient_user_id?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          escalation_history_id?: string
          id?: string
          message?: string
          notification_type?: string
          read_at?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          recipient_user_id?: string | null
          retry_count?: number | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalation_notifications_escalation_history_id_fkey"
            columns: ["escalation_history_id"]
            isOneToOne: false
            referencedRelation: "escalation_history"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_notifications_recipient_user_id_fkey"
            columns: ["recipient_user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      escalation_rules: {
        Row: {
          auto_assign: boolean | null
          case_type: Database["public"]["Enums"]["case_type"] | null
          created_at: string | null
          created_by: string | null
          customer_id: string | null
          description: string | null
          escalation_level: number
          id: string
          is_active: boolean | null
          name: string
          priority_boost: boolean | null
          priority_threshold: string | null
          risk_score_threshold: number | null
          send_notifications: boolean | null
          target_role: Database["public"]["Enums"]["customer_role"] | null
          target_user_id: string | null
          time_threshold_hours: number | null
          updated_at: string | null
        }
        Insert: {
          auto_assign?: boolean | null
          case_type?: Database["public"]["Enums"]["case_type"] | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          escalation_level: number
          id?: string
          is_active?: boolean | null
          name: string
          priority_boost?: boolean | null
          priority_threshold?: string | null
          risk_score_threshold?: number | null
          send_notifications?: boolean | null
          target_role?: Database["public"]["Enums"]["customer_role"] | null
          target_user_id?: string | null
          time_threshold_hours?: number | null
          updated_at?: string | null
        }
        Update: {
          auto_assign?: boolean | null
          case_type?: Database["public"]["Enums"]["case_type"] | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string | null
          description?: string | null
          escalation_level?: number
          id?: string
          is_active?: boolean | null
          name?: string
          priority_boost?: boolean | null
          priority_threshold?: string | null
          risk_score_threshold?: number | null
          send_notifications?: boolean | null
          target_role?: Database["public"]["Enums"]["customer_role"] | null
          target_user_id?: string | null
          time_threshold_hours?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escalation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_rules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_rules_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_rules_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escalation_rules_target_user_id_fkey"
            columns: ["target_user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
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
        Relationships: [
          {
            foreignKeyName: "external_customer_mappings_internal_user_id_fkey"
            columns: ["internal_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_customer_mappings_internal_user_id_fkey"
            columns: ["internal_user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
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
      kyx: {
        Row: {
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          organisation_customer_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string | null
          version: number
        }
        Insert: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          organisation_customer_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status: string
          updated_at?: string | null
          version: number
        }
        Update: {
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          organisation_customer_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "kyx_organisation_customer_id_fkey"
            columns: ["organisation_customer_id"]
            isOneToOne: false
            referencedRelation: "organisation_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      news_configurations: {
        Row: {
          created_at: string | null
          customer_id: string
          default_categories: string[] | null
          enable_auto_refresh: boolean | null
          enable_notifications: boolean | null
          id: string
          max_articles_per_source: number | null
          refresh_interval: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id: string
          default_categories?: string[] | null
          enable_auto_refresh?: boolean | null
          enable_notifications?: boolean | null
          id?: string
          max_articles_per_source?: number | null
          refresh_interval?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string
          default_categories?: string[] | null
          enable_auto_refresh?: boolean | null
          enable_notifications?: boolean | null
          id?: string
          max_articles_per_source?: number | null
          refresh_interval?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_configurations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: true
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      news_source_templates: {
        Row: {
          categories: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_recommended: boolean | null
          name: string
          type: string
          url: string
        }
        Insert: {
          categories?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_recommended?: boolean | null
          name: string
          type: string
          url: string
        }
        Update: {
          categories?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_recommended?: boolean | null
          name?: string
          type?: string
          url?: string
        }
        Relationships: []
      }
      news_sources: {
        Row: {
          categories: string[] | null
          created_at: string | null
          created_by: string
          customer_id: string
          description: string | null
          error_count: number | null
          id: string
          is_active: boolean | null
          last_fetched: string | null
          name: string
          priority: number | null
          updated_at: string | null
          url: string
        }
        Insert: {
          categories?: string[] | null
          created_at?: string | null
          created_by: string
          customer_id: string
          description?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_fetched?: string | null
          name: string
          priority?: number | null
          updated_at?: string | null
          url: string
        }
        Update: {
          categories?: string[] | null
          created_at?: string | null
          created_by?: string
          customer_id?: string
          description?: string | null
          error_count?: number | null
          id?: string
          is_active?: boolean | null
          last_fetched?: string | null
          name?: string
          priority?: number | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_sources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_sources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_sources_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      organisation_customer: {
        Row: {
          address: string | null
          country_of_residence: string | null
          created_at: string | null
          created_by: string | null
          customer_id: string
          date_of_birth: string | null
          email: string | null
          external_id: string
          full_name: string
          id: string
          identity_number: string | null
          is_pep: boolean | null
          is_sanctioned: boolean | null
          nationality: string | null
          phone_number: string | null
          risk_score: number | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          country_of_residence?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id: string
          date_of_birth?: string | null
          email?: string | null
          external_id: string
          full_name: string
          id?: string
          identity_number?: string | null
          is_pep?: boolean | null
          is_sanctioned?: boolean | null
          nationality?: string | null
          phone_number?: string | null
          risk_score?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          country_of_residence?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_id?: string
          date_of_birth?: string | null
          email?: string | null
          external_id?: string
          full_name?: string
          id?: string
          identity_number?: string | null
          is_pep?: boolean | null
          is_sanctioned?: boolean | null
          nationality?: string | null
          phone_number?: string | null
          risk_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organisation_customer_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "organization_customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
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
          {
            foreignKeyName: "pattern_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pattern_matches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      patterns: {
        Row: {
          category: Database["public"]["Enums"]["pattern_category"]
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["pattern_category"]
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["pattern_category"]
          created_at?: string
          description?: string | null
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
        Relationships: [
          {
            foreignKeyName: "platform_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "platform_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
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
      rss_feeds: {
        Row: {
          categories: string[] | null
          created_at: string | null
          created_by: string
          customer_id: string
          description: string | null
          error_count: number | null
          feed_url: string
          id: string
          is_active: boolean | null
          last_fetched: string | null
          priority: number | null
          refresh_interval: number | null
          title: string
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          categories?: string[] | null
          created_at?: string | null
          created_by: string
          customer_id: string
          description?: string | null
          error_count?: number | null
          feed_url: string
          id?: string
          is_active?: boolean | null
          last_fetched?: string | null
          priority?: number | null
          refresh_interval?: number | null
          title: string
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          categories?: string[] | null
          created_at?: string | null
          created_by?: string
          customer_id?: string
          description?: string | null
          error_count?: number | null
          feed_url?: string
          id?: string
          is_active?: boolean | null
          last_fetched?: string | null
          priority?: number | null
          refresh_interval?: number | null
          title?: string
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rss_feeds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rss_feeds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rss_feeds_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
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
          documents: Json | null
          id: string
          notes: Json | null
          status: Database["public"]["Enums"]["sar_status"]
          summary: string
          transactions: Json
          updated_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          date_of_activity: string
          date_submitted: string
          documents?: Json | null
          id?: string
          notes?: Json | null
          status: Database["public"]["Enums"]["sar_status"]
          summary: string
          transactions: Json
          updated_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          date_of_activity?: string
          date_submitted?: string
          documents?: Json | null
          id?: string
          notes?: Json | null
          status?: Database["public"]["Enums"]["sar_status"]
          summary?: string
          transactions?: Json
          updated_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sars_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
      }
      sla_tracking: {
        Row: {
          breach_reason: string | null
          case_id: string
          created_at: string | null
          end_time: string | null
          escalation_level: number
          id: string
          sla_type: string
          start_time: string
          status: string | null
          target_hours: number
          updated_at: string | null
        }
        Insert: {
          breach_reason?: string | null
          case_id: string
          created_at?: string | null
          end_time?: string | null
          escalation_level: number
          id?: string
          sla_type: string
          start_time: string
          status?: string | null
          target_hours: number
          updated_at?: string | null
        }
        Update: {
          breach_reason?: string | null
          case_id?: string
          created_at?: string | null
          end_time?: string | null
          escalation_level?: number
          id?: string
          sla_type?: string
          start_time?: string
          status?: string | null
          target_hours?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sla_tracking_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "compliance_cases"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
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
      transaction: {
        Row: {
          amount: number
          counterparty_account: string | null
          counterparty_name: string | null
          created_at: string | null
          currency: string | null
          direction: string
          external_transaction_id: string
          flags: Json | null
          id: string
          metadata: Json | null
          occurred_at: string
          organisation_customer_id: string
          risk_score: number | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          counterparty_account?: string | null
          counterparty_name?: string | null
          created_at?: string | null
          currency?: string | null
          direction: string
          external_transaction_id: string
          flags?: Json | null
          id?: string
          metadata?: Json | null
          occurred_at: string
          organisation_customer_id: string
          risk_score?: number | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          counterparty_account?: string | null
          counterparty_name?: string | null
          created_at?: string | null
          currency?: string | null
          direction?: string
          external_transaction_id?: string
          flags?: Json | null
          id?: string
          metadata?: Json | null
          occurred_at?: string
          organisation_customer_id?: string
          risk_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transaction_organisation_customer_id_fkey"
            columns: ["organisation_customer_id"]
            isOneToOne: false
            referencedRelation: "organisation_customer"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "usage_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "usage_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_with_customer"
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
      user_with_customer: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          customer_domain: string | null
          customer_full_name: string | null
          customer_id: string | null
          customer_settings: Json | null
          email: string | null
          id: string | null
          name: string | null
          risk_score: number | null
          role: Database["public"]["Enums"]["user_role"] | null
          status: Database["public"]["Enums"]["user_status"] | null
          subscription_tier: string | null
          updated_at: string | null
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
    }
    Functions: {
      check_case_escalation: {
        Args: { case_id: string }
        Returns: {
          escalation_level: number
          reason: string
          rule_id: string
          should_escalate: boolean
          target_role: Database["public"]["Enums"]["customer_role"]
          target_user_id: string
        }[]
      }
      check_sla_breaches: {
        Args: Record<PropertyKey, never>
        Returns: {
          actual_hours: number
          case_id: string
          escalation_level: number
          sla_id: string
          sla_type: string
          status: string
          target_hours: number
        }[]
      }
      escalate_case: {
        Args: {
          case_id: string
          escalated_from_user_id?: string
          escalation_level?: number
          escalation_rule_id?: string
          reason?: string
          target_role?: Database["public"]["Enums"]["customer_role"]
          target_user_id?: string
        }
        Returns: string
      }
      get_current_user_with_customer: {
        Args: Record<PropertyKey, never>
        Returns: {
          customer_id: string
          email: string
          id: string
          joined_customer_domain: string
          joined_customer_name: string
          name: string
          role: string
          subscription_tier: string
        }[]
      }
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
          _role: Database["public"]["Enums"]["customer_role"]
          _user_id: string
        }
        Returns: boolean
      }
      has_platform_role: {
        Args: {
          _role: Database["public"]["Enums"]["platform_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_platform_owner: {
        Args: { _user_id: string }
        Returns: boolean
      }
      send_escalation_notifications: {
        Args: { escalation_history_id: string }
        Returns: undefined
      }
      track_usage: {
        Args: { metric_type: string }
        Returns: undefined
      }
    }
    Enums: {
      action_type:
        | "status_change"
        | "assignment"
        | "comment"
        | "document_upload"
        | "escalation"
        | "resolution"
      case_source:
        | "system_alert"
        | "manual_review"
        | "external_report"
        | "regulatory_request"
      case_status: "open" | "in_progress" | "resolved" | "closed" | "escalated"
      case_type:
        | "kyc_review"
        | "aml_alert"
        | "sanctions_hit"
        | "pep_review"
        | "transaction_monitoring"
        | "suspicious_activity"
        | "document_review"
        | "compliance_breach"
      customer_role:
        | "customer_admin"
        | "customer_compliance"
        | "customer_executive"
        | "customer_support"
      document_type:
        | "passport"
        | "drivers_license"
        | "national_id"
        | "utility_bill"
        | "bank_statement"
        | "proof_of_income"
        | "other"
      pattern_category: "transaction" | "behavioral" | "geographic" | "temporal"
      platform_role: "platform_admin" | "platform_support"
      sar_status: "draft" | "submitted" | "acknowledged" | "rejected"
      user_role: "admin" | "complianceOfficer" | "executive" | "support"
      user_status: "verified" | "pending" | "rejected" | "information_requested"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      action_type: [
        "status_change",
        "assignment",
        "comment",
        "document_upload",
        "escalation",
        "resolution",
      ],
      case_source: [
        "system_alert",
        "manual_review",
        "external_report",
        "regulatory_request",
      ],
      case_status: ["open", "in_progress", "resolved", "closed", "escalated"],
      case_type: [
        "kyc_review",
        "aml_alert",
        "sanctions_hit",
        "pep_review",
        "transaction_monitoring",
        "suspicious_activity",
        "document_review",
        "compliance_breach",
      ],
      customer_role: [
        "customer_admin",
        "customer_compliance",
        "customer_executive",
        "customer_support",
      ],
      document_type: [
        "passport",
        "drivers_license",
        "national_id",
        "utility_bill",
        "bank_statement",
        "proof_of_income",
        "other",
      ],
      pattern_category: ["transaction", "behavioral", "geographic", "temporal"],
      platform_role: ["platform_admin", "platform_support"],
      sar_status: ["draft", "submitted", "acknowledged", "rejected"],
      user_role: ["admin", "complianceOfficer", "executive", "support"],
      user_status: ["verified", "pending", "rejected", "information_requested"],
    },
  },
} as const

