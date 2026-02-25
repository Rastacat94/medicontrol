// Database types for Supabase
// These types map to the tables defined in /supabase/schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Users table
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          phone: string | null;
          avatar: string | null;
          is_premium: boolean;
          premium_expires_at: string | null;
          sms_credits: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          phone?: string | null;
          avatar?: string | null;
          is_premium?: boolean;
          premium_expires_at?: string | null;
          sms_credits?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          phone?: string | null;
          avatar?: string | null;
          is_premium?: boolean;
          premium_expires_at?: string | null;
          sms_credits?: number;
          updated_at?: string;
        };
      };
      // User profiles (extended info)
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          age: number | null;
          allergies: string[] | null;
          conditions: string[] | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          emergency_contact_relationship: string | null;
          primary_doctor_name: string | null;
          primary_doctor_phone: string | null;
          primary_doctor_specialty: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          age?: number | null;
          allergies?: string[] | null;
          conditions?: string[] | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relationship?: string | null;
          primary_doctor_name?: string | null;
          primary_doctor_phone?: string | null;
          primary_doctor_specialty?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          age?: number | null;
          allergies?: string[] | null;
          conditions?: string[] | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          emergency_contact_relationship?: string | null;
          primary_doctor_name?: string | null;
          primary_doctor_phone?: string | null;
          primary_doctor_specialty?: string | null;
          updated_at?: string;
        };
      };
      // Medications table
      medications: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          generic_name: string | null;
          dose: number;
          dose_unit: string;
          frequency_type: string;
          frequency_value: number;
          schedules: string[];
          instructions: string[];
          notes: string | null;
          start_date: string;
          end_date: string | null;
          status: string;
          prescribed_by: string | null;
          color: string;
          stock: number | null;
          stock_unit: string | null;
          low_stock_threshold: number | null;
          last_stock_update: string | null;
          is_critical: boolean;
          critical_alert_delay: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          generic_name?: string | null;
          dose: number;
          dose_unit: string;
          frequency_type: string;
          frequency_value: number;
          schedules: string[];
          instructions?: string[];
          notes?: string | null;
          start_date: string;
          end_date?: string | null;
          status?: string;
          prescribed_by?: string | null;
          color?: string;
          stock?: number | null;
          stock_unit?: string | null;
          low_stock_threshold?: number | null;
          last_stock_update?: string | null;
          is_critical?: boolean;
          critical_alert_delay?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          generic_name?: string | null;
          dose?: number;
          dose_unit?: string;
          frequency_type?: string;
          frequency_value?: number;
          schedules?: string[];
          instructions?: string[];
          notes?: string | null;
          start_date?: string;
          end_date?: string | null;
          status?: string;
          prescribed_by?: string | null;
          color?: string;
          stock?: number | null;
          stock_unit?: string | null;
          low_stock_threshold?: number | null;
          last_stock_update?: string | null;
          is_critical?: boolean;
          critical_alert_delay?: number;
          updated_at?: string;
        };
      };
      // Dose records table
      dose_records: {
        Row: {
          id: string;
          user_id: string;
          medication_id: string;
          scheduled_time: string;
          actual_time: string | null;
          date: string;
          status: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_id: string;
          scheduled_time: string;
          actual_time?: string | null;
          date: string;
          status: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          medication_id?: string;
          scheduled_time?: string;
          actual_time?: string | null;
          date?: string;
          status?: string;
          notes?: string | null;
        };
      };
      // Side effects table
      side_effects: {
        Row: {
          id: string;
          user_id: string;
          medication_id: string;
          date: string;
          symptoms: string;
          severity: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          medication_id: string;
          date: string;
          symptoms: string;
          severity: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          medication_id?: string;
          date?: string;
          symptoms?: string;
          severity?: string;
          notes?: string | null;
        };
      };
      // Caregivers table
      caregivers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          relationship: string;
          receive_alerts: boolean;
          receive_missed_dose: boolean;
          receive_panic_button: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          relationship: string;
          receive_alerts?: boolean;
          receive_missed_dose?: boolean;
          receive_panic_button?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          relationship?: string;
          receive_alerts?: boolean;
          receive_missed_dose?: boolean;
          receive_panic_button?: boolean;
        };
      };
      // Caregiver alerts configuration
      caregiver_alerts: {
        Row: {
          id: string;
          user_id: string;
          caregiver_id: string;
          medication_id: string | null;
          alert_type: string;
          delay_minutes: number;
          enabled: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          caregiver_id: string;
          medication_id?: string | null;
          alert_type: string;
          delay_minutes: number;
          enabled?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          caregiver_id?: string;
          medication_id?: string | null;
          alert_type?: string;
          delay_minutes?: number;
          enabled?: boolean;
        };
      };
      // SMS credits / subscriptions
      sms_transactions: {
        Row: {
          id: string;
          user_id: string;
          credits: number;
          transaction_type: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          credits: number;
          transaction_type: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          credits?: number;
          transaction_type?: string;
          description?: string | null;
        };
      };
      // Sync metadata for offline support
      sync_metadata: {
        Row: {
          id: string;
          user_id: string;
          table_name: string;
          record_id: string;
          operation: string;
          synced_at: string;
          local_updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          table_name: string;
          record_id: string;
          operation: string;
          synced_at?: string;
          local_updated_at: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          table_name?: string;
          record_id?: string;
          operation?: string;
          synced_at?: string;
          local_updated_at?: string;
        };
      };
      // Caregiver view logs - Notificaciones de lectura
      caregiver_view_logs: {
        Row: {
          id: string;
          patient_id: string;
          caregiver_id: string;
          caregiver_name: string;
          caregiver_relationship: string;
          viewed_medications: boolean;
          viewed_doses: boolean;
          viewed_history: boolean;
          viewed_reports: boolean;
          viewed_at: string;
          session_duration_seconds: number | null;
          notification_sent: boolean;
          notification_sent_at: string | null;
          notification_read_by_patient: boolean;
          notification_read_at: string | null;
          ip_address: string | null;
          user_agent: string | null;
          device_type: string | null;
        };
        Insert: {
          id?: string;
          patient_id: string;
          caregiver_id: string;
          caregiver_name: string;
          caregiver_relationship: string;
          viewed_medications?: boolean;
          viewed_doses?: boolean;
          viewed_history?: boolean;
          viewed_reports?: boolean;
          viewed_at?: string;
          session_duration_seconds?: number | null;
          notification_sent?: boolean;
          notification_sent_at?: string | null;
          notification_read_by_patient?: boolean;
          notification_read_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          device_type?: string | null;
        };
        Update: {
          id?: string;
          patient_id?: string;
          caregiver_id?: string;
          caregiver_name?: string;
          caregiver_relationship?: string;
          viewed_medications?: boolean;
          viewed_doses?: boolean;
          viewed_history?: boolean;
          viewed_reports?: boolean;
          viewed_at?: string;
          session_duration_seconds?: number | null;
          notification_sent?: boolean;
          notification_sent_at?: string | null;
          notification_read_by_patient?: boolean;
          notification_read_at?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          device_type?: string | null;
        };
      };
      // Caregiver relationships (extended)
      caregiver_relationships: {
        Row: {
          id: string;
          patient_id: string;
          caregiver_user_id: string | null;
          caregiver_name: string;
          caregiver_email: string;
          caregiver_phone: string;
          relationship: string;
          can_view_medications: boolean;
          can_view_doses: boolean;
          can_view_history: boolean;
          can_view_reports: boolean;
          can_receive_alerts: boolean;
          can_receive_missed_dose: boolean;
          can_receive_panic_button: boolean;
          status: string;
          invited_at: string;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          caregiver_user_id?: string | null;
          caregiver_name: string;
          caregiver_email: string;
          caregiver_phone: string;
          relationship: string;
          can_view_medications?: boolean;
          can_view_doses?: boolean;
          can_view_history?: boolean;
          can_view_reports?: boolean;
          can_receive_alerts?: boolean;
          can_receive_missed_dose?: boolean;
          can_receive_panic_button?: boolean;
          status?: string;
          invited_at?: string;
          accepted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          caregiver_user_id?: string | null;
          caregiver_name?: string;
          caregiver_email?: string;
          caregiver_phone?: string;
          relationship?: string;
          can_view_medications?: boolean;
          can_view_doses?: boolean;
          can_view_history?: boolean;
          can_view_reports?: boolean;
          can_receive_alerts?: boolean;
          can_receive_missed_dose?: boolean;
          can_receive_panic_button?: boolean;
          status?: string;
          invited_at?: string;
          accepted_at?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      dose_unit: 'mg' | 'ml' | 'pastillas' | 'gotas' | 'capsulas' | 'g' | 'unidades';
      frequency_type: 'horas' | 'veces_dia' | 'dias_semana' | 'especifico';
      instruction_type: 
        | 'con_comida' 
        | 'en_ayunas' 
        | 'antes_comer' 
        | 'despues_comer' 
        | 'con_agua' 
        | 'evitar_alcohol'
        | 'evitar_lacteos'
        | 'evitar_toronja'
        | 'ninguna';
      medication_status: 'active' | 'inactive' | 'suspended';
      dose_status: 'pending' | 'taken' | 'skipped' | 'postponed';
      interaction_severity: 'leve' | 'moderada' | 'grave';
      side_effect_severity: 'leve' | 'moderada' | 'grave';
      alert_type: 'missed_dose' | 'low_stock' | 'panic_button';
      transaction_type: 'purchase' | 'usage' | 'welcome' | 'premium';
    };
  };
}

