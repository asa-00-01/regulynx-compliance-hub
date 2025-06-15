export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
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
          action_type: Database["public"]["Enums"]["case_action_type"]
          case_id: string
          description: string
          details: Json | null
          id: string
        }
        Insert: {
          action_by?: string | null
          action_by_name?: string | null
          action_date?: string
          action_type: Database["public"]["Enums"]["case_action_type"]
          case_id: string
          description: string
          details?: Json | null
          id?: string
        }
        Update: {
          action_by?: string | null
          action_by_name?: string | null
          action_date?: string
          action_type?: Database["public"]["Enums"]["case_action_type"]
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
            foreignKeyName: "case_actions_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "compliance_cases"
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
          description: string
          documents: string[] | null
          id: string
          priority: Database["public"]["Enums"]["case_priority"]
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
          description: string
          documents?: string[] | null
          id?: string
          priority: Database["public"]["Enums"]["case_priority"]
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
          description?: string
          documents?: string[] | null
          id?: string
          priority?: Database["public"]["Enums"]["case_priority"]
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
            foreignKeyName: "compliance_cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "compliance_cases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          extracted_data: Json | null
          file_name: string
          file_path: string
          id: string
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
          extracted_data?: Json | null
          file_name: string
          file_path: string
          id?: string
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
          extracted_data?: Json | null
          file_name?: string
          file_path?: string
          id?: string
          status?: string
          type?: string
          updated_at?: string
          upload_date?: string
          user_id?: string
          verification_date?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
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
          email?: string
          id?: string
          name?: string
          risk_score?: number
          role?: Database["public"]["Enums"]["user_role"]
          status?: Database["public"]["Enums"]["user_status"]
          updated_at?: string
        }
        Relationships: []
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
        Relationships: [
          {
            foreignKeyName: "risk_matches_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "rules"
            referencedColumns: ["rule_id"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { user_id: string }
        Returns: string
      }
    }
    Enums: {
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
        | "transaction_alert"
        | "kyc_flag"
        | "sanctions_hit"
        | "system"
        | "risk_assessment"
      case_status:
        | "open"
        | "under_review"
        | "escalated"
        | "pending_info"
        | "closed"
      case_type: "kyc" | "aml" | "sanctions"
      document_status: "pending" | "verified" | "rejected"
      document_type: "passport" | "id" | "license"
      user_role: "complianceOfficer" | "admin" | "executive" | "support"
      user_status: "verified" | "pending" | "flagged"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
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
        "transaction_alert",
        "kyc_flag",
        "sanctions_hit",
        "system",
        "risk_assessment",
      ],
      case_status: [
        "open",
        "under_review",
        "escalated",
        "pending_info",
        "closed",
      ],
      case_type: ["kyc", "aml", "sanctions"],
      document_status: ["pending", "verified", "rejected"],
      document_type: ["passport", "id", "license"],
      user_role: ["complianceOfficer", "admin", "executive", "support"],
      user_status: ["verified", "pending", "flagged"],
    },
  },
} as const
