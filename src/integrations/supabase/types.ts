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
      about_profile: {
        Row: {
          bio: string
          content: string
          created_at: string
          id: string
          name: string
          photo: string | null
          photo_thumb: string | null
          photos: Json
          role_line: string
          updated_at: string
        }
        Insert: {
          bio?: string
          content?: string
          created_at?: string
          id?: string
          name?: string
          photo?: string | null
          photo_thumb?: string | null
          photos?: Json
          role_line?: string
          updated_at?: string
        }
        Update: {
          bio?: string
          content?: string
          created_at?: string
          id?: string
          name?: string
          photo?: string | null
          photo_thumb?: string | null
          photos?: Json
          role_line?: string
          updated_at?: string
        }
        Relationships: []
      }
      admin_gate: {
        Row: {
          created_at: string
          failed_attempts: number
          id: string
          locked_until: string | null
          password_changed_at: string | null
          password_hash: string | null
          password_salt: string | null
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          failed_attempts?: number
          id?: string
          locked_until?: string | null
          password_changed_at?: string | null
          password_hash?: string | null
          password_salt?: string | null
          updated_at?: string
          username?: string
        }
        Update: {
          created_at?: string
          failed_attempts?: number
          id?: string
          locked_until?: string | null
          password_changed_at?: string | null
          password_hash?: string | null
          password_salt?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          age: string
          city: string
          created_at: string
          developer: string
          down_payment: string
          fgts: string
          household_income: string
          id: string
          message: string
          name: string
          neighborhood: string
          page_url: string
          phone: string
          property_id: string | null
          property_ref: string
          property_slug: string
          property_title: string
          source: string
          user_agent: string
        }
        Insert: {
          age?: string
          city?: string
          created_at?: string
          developer?: string
          down_payment?: string
          fgts?: string
          household_income?: string
          id?: string
          message?: string
          name?: string
          neighborhood?: string
          page_url?: string
          phone?: string
          property_id?: string | null
          property_ref?: string
          property_slug?: string
          property_title?: string
          source?: string
          user_agent?: string
        }
        Update: {
          age?: string
          city?: string
          created_at?: string
          developer?: string
          down_payment?: string
          fgts?: string
          household_income?: string
          id?: string
          message?: string
          name?: string
          neighborhood?: string
          page_url?: string
          phone?: string
          property_id?: string | null
          property_ref?: string
          property_slug?: string
          property_title?: string
          source?: string
          user_agent?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          accepts_fgts: boolean
          area: number
          bathrooms: number
          bedrooms: number
          broker_analysis: Json
          category: string
          city: string
          commercial_conditions: string | null
          created_at: string
          custom_whatsapp_message: string | null
          custom_whatsapp_url: string | null
          delivery_date: string | null
          description: string
          developer_slug: string
          down_payment_info: string | null
          features: string[]
          financing: string[]
          gallery_images: string[]
          highlight: string | null
          id: string
          image: string | null
          image_thumb: string | null
          leisure: string[]
          location_address: string | null
          map_query: string | null
          minha_casa_minha_vida: boolean
          neighborhood: string
          parking: number
          price: number
          ref: string
          slug: string
          title: string
          type: string
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          accepts_fgts?: boolean
          area?: number
          bathrooms?: number
          bedrooms?: number
          broker_analysis?: Json
          category: string
          city: string
          commercial_conditions?: string | null
          created_at?: string
          custom_whatsapp_message?: string | null
          custom_whatsapp_url?: string | null
          delivery_date?: string | null
          description?: string
          developer_slug?: string
          down_payment_info?: string | null
          features?: string[]
          financing?: string[]
          gallery_images?: string[]
          highlight?: string | null
          id?: string
          image?: string | null
          image_thumb?: string | null
          leisure?: string[]
          location_address?: string | null
          map_query?: string | null
          minha_casa_minha_vida?: boolean
          neighborhood: string
          parking?: number
          price?: number
          ref: string
          slug: string
          title: string
          type: string
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          accepts_fgts?: boolean
          area?: number
          bathrooms?: number
          bedrooms?: number
          broker_analysis?: Json
          category?: string
          city?: string
          commercial_conditions?: string | null
          created_at?: string
          custom_whatsapp_message?: string | null
          custom_whatsapp_url?: string | null
          delivery_date?: string | null
          description?: string
          developer_slug?: string
          down_payment_info?: string | null
          features?: string[]
          financing?: string[]
          gallery_images?: string[]
          highlight?: string | null
          id?: string
          image?: string | null
          image_thumb?: string | null
          leisure?: string[]
          location_address?: string | null
          map_query?: string | null
          minha_casa_minha_vida?: boolean
          neighborhood?: string
          parking?: number
          price?: number
          ref?: string
          slug?: string
          title?: string
          type?: string
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
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
      [_ in never]: never
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
