-- MediControl Database Schema for Supabase
-- Run this in the Supabase SQL Editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE dose_unit AS ENUM (
  'mg', 'ml', 'pastillas', 'gotas', 'capsulas', 'g', 'unidades'
);

CREATE TYPE frequency_type AS ENUM (
  'horas', 'veces_dia', 'dias_semana', 'especifico'
);

CREATE TYPE instruction_type AS ENUM (
  'con_comida',
  'en_ayunas',
  'antes_comer',
  'despues_comer',
  'con_agua',
  'evitar_alcohol',
  'evitar_lacteos',
  'evitar_toronja',
  'ninguna'
);

CREATE TYPE medication_status AS ENUM (
  'active', 'inactive', 'suspended'
);

CREATE TYPE dose_status AS ENUM (
  'pending', 'taken', 'skipped', 'postponed'
);

CREATE TYPE interaction_severity AS ENUM (
  'leve', 'moderada', 'grave'
);

CREATE TYPE side_effect_severity AS ENUM (
  'leve', 'moderada', 'grave'
);

CREATE TYPE alert_type AS ENUM (
  'missed_dose', 'low_stock', 'panic_button'
);

CREATE TYPE transaction_type AS ENUM (
  'purchase', 'usage', 'welcome', 'premium'
);

-- ============================================
-- TABLES
-- ============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  premium_expires_at TIMESTAMPTZ,
  sms_credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles (extended health information)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  age INTEGER,
  allergies TEXT[],
  conditions TEXT[],
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relationship TEXT,
  primary_doctor_name TEXT,
  primary_doctor_phone TEXT,
  primary_doctor_specialty TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Medications table
CREATE TABLE IF NOT EXISTS public.medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  generic_name TEXT,
  dose DECIMAL(10, 2) NOT NULL,
  dose_unit TEXT NOT NULL,
  frequency_type TEXT NOT NULL,
  frequency_value INTEGER NOT NULL,
  schedules TEXT[] NOT NULL DEFAULT '{}',
  instructions TEXT[] DEFAULT '{}',
  notes TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT DEFAULT 'active',
  prescribed_by TEXT,
  color TEXT DEFAULT '#3b82f6',
  stock DECIMAL(10, 2) DEFAULT 0,
  stock_unit TEXT,
  low_stock_threshold INTEGER DEFAULT 5,
  last_stock_update TIMESTAMPTZ,
  is_critical BOOLEAN DEFAULT FALSE,
  critical_alert_delay INTEGER DEFAULT 60,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dose records table
CREATE TABLE IF NOT EXISTS public.dose_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  scheduled_time TEXT NOT NULL,
  actual_time TIMESTAMPTZ,
  date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(medication_id, date, scheduled_time)
);

-- Side effects table
CREATE TABLE IF NOT EXISTS public.side_effects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  symptoms TEXT NOT NULL,
  severity TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caregivers table
CREATE TABLE IF NOT EXISTS public.caregivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  receive_alerts BOOLEAN DEFAULT TRUE,
  receive_missed_dose BOOLEAN DEFAULT TRUE,
  receive_panic_button BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Caregiver alerts configuration
