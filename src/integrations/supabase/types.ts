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
      asset_profiles: {
        Row: {
          address: string | null
          beta: number | null
          book_value: number | null
          city: string | null
          country: string | null
          currency: string | null
          debt_to_equity: number | null
          description: string | null
          dividend_rate: number | null
          dividend_yield: number | null
          enterprise_value: number | null
          eps: number | null
          ex_dividend_date: string | null
          exchange: string | null
          forward_eps: number | null
          forward_pe: number | null
          free_cash_flow: number | null
          gross_margins: number | null
          id: number
          inception_date: string | null
          industry: string | null
          last_fiscal_year_end: string | null
          last_updated: string | null
          market: string | null
          market_cap: number | null
          most_recent_quarter: string | null
          name: string | null
          net_income: number | null
          next_fiscal_year_end: string | null
          operating_margins: number | null
          phone: string | null
          price_to_book: number | null
          quote_type: string | null
          return_on_assets: number | null
          return_on_equity: number | null
          revenue: number | null
          revenue_per_share: number | null
          sector: string | null
          short_name: string | null
          state: string | null
          symbol: string
          trailing_pe: number | null
          website: string | null
          zip: string | null
        }
        Insert: {
          address?: string | null
          beta?: number | null
          book_value?: number | null
          city?: string | null
          country?: string | null
          currency?: string | null
          debt_to_equity?: number | null
          description?: string | null
          dividend_rate?: number | null
          dividend_yield?: number | null
          enterprise_value?: number | null
          eps?: number | null
          ex_dividend_date?: string | null
          exchange?: string | null
          forward_eps?: number | null
          forward_pe?: number | null
          free_cash_flow?: number | null
          gross_margins?: number | null
          id?: number
          inception_date?: string | null
          industry?: string | null
          last_fiscal_year_end?: string | null
          last_updated?: string | null
          market?: string | null
          market_cap?: number | null
          most_recent_quarter?: string | null
          name?: string | null
          net_income?: number | null
          next_fiscal_year_end?: string | null
          operating_margins?: number | null
          phone?: string | null
          price_to_book?: number | null
          quote_type?: string | null
          return_on_assets?: number | null
          return_on_equity?: number | null
          revenue?: number | null
          revenue_per_share?: number | null
          sector?: string | null
          short_name?: string | null
          state?: string | null
          symbol: string
          trailing_pe?: number | null
          website?: string | null
          zip?: string | null
        }
        Update: {
          address?: string | null
          beta?: number | null
          book_value?: number | null
          city?: string | null
          country?: string | null
          currency?: string | null
          debt_to_equity?: number | null
          description?: string | null
          dividend_rate?: number | null
          dividend_yield?: number | null
          enterprise_value?: number | null
          eps?: number | null
          ex_dividend_date?: string | null
          exchange?: string | null
          forward_eps?: number | null
          forward_pe?: number | null
          free_cash_flow?: number | null
          gross_margins?: number | null
          id?: number
          inception_date?: string | null
          industry?: string | null
          last_fiscal_year_end?: string | null
          last_updated?: string | null
          market?: string | null
          market_cap?: number | null
          most_recent_quarter?: string | null
          name?: string | null
          net_income?: number | null
          next_fiscal_year_end?: string | null
          operating_margins?: number | null
          phone?: string | null
          price_to_book?: number | null
          quote_type?: string | null
          return_on_assets?: number | null
          return_on_equity?: number | null
          revenue?: number | null
          revenue_per_share?: number | null
          sector?: string | null
          short_name?: string | null
          state?: string | null
          symbol?: string
          trailing_pe?: number | null
          website?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      instruments: {
        Row: {
          asset_type: string | null
          bloomberg_code: string | null
          country: string | null
          currency: string | null
          description: string | null
          exchange: string | null
          id: number
          inception_date: string | null
          industry: string | null
          isin: string | null
          last_updated: string | null
          name: string | null
          sector: string | null
          symbol: string
          website: string | null
        }
        Insert: {
          asset_type?: string | null
          bloomberg_code?: string | null
          country?: string | null
          currency?: string | null
          description?: string | null
          exchange?: string | null
          id?: number
          inception_date?: string | null
          industry?: string | null
          isin?: string | null
          last_updated?: string | null
          name?: string | null
          sector?: string | null
          symbol: string
          website?: string | null
        }
        Update: {
          asset_type?: string | null
          bloomberg_code?: string | null
          country?: string | null
          currency?: string | null
          description?: string | null
          exchange?: string | null
          id?: number
          inception_date?: string | null
          industry?: string | null
          isin?: string | null
          last_updated?: string | null
          name?: string | null
          sector?: string | null
          symbol?: string
          website?: string | null
        }
        Relationships: []
      }
      prices: {
        Row: {
          close: number | null
          date: string
          high: number | null
          id: number
          low: number | null
          open: number | null
          symbol: string | null
          volume: number | null
        }
        Insert: {
          close?: number | null
          date: string
          high?: number | null
          id?: number
          low?: number | null
          open?: number | null
          symbol?: string | null
          volume?: number | null
        }
        Update: {
          close?: number | null
          date?: string
          high?: number | null
          id?: number
          low?: number | null
          open?: number | null
          symbol?: string | null
          volume?: number | null
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
      [_ in never]: never
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
    Enums: {},
  },
} as const
