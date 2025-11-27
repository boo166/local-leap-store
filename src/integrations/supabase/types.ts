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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      billing_history: {
        Row: {
          amount: number
          billing_cycle: string
          created_at: string
          currency: string
          description: string | null
          id: string
          invoice_url: string | null
          payment_date: string
          payment_method: string
          subscription_id: string
          user_id: string
        }
        Insert: {
          amount: number
          billing_cycle: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          invoice_url?: string | null
          payment_date?: string
          payment_method?: string
          subscription_id: string
          user_id: string
        }
        Update: {
          amount?: number
          billing_cycle?: string
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          invoice_url?: string | null
          payment_date?: string
          payment_method?: string
          subscription_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_history_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price_at_time: number
          product_id: string
          quantity: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price_at_time: number
          product_id: string
          quantity?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price_at_time?: number
          product_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          cancellation_reason: string | null
          cancelled_at: string | null
          created_at: string
          id: string
          refund_status: string | null
          seller_notes: string | null
          shipping_address: string | null
          status: string
          total_amount: number
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          id?: string
          refund_status?: string | null
          seller_notes?: string | null
          shipping_address?: string | null
          status?: string
          total_amount: number
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancellation_reason?: string | null
          cancelled_at?: string | null
          created_at?: string
          id?: string
          refund_status?: string | null
          seller_notes?: string | null
          shipping_address?: string | null
          status?: string
          total_amount?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      payment_submissions: {
        Row: {
          admin_notes: string | null
          amount: number
          billing_cycle: string
          created_at: string
          id: string
          plan_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          screenshot_url: string
          status: string
          subscription_id: string
          transaction_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          billing_cycle: string
          created_at?: string
          id?: string
          plan_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url: string
          status?: string
          subscription_id: string
          transaction_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          billing_cycle?: string
          created_at?: string
          id?: string
          plan_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          screenshot_url?: string
          status?: string
          subscription_id?: string
          transaction_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_submissions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_submissions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      product_price_history: {
        Row: {
          id: string
          price: number
          product_id: string
          recorded_at: string
        }
        Insert: {
          id?: string
          price: number
          product_id: string
          recorded_at?: string
        }
        Update: {
          id?: string
          price?: number
          product_id?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_price_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_reviews: {
        Row: {
          created_at: string
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          product_id: string
          rating: number
          review_images: Json | null
          review_text: string | null
          updated_at: string
          user_id: string
          verified_purchase: boolean | null
        }
        Insert: {
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          product_id: string
          rating: number
          review_images?: Json | null
          review_text?: string | null
          updated_at?: string
          user_id: string
          verified_purchase?: boolean | null
        }
        Update: {
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          product_id?: string
          rating?: number
          review_images?: Json | null
          review_text?: string | null
          updated_at?: string
          user_id?: string
          verified_purchase?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          dimensions: Json | null
          id: string
          image_url: string | null
          images: Json | null
          inventory_count: number | null
          is_active: boolean | null
          low_stock_threshold: number | null
          name: string
          price: number
          sales_count: number | null
          sku: string | null
          store_id: string
          tags: string[] | null
          updated_at: string
          variants: Json | null
          weight: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          images?: Json | null
          inventory_count?: number | null
          is_active?: boolean | null
          low_stock_threshold?: number | null
          name: string
          price: number
          sales_count?: number | null
          sku?: string | null
          store_id: string
          tags?: string[] | null
          updated_at?: string
          variants?: Json | null
          weight?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          dimensions?: Json | null
          id?: string
          image_url?: string | null
          images?: Json | null
          inventory_count?: number | null
          is_active?: boolean | null
          low_stock_threshold?: number | null
          name?: string
          price?: number
          sales_count?: number | null
          sku?: string | null
          store_id?: string
          tags?: string[] | null
          updated_at?: string
          variants?: Json | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          mfa_enabled: boolean | null
          profile_completed_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mfa_enabled?: boolean | null
          profile_completed_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          mfa_enabled?: boolean | null
          profile_completed_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_discount_amount: number | null
          min_purchase_amount: number | null
          updated_at: string
          usage_count: number
          usage_limit: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_type: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_discount_amount?: number | null
          min_purchase_amount?: number | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      review_helpful_votes: {
        Row: {
          created_at: string
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_votes_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "product_reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_helpful_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      saved_for_later: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_for_later_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_for_later_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      site_content: {
        Row: {
          content: Json
          created_at: string
          id: string
          section: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          section: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          business_hours: Json | null
          category: string | null
          created_at: string
          description: string | null
          email: string | null
          facebook: string | null
          id: string
          image_url: string | null
          instagram: string | null
          is_active: boolean | null
          location: string | null
          logo_url: string | null
          name: string
          phone: string | null
          tags: string[] | null
          twitter: string | null
          updated_at: string
          user_id: string
          view_count: number | null
          website: string | null
        }
        Insert: {
          business_hours?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          is_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          name: string
          phone?: string | null
          tags?: string[] | null
          twitter?: string | null
          updated_at?: string
          user_id: string
          view_count?: number | null
          website?: string | null
        }
        Update: {
          business_hours?: Json | null
          category?: string | null
          created_at?: string
          description?: string | null
          email?: string | null
          facebook?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          is_active?: boolean | null
          location?: string | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          tags?: string[] | null
          twitter?: string | null
          updated_at?: string
          user_id?: string
          view_count?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          currency: string
          features: Json | null
          has_analytics: boolean
          has_support: boolean
          id: string
          is_active: boolean
          max_products: number | null
          name: string
          name_ar: string | null
          price_monthly: number
          price_yearly: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          features?: Json | null
          has_analytics?: boolean
          has_support?: boolean
          id?: string
          is_active?: boolean
          max_products?: number | null
          name: string
          name_ar?: string | null
          price_monthly?: number
          price_yearly?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          features?: Json | null
          has_analytics?: boolean
          has_support?: boolean
          id?: string
          is_active?: boolean
          max_products?: number | null
          name?: string
          name_ar?: string | null
          price_monthly?: number
          price_yearly?: number
          updated_at?: string
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          created_at: string
          id: string
          metric_name: string
          metric_value: number
          period_end: string
          period_start: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_name: string
          metric_value?: number
          period_end: string
          period_start: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_name?: string
          metric_value?: number
          period_end?: string
          period_start?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "usage_tracking_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_activity_logs: {
        Row: {
          activity_category: string
          activity_type: string
          created_at: string | null
          description: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_category: string
          activity_type: string
          created_at?: string | null
          description: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_category?: string
          activity_type?: string
          created_at?: string | null
          description?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          expires_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_activity_at: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_activity_at?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      wishlist_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlist_items_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_profile_completion: {
        Args: { user_id_param: string }
        Returns: number
      }
      can_add_product: { Args: { user_id_param: string }; Returns: boolean }
      cleanup_expired_sessions: { Args: never; Returns: undefined }
      get_low_stock_products: {
        Args: { store_id_param: string }
        Returns: {
          id: string
          inventory_count: number
          low_stock_threshold: number
          name: string
        }[]
      }
      get_user_subscription_status: {
        Args: { user_id_param: string }
        Returns: {
          days_remaining: number
          has_active_subscription: boolean
          has_analytics: boolean
          is_expired: boolean
          is_trial: boolean
          max_products: number
          plan_name: string
        }[]
      }
      get_user_usage_stats: {
        Args: { user_id_param: string }
        Returns: {
          active_products: number
          product_limit: number
          total_orders: number
          total_products: number
          total_revenue: number
          usage_percentage: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_product_sales: {
        Args: { product_id_param: string; quantity_param: number }
        Returns: undefined
      }
      increment_store_views: {
        Args: { store_id_param: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_seller_of_order: {
        Args: { _order_id: string; _user_id: string }
        Returns: boolean
      }
      log_user_activity: {
        Args: {
          p_activity_category: string
          p_activity_type: string
          p_description: string
          p_ip_address?: string
          p_metadata?: Json
          p_user_agent?: string
          p_user_id: string
        }
        Returns: string
      }
      prepare_account_deletion: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      validate_promo_code: {
        Args: { cart_total_param: number; code_param: string }
        Returns: {
          discount_amount: number
          is_valid: boolean
          message: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "seller" | "buyer"
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
      app_role: ["admin", "seller", "buyer"],
    },
  },
} as const