CREATE TABLE IF NOT EXISTS public.caregiver_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES public.caregivers(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES public.medications(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  delay_minutes INTEGER DEFAULT 60,
  enabled BOOLEAN DEFAULT TRUE
);

-- SMS credits / transactions
CREATE TABLE IF NOT EXISTS public.sms_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL,
  transaction_type TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync metadata for offline support
CREATE TABLE IF NOT EXISTS public.sync_metadata (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  operation TEXT NOT NULL,
  synced_at TIMESTAMPTZ DEFAULT NOW(),
  local_updated_at TIMESTAMPTZ NOT NULL
);

-- ============================================
-- INDEXES
-- ============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Medications indexes
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON public.medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_status ON public.medications(status);
CREATE INDEX IF NOT EXISTS idx_medications_start_date ON public.medications(start_date);

-- Dose records indexes
CREATE INDEX IF NOT EXISTS idx_dose_records_user_id ON public.dose_records(user_id);
CREATE INDEX IF NOT EXISTS idx_dose_records_medication_id ON public.dose_records(medication_id);
CREATE INDEX IF NOT EXISTS idx_dose_records_date ON public.dose_records(date);
CREATE INDEX IF NOT EXISTS idx_dose_records_status ON public.dose_records(status);
CREATE INDEX IF NOT EXISTS idx_dose_records_date_range ON public.dose_records(user_id, date);

-- Side effects indexes
CREATE INDEX IF NOT EXISTS idx_side_effects_user_id ON public.side_effects(user_id);
CREATE INDEX IF NOT EXISTS idx_side_effects_medication_id ON public.side_effects(medication_id);
CREATE INDEX IF NOT EXISTS idx_side_effects_date ON public.side_effects(date);

-- Caregivers indexes
CREATE INDEX IF NOT EXISTS idx_caregivers_user_id ON public.caregivers(user_id);

-- Caregiver alerts indexes
CREATE INDEX IF NOT EXISTS idx_caregiver_alerts_user_id ON public.caregiver_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_alerts_caregiver_id ON public.caregiver_alerts(caregiver_id);

-- SMS transactions indexes
CREATE INDEX IF NOT EXISTS idx_sms_transactions_user_id ON public.sms_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_sms_transactions_created_at ON public.sms_transactions(created_at);

-- Sync metadata indexes
CREATE INDEX IF NOT EXISTS idx_sync_metadata_user_id ON public.sync_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_metadata_table ON public.sync_metadata(table_name);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dose_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.side_effects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.caregiver_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sms_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_metadata ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- User profiles policies
CREATE POLICY "Users can view own profile"
  ON public.user_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON public.user_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Medications policies
CREATE POLICY "Users can view own medications"
  ON public.medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON public.medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON public.medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON public.medications FOR DELETE
  USING (auth.uid() = user_id);

-- Dose records policies
CREATE POLICY "Users can view own dose records"
  ON public.dose_records FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own dose records"
  ON public.dose_records FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own dose records"
  ON public.dose_records FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own dose records"
  ON public.dose_records FOR DELETE
  USING (auth.uid() = user_id);

-- Side effects policies
CREATE POLICY "Users can view own side effects"
  ON public.side_effects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own side effects"
  ON public.side_effects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own side effects"
  ON public.side_effects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own side effects"
  ON public.side_effects FOR DELETE
  USING (auth.uid() = user_id);

-- Caregivers policies
CREATE POLICY "Users can view own caregivers"
  ON public.caregivers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own caregivers"
  ON public.caregivers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own caregivers"
  ON public.caregivers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own caregivers"
  ON public.caregivers FOR DELETE
  USING (auth.uid() = user_id);

-- Caregiver alerts policies
CREATE POLICY "Users can view own caregiver alerts"
  ON public.caregiver_alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own caregiver alerts"
  ON public.caregiver_alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own caregiver alerts"
  ON public.caregiver_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own caregiver alerts"
  ON public.caregiver_alerts FOR DELETE
  USING (auth.uid() = user_id);

-- SMS transactions policies
CREATE POLICY "Users can view own SMS transactions"
  ON public.sms_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own SMS transactions"
  ON public.sms_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Sync metadata policies
CREATE POLICY "Users can view own sync metadata"
  ON public.sync_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sync metadata"
  ON public.sync_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sync metadata"
  ON public.sync_metadata FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON public.medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA / SEED
-- ============================================

-- This would be run after user registration via the application
-- No seed data is needed here as users will be created through Supabase Auth

-- ============================================
-- VIEWS (Optional - for common queries)
-- ============================================

-- View for daily dose summary
CREATE OR REPLACE VIEW daily_dose_summary AS
SELECT 
  user_id,
  date,
  COUNT(*) as total_doses,
  COUNT(*) FILTER (WHERE status = 'taken') as taken_doses,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_doses,
  COUNT(*) FILTER (WHERE status = 'skipped') as skipped_doses,
  COUNT(*) FILTER (WHERE status = 'postponed') as postponed_doses,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'taken')::numeric / 
    NULLIF(COUNT(*), 0) * 100, 
    0
  ) as compliance_rate
FROM public.dose_records
GROUP BY user_id, date;

-- View for medication compliance
CREATE OR REPLACE VIEW medication_compliance AS
SELECT 
  m.user_id,
  m.id as medication_id,
  m.name as medication_name,
  COUNT(dr.id) as total_doses,
  COUNT(dr.id) FILTER (WHERE dr.status = 'taken') as taken_doses,
  ROUND(
    COUNT(dr.id) FILTER (WHERE dr.status = 'taken')::numeric / 
    NULLIF(COUNT(dr.id), 0) * 100, 
    0
  ) as compliance_rate
FROM public.medications m
LEFT JOIN public.dose_records dr ON dr.medication_id = m.id
GROUP BY m.user_id, m.id, m.name;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

-- Grant permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant permissions to anon users (for public read if needed)
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
