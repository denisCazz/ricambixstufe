export type UserRole = "customer" | "dealer" | "admin";
export type DealerStatus = "pending" | "approved" | "rejected";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";
export type PaymentMethod = "paypal" | "bank_transfer" | "cod";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string | null;
          last_name: string | null;
          role: UserRole;
          company: string | null;
          vat_number: string | null;
          phone: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          province: string | null;
          postal_code: string | null;
          country: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: UserRole;
          company?: string | null;
          vat_number?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          country?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string | null;
          last_name?: string | null;
          role?: UserRole;
          company?: string | null;
          vat_number?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          province?: string | null;
          postal_code?: string | null;
          country?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      categories: {
        Row: {
          id: number;
          name_it: string;
          name_en: string | null;
          name_fr: string | null;
          name_es: string | null;
          slug: string;
          icon: string | null;
          sort_order: number;
          active: boolean;
        };
        Insert: {
          id?: number;
          name_it: string;
          name_en?: string | null;
          name_fr?: string | null;
          name_es?: string | null;
          slug: string;
          icon?: string | null;
          sort_order?: number;
          active?: boolean;
        };
        Update: {
          name_it?: string;
          name_en?: string | null;
          name_fr?: string | null;
          name_es?: string | null;
          slug?: string;
          icon?: string | null;
          sort_order?: number;
          active?: boolean;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: number;
          category_id: number;
          sku: string | null;
          ean13: string | null;
          name_it: string;
          name_en: string | null;
          name_fr: string | null;
          name_es: string | null;
          description_it: string | null;
          description_en: string | null;
          description_fr: string | null;
          description_es: string | null;
          description_short_it: string | null;
          description_short_en: string | null;
          description_short_fr: string | null;
          description_short_es: string | null;
          slug: string;
          price: number;
          wholesale_price: number | null;
          weight: number | null;
          width: number | null;
          height: number | null;
          depth: number | null;
          stock_quantity: number;
          active: boolean;
          brand: string | null;
          meta_title: string | null;
          meta_description: string | null;
          meta_keywords: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          category_id: number;
          sku?: string | null;
          ean13?: string | null;
          name_it: string;
          name_en?: string | null;
          name_fr?: string | null;
          name_es?: string | null;
          description_it?: string | null;
          description_en?: string | null;
          description_fr?: string | null;
          description_es?: string | null;
          description_short_it?: string | null;
          description_short_en?: string | null;
          description_short_fr?: string | null;
          description_short_es?: string | null;
          slug: string;
          price: number;
          wholesale_price?: number | null;
          weight?: number | null;
          width?: number | null;
          height?: number | null;
          depth?: number | null;
          stock_quantity?: number;
          active?: boolean;
          brand?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: number;
          sku?: string | null;
          ean13?: string | null;
          name_it?: string;
          name_en?: string | null;
          name_fr?: string | null;
          name_es?: string | null;
          description_it?: string | null;
          description_en?: string | null;
          description_fr?: string | null;
          description_es?: string | null;
          description_short_it?: string | null;
          description_short_en?: string | null;
          description_short_fr?: string | null;
          description_short_es?: string | null;
          slug?: string;
          price?: number;
          wholesale_price?: number | null;
          weight?: number | null;
          width?: number | null;
          height?: number | null;
          depth?: number | null;
          stock_quantity?: number;
          active?: boolean;
          brand?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          meta_keywords?: string | null;
          image_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      dealer_profiles: {
        Row: {
          id: string;
          company_name: string;
          vat_number: string;
          status: DealerStatus;
          discount_percent: number;
          rejection_reason: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          company_name: string;
          vat_number: string;
          status?: DealerStatus;
          discount_percent?: number;
          rejection_reason?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
          created_at?: string;
        };
        Update: {
          company_name?: string;
          vat_number?: string;
          status?: DealerStatus;
          discount_percent?: number;
          rejection_reason?: string | null;
          approved_by?: string | null;
          approved_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "dealer_profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: number;
          user_id: string | null;
          guest_email: string | null;
          status: OrderStatus;
          payment_method: PaymentMethod | null;
          payment_status: string;
          subtotal: number;
          shipping_cost: number;
          tax_amount: number;
          total: number;
          shipping_address: Record<string, unknown>;
          billing_address: Record<string, unknown>;
          tracking_number: string | null;
          notes: string | null;
          danea_exported: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id?: string | null;
          guest_email?: string | null;
          status?: OrderStatus;
          payment_method?: PaymentMethod | null;
          payment_status?: string;
          subtotal: number;
          shipping_cost?: number;
          tax_amount?: number;
          total: number;
          shipping_address: Record<string, unknown>;
          billing_address: Record<string, unknown>;
          tracking_number?: string | null;
          notes?: string | null;
          danea_exported?: boolean;
        };
        Update: {
          status?: OrderStatus;
          payment_method?: PaymentMethod | null;
          payment_status?: string;
          subtotal?: number;
          shipping_cost?: number;
          tax_amount?: number;
          total?: number;
          shipping_address?: Record<string, unknown>;
          billing_address?: Record<string, unknown>;
          tracking_number?: string | null;
          notes?: string | null;
          danea_exported?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      order_items: {
        Row: {
          id: number;
          order_id: number;
          product_id: number;
          product_name: string;
          product_sku: string | null;
          quantity: number;
          unit_price: number;
          discount_percent: number;
          line_total: number;
        };
        Insert: {
          order_id: number;
          product_id: number;
          product_name: string;
          product_sku?: string | null;
          quantity: number;
          unit_price: number;
          discount_percent?: number;
          line_total: number;
        };
        Update: {
          quantity?: number;
          unit_price?: number;
          discount_percent?: number;
          line_total?: number;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      cart_items: {
        Row: {
          id: number;
          user_id: string;
          product_id: number;
          quantity: number;
          created_at: string;
        };
        Insert: {
          user_id: string;
          product_id: number;
          quantity?: number;
          created_at?: string;
        };
        Update: {
          quantity?: number;
        };
        Relationships: [
          {
            foreignKeyName: "cart_items_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "cart_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      dealer_status: DealerStatus;
      order_status: OrderStatus;
      payment_method: PaymentMethod;
    };
  };
}
