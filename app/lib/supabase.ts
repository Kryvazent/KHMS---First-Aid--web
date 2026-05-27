import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      alert: {
        Row: {
          id: number;
          created_at: string;
          title: string;
          alert: string;
          alert_type_id: number;
          audience_id: number;
          send: boolean;
          added_by: number;
          url: string | null;
          district_id: number | null;
        };
        Insert: Omit<Database["public"]["Tables"]["alert"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["alert"]["Insert"]>;
      };
      alert_type: {
        Row: {
          id: number;
          created_at: string;
          type: string;
          color: string | null;
          icon: string | null;
        };
      };
      alert_draft: {
        Row: { id: number; created_at: string; alert_id: number };
      };
      alert_schedule: {
        Row: { id: number; created_at: string; alert_id: number; send_at: string };
      };
      audience: {
        Row: { id: number; created_at: string; audience: string };
      };
      district: {
        Row: {
          id: number;
          created_at: string;
          name: string;
          province: string;
          latitude: number;
          longitude: number;
          radius_km: number;
        };
      };
      emergency: {
        Row: {
          id: number;
          created_at: string;
          icon: string;
          name: string;
          severity_level_id: number;
          color: string | null;
          warning: string | null;
          subtitle: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["emergency"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["emergency"]["Insert"]>;
      };
      severity_level: {
        Row: { id: number; created_at: string; level: string };
      };
      step: {
        Row: {
          id: number;
          created_at: string;
          step_id: number;
          title: string;
          instruction: string;
          image_url: string | null;
          video_url: string | null;
          emergency_id: number;
          icon: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["step"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["step"]["Insert"]>;
      };
      user: {
        Row: { id: number; created_at: string; name: string; username: string; password: string };
      };
      log: {
        Row: { id: number; created_at: string; action: string; performed_by: number };
      };
    };
  };
};