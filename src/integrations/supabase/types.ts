export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      assistant_test_runs: {
        Row: {
          created_at: string
          id: string
          result_json: Json | null
          status: string
          test_type: string
          token_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          result_json?: Json | null
          status: string
          test_type: string
          token_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          result_json?: Json | null
          status?: string
          test_type?: string
          token_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assistant_test_runs_token_id_fkey"
            columns: ["token_id"]
            isOneToOne: false
            referencedRelation: "assistant_test_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_test_tokens: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          revoked: boolean
          token_hash: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at: string
          id?: string
          revoked?: boolean
          token_hash: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          revoked?: boolean
          token_hash?: string
        }
        Relationships: []
      }
      exports: {
        Row: {
          created_at: string
          created_by: string | null
          export_type: string
          file_url: string | null
          filters_json: Json | null
          id: string
          row_count: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          export_type: string
          file_url?: string | null
          filters_json?: Json | null
          id?: string
          row_count?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          export_type?: string
          file_url?: string | null
          filters_json?: Json | null
          id?: string
          row_count?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      prospect_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_note: string | null
          event_type: string
          id: string
          prospect_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_note?: string | null
          event_type: string
          id?: string
          prospect_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_note?: string | null
          event_type?: string
          id?: string
          prospect_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "prospect_events_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      prospects: {
        Row: {
          address: string | null
          business_status: string | null
          city: string | null
          company_name: string
          contact_page_url: string | null
          created_at: string
          distance_ring: number | null
          exclusion_reason: string | null
          fit_category: string
          google_place_id: string | null
          google_rating: number | null
          google_review_count: number | null
          has_mobile_or_whatsapp: boolean
          has_own_website: boolean
          has_visible_phone: boolean
          id: string
          import_allowed: boolean
          is_directory_or_leadsite: boolean
          last_verified_at: string | null
          latitude: number | null
          lead_score: number
          longitude: number | null
          notes: string | null
          outreach_status: string
          permission_status: string
          phone_main: string | null
          phone_mobile_e164: string | null
          rank_overall: number | null
          reason_fit: string | null
          redesign_score: number
          region_id: string | null
          region_rank: number | null
          segment: string | null
          source_type: string
          source_url: string | null
          updated_at: string
          website_url: string | null
          whatsapp_link: string | null
          whatsapp_visible: boolean
        }
        Insert: {
          address?: string | null
          business_status?: string | null
          city?: string | null
          company_name: string
          contact_page_url?: string | null
          created_at?: string
          distance_ring?: number | null
          exclusion_reason?: string | null
          fit_category?: string
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          has_mobile_or_whatsapp?: boolean
          has_own_website?: boolean
          has_visible_phone?: boolean
          id?: string
          import_allowed?: boolean
          is_directory_or_leadsite?: boolean
          last_verified_at?: string | null
          latitude?: number | null
          lead_score?: number
          longitude?: number | null
          notes?: string | null
          outreach_status?: string
          permission_status?: string
          phone_main?: string | null
          phone_mobile_e164?: string | null
          rank_overall?: number | null
          reason_fit?: string | null
          redesign_score?: number
          region_id?: string | null
          region_rank?: number | null
          segment?: string | null
          source_type?: string
          source_url?: string | null
          updated_at?: string
          website_url?: string | null
          whatsapp_link?: string | null
          whatsapp_visible?: boolean
        }
        Update: {
          address?: string | null
          business_status?: string | null
          city?: string | null
          company_name?: string
          contact_page_url?: string | null
          created_at?: string
          distance_ring?: number | null
          exclusion_reason?: string | null
          fit_category?: string
          google_place_id?: string | null
          google_rating?: number | null
          google_review_count?: number | null
          has_mobile_or_whatsapp?: boolean
          has_own_website?: boolean
          has_visible_phone?: boolean
          id?: string
          import_allowed?: boolean
          is_directory_or_leadsite?: boolean
          last_verified_at?: string | null
          latitude?: number | null
          lead_score?: number
          longitude?: number | null
          notes?: string | null
          outreach_status?: string
          permission_status?: string
          phone_main?: string | null
          phone_mobile_e164?: string | null
          rank_overall?: number | null
          reason_fit?: string | null
          redesign_score?: number
          region_id?: string | null
          region_rank?: number | null
          segment?: string | null
          source_type?: string
          source_url?: string | null
          updated_at?: string
          website_url?: string | null
          whatsapp_link?: string | null
          whatsapp_visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "prospects_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          active: boolean
          city: string | null
          created_at: string
          distance_from_rotterdam_km: number | null
          id: string
          region_name: string
          region_order: number
          ring: number | null
        }
        Insert: {
          active?: boolean
          city?: string | null
          created_at?: string
          distance_from_rotterdam_km?: number | null
          id?: string
          region_name: string
          region_order: number
          ring?: number | null
        }
        Update: {
          active?: boolean
          city?: string | null
          created_at?: string
          distance_from_rotterdam_km?: number | null
          id?: string
          region_name?: string
          region_order?: number
          ring?: number | null
        }
        Relationships: []
      }
      scan_pages: {
        Row: {
          created_at: string
          id: string
          last_opened_at: string | null
          opened_count: number
          prospect_id: string
          public_url: string | null
          scan_score: number | null
          scan_slug: string
          scan_status: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_opened_at?: string | null
          opened_count?: number
          prospect_id: string
          public_url?: string | null
          scan_score?: number | null
          scan_slug: string
          scan_status?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_opened_at?: string | null
          opened_count?: number
          prospect_id?: string
          public_url?: string | null
          scan_score?: number | null
          scan_slug?: string
          scan_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_pages_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      screenshots: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          prospect_id: string
          screenshot_type: string
          status: string
          storage_path: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          prospect_id: string
          screenshot_type?: string
          status?: string
          storage_path?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          prospect_id?: string
          screenshot_type?: string
          status?: string
          storage_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "screenshots_prospect_id_fkey"
            columns: ["prospect_id"]
            isOneToOne: false
            referencedRelation: "prospects"
            referencedColumns: ["id"]
          },
        ]
      }
      search_jobs: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          prospects_created: number
          query: string | null
          region_id: string | null
          results_found: number
          segment: string | null
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          prospects_created?: number
          query?: string | null
          region_id?: string | null
          results_found?: number
          segment?: string | null
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          prospects_created?: number
          query?: string | null
          region_id?: string | null
          results_found?: number
          segment?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "search_jobs_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_scan_page: {
        Args: { _slug: string }
        Returns: {
          city: string
          company_name: string
          scan_score: number
          scan_slug: string
          scan_status: string
          website_url: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "sales" | "viewer"
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
      app_role: ["admin", "sales", "viewer"],
    },
  },
} as const