// Convenience type exports
export type UserRow = Database['public']['Tables']['users']['Row'];
export type UserProfileRow = Database['public']['Tables']['user_profiles']['Row'];
export type MedicationRow = Database['public']['Tables']['medications']['Row'];
export type DoseRecordRow = Database['public']['Tables']['dose_records']['Row'];
export type SideEffectRow = Database['public']['Tables']['side_effects']['Row'];
export type CaregiverRow = Database['public']['Tables']['caregivers']['Row'];
export type CaregiverAlertRow = Database['public']['Tables']['caregiver_alerts']['Row'];
export type SmsTransactionRow = Database['public']['Tables']['sms_transactions']['Row'];
export type SyncMetadataRow = Database['public']['Tables']['sync_metadata']['Row'];
export type CaregiverViewLogRow = Database['public']['Tables']['caregiver_view_logs']['Row'];
export type CaregiverRelationshipRow = Database['public']['Tables']['caregiver_relationships']['Row'];

// Tipos para notificaciones de lectura (frontend)
export interface CaregiverViewNotification {
  id: string;
  caregiverName: string;
  caregiverRelationship: string;
  viewedMedications: boolean;
  viewedDoses: boolean;
  viewedHistory: boolean;
  viewedAt: string;
  notificationRead: boolean;
  timeAgo: string;
}

export interface NotificationState {
  notifications: CaregiverViewNotification[];
  unreadCount: number;
  isLoading: boolean;
  lastChecked: Date | null;
}
