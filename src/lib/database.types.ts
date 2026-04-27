export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      approved_smm_items: {
        Row: {
          client_id: string;
          created_at: string;
          id: string;
          specialist_id: string;
          text: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          id?: string;
          specialist_id: string;
          text: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          id?: string;
          specialist_id?: string;
          text?: string;
        };
        Relationships: [
          {
            foreignKeyName: "approved_smm_items_specialist_id_fkey";
            columns: ["specialist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      controller_plan_tasks: {
        Row: {
          client_id: string;
          created_at: string;
          done: boolean;
          id: string;
          plan_id: string;
          specialist_id: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          done?: boolean;
          id?: string;
          plan_id: string;
          specialist_id: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          done?: boolean;
          id?: string;
          plan_id?: string;
          specialist_id?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "controller_plan_tasks_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "controller_plans";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "controller_plan_tasks_specialist_id_fkey";
            columns: ["specialist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      controller_plans: {
        Row: {
          client_id: string;
          created_at: string;
          id: string;
          specialist_id: string;
          updated_at: string;
          week_start: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          id?: string;
          specialist_id: string;
          updated_at?: string;
          week_start: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          id?: string;
          specialist_id?: string;
          updated_at?: string;
          week_start?: string;
        };
        Relationships: [
          {
            foreignKeyName: "controller_plans_specialist_id_fkey";
            columns: ["specialist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          first_name: string | null;
          id: string;
          last_name: string | null;
          role: "smm_specialist" | "manager";
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          first_name?: string | null;
          id: string;
          last_name?: string | null;
          role?: "smm_specialist" | "manager";
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          first_name?: string | null;
          id?: string;
          last_name?: string | null;
          role?: "smm_specialist" | "manager";
          updated_at?: string;
        };
        Relationships: [];
      };
      specialist_clients: {
        Row: {
          client_id: string;
          created_at: string;
          id: string;
          specialist_id: string;
        };
        Insert: {
          client_id: string;
          created_at?: string;
          id?: string;
          specialist_id: string;
        };
        Update: {
          client_id?: string;
          created_at?: string;
          id?: string;
          specialist_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "specialist_clients_specialist_id_fkey";
            columns: ["specialist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      work_reports: {
        Row: {
          client_name: string;
          created_at: string;
          date: string;
          end_time: string;
          id: string;
          notes: string;
          specialist_id: string;
          start_time: string;
          task: string;
          updated_at: string;
        };
        Insert: {
          client_name: string;
          created_at?: string;
          date: string;
          end_time: string;
          id?: string;
          notes?: string;
          specialist_id: string;
          start_time: string;
          task: string;
          updated_at?: string;
        };
        Update: {
          client_name?: string;
          created_at?: string;
          date?: string;
          end_time?: string;
          id?: string;
          notes?: string;
          specialist_id?: string;
          start_time?: string;
          task?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "work_reports_specialist_id_fkey";
            columns: ["specialist_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: "smm_specialist" | "manager";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};