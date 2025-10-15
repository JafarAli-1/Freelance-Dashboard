// Minimal hand-written supabase types (replace with CLI-generated types for accuracy)
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: number;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          created_at: string;
        };
        Insert: {
          id?: number;
          user_id?: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          client_id: number | null;
          progress: number;
          due: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          name: string;
          client_id: number;
          progress?: number;
          due?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          invoice_number: string;
          client_id: number;
          project_id: string | null;
          amount: number;
          tax_rate: number;
          total_amount: number;
          status: string;
          issue_date: string;
          due_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          invoice_number: string;
          client_id: number;
          project_id?: string | null;
          amount?: number;
          tax_rate?: number;
          total_amount?: number;
          status?: string;
          issue_date?: string;
          due_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
  };
}
