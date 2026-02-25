-- ============================================
-- CAREGIVER ACCESS POLICIES
-- Permite que cuidadores vean datos de sus pacientes
-- ============================================

-- Crear tabla de relaciones cuidador-paciente
CREATE TABLE IF NOT EXISTS public.caregiver_relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  caregiver_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE, -- Si el cuidador también tiene cuenta
  caregiver_name TEXT NOT NULL,
  caregiver_email TEXT NOT NULL,
  caregiver_phone TEXT NOT NULL,
  relationship TEXT NOT NULL, -- 'hijo', 'conyuge', 'medico', 'enfermera', 'otro'
  
  -- Permisos granulares
  can_view_medications BOOLEAN DEFAULT TRUE,
  can_view_doses BOOLEAN DEFAULT TRUE,
  can_view_history BOOLEAN DEFAULT TRUE,
  can_view_reports BOOLEAN DEFAULT FALSE,
  can_receive_alerts BOOLEAN DEFAULT TRUE,
  can_receive_missed_dose BOOLEAN DEFAULT TRUE,
  can_receive_panic_button BOOLEAN DEFAULT TRUE,
  
  -- Estado de la relación
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'suspended', 'rejected'
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(patient_id, caregiver_email)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_caregiver_relationships_patient ON public.caregiver_relationships(patient_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_relationships_caregiver_user ON public.caregiver_relationships(caregiver_user_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_relationships_email ON public.caregiver_relationships(caregiver_email);
CREATE INDEX IF NOT EXISTS idx_caregiver_relationships_status ON public.caregiver_relationships(status);

-- Habilitar RLS
ALTER TABLE public.caregiver_relationships ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS PARA LA TABLA caregiver_relationships
-- ============================================

-- Los pacientes pueden ver sus propias relaciones
CREATE POLICY "Patients can view their caregiver relationships"
  ON public.caregiver_relationships FOR SELECT
  USING (auth.uid() = patient_id);

-- Los cuidadores pueden ver relaciones donde son cuidadores (por email o user_id)
CREATE POLICY "Caregivers can view their relationships"
  ON public.caregiver_relationships FOR SELECT
  USING (
    auth.uid() = caregiver_user_id 
    OR caregiver_email IN (SELECT email FROM public.users WHERE id = auth.uid())
  );

-- Los pacientes pueden crear relaciones (invitar cuidadores)
CREATE POLICY "Patients can create caregiver relationships"
  ON public.caregiver_relationships FOR INSERT
  WITH CHECK (auth.uid() = patient_id);

-- Los pacientes pueden actualizar sus relaciones
CREATE POLICY "Patients can update their caregiver relationships"
  ON public.caregiver_relationships FOR UPDATE
  USING (auth.uid() = patient_id);

-- Los pacientes pueden eliminar sus relaciones
CREATE POLICY "Patients can delete their caregiver relationships"
  ON public.caregiver_relationships FOR DELETE
  USING (auth.uid() = patient_id);

-- ============================================
-- POLÍTICAS DE ACCESO PARA CUIDADORES
-- Los cuidadores pueden ver datos del paciente
-- ============================================

-- Función auxiliar: verificar si el usuario es cuidador activo de un paciente
CREATE OR REPLACE FUNCTION is_active_caregiver(patient_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.caregiver_relationships
    WHERE 
      caregiver_relationships.patient_id = is_active_caregiver.patient_id
      AND status = 'active'
      AND (
        caregiver_user_id = auth.uid()
        OR caregiver_email IN (SELECT email FROM public.users WHERE id = auth.uid())
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- POLÍTICAS ADICIONALES PARA MEDICATIONS
-- Los cuidadores pueden ver medicamentos del paciente
-- ============================================

CREATE POLICY "Caregivers can view patient medications"
  ON public.medications FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_active_caregiver(user_id)
  );

-- ============================================
-- POLÍTICAS ADICIONALES PARA DOSE_RECORDS
-- Los cuidadores pueden ver historial de dosis
-- ============================================

CREATE POLICY "Caregivers can view patient dose records"
  ON public.dose_records FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_active_caregiver(user_id)
  );

-- ============================================
-- POLÍTICAS ADICIONALES PARA USER_PROFILES
-- Los cuidadores pueden ver perfil básico del paciente
-- ============================================

CREATE POLICY "Caregivers can view patient profile"
  ON public.user_profiles FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_active_caregiver(user_id)
  );

-- ============================================
-- POLÍTICAS ADICIONALES PARA USERS (datos básicos)
-- Los cuidadores pueden ver datos básicos del paciente
-- ============================================

CREATE POLICY "Caregivers can view patient basic data"
  ON public.users FOR SELECT
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.caregiver_relationships
      WHERE patient_id = users.id
      AND status = 'active'
      AND (
        caregiver_user_id = auth.uid()
        OR caregiver_email IN (SELECT email FROM public.users u WHERE u.id = auth.uid())
      )
    )
  );

-- ============================================
-- TRIGGER PARA ACTUALIZAR updated_at
-- ============================================

CREATE TRIGGER update_caregiver_relationships_updated_at
  BEFORE UPDATE ON public.caregiver_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCIÓN PARA ACEPTAR INVITACIÓN DE CUIDADOR
-- ============================================

CREATE OR REPLACE FUNCTION accept_caregiver_invitation(
  p_patient_id UUID,
  p_caregiver_email TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  relation_id UUID;
BEGIN
  -- Verificar que el usuario que llama es el cuidador correcto
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE id = auth.uid() AND email = p_caregiver_email
  ) THEN
    RAISE EXCEPTION 'User email does not match invitation';
  END IF;
  
  -- Actualizar la relación
  UPDATE public.caregiver_relationships
  SET 
    status = 'active',
    caregiver_user_id = auth.uid(),
    accepted_at = NOW()
  WHERE 
    patient_id = p_patient_id
    AND caregiver_email = p_caregiver_email
    AND status = 'pending'
  RETURNING id INTO relation_id;
  
  RETURN relation_id IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VISTA PARA CUIDADORES: RESUMEN DEL PACIENTE
-- ============================================

CREATE OR REPLACE VIEW caregiver_patient_summary AS
SELECT 
  u.id as patient_id,
  u.name as patient_name,
  u.email as patient_email,
  u.phone as patient_phone,
  u.is_premium,
  cr.relationship,
  cr.can_view_medications,
  cr.can_view_doses,
  cr.can_view_history,
  cr.can_receive_alerts,
  (
    SELECT COUNT(*) FROM public.medications m 
    WHERE m.user_id = u.id AND m.status = 'active'
  ) as active_medications,
  (
    SELECT COUNT(*) FROM public.dose_records dr 
    WHERE dr.user_id = u.id 
    AND dr.date = CURRENT_DATE 
    AND dr.status = 'pending'
  ) as pending_doses_today,
  (
    SELECT COUNT(*) FROM public.dose_records dr 
    WHERE dr.user_id = u.id 
    AND dr.date = CURRENT_DATE 
    AND dr.status = 'taken'
  ) as taken_doses_today
FROM public.users u
JOIN public.caregiver_relationships cr ON cr.patient_id = u.id
WHERE cr.status = 'active';

-- ============================================
-- FUNCIÓN PARA OBTENER PACIENTES DEL CUIDADOR
-- ============================================

CREATE OR REPLACE FUNCTION get_my_patients()
RETURNS TABLE (
  patient_id UUID,
  patient_name TEXT,
  patient_email TEXT,
  patient_phone TEXT,
  relationship TEXT,
  active_medications BIGINT,
  pending_doses_today BIGINT,
  taken_doses_today BIGINT,
  can_view_medications BOOLEAN,
  can_view_doses BOOLEAN,
  can_receive_alerts BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    cr.relationship,
    (
      SELECT COUNT(*) FROM public.medications m 
      WHERE m.user_id = u.id AND m.status = 'active'
    ),
    (
      SELECT COUNT(*) FROM public.dose_records dr 
      WHERE dr.user_id = u.id AND dr.date = CURRENT_DATE AND dr.status = 'pending'
    ),
    (
      SELECT COUNT(*) FROM public.dose_records dr 
      WHERE dr.user_id = u.id AND dr.date = CURRENT_DATE AND dr.status = 'taken'
    ),
    cr.can_view_medications,
    cr.can_view_doses,
    cr.can_receive_alerts
  FROM public.users u
  JOIN public.caregiver_relationships cr ON cr.patient_id = u.id
  WHERE cr.status = 'active'
  AND (
    cr.caregiver_user_id = auth.uid()
    OR cr.caregiver_email IN (SELECT email FROM public.users WHERE id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON public.caregiver_relationships TO authenticated;
GRANT EXECUTE ON FUNCTION is_active_caregiver(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_caregiver_invitation(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_patients() TO authenticated;
GRANT SELECT ON caregiver_patient_summary TO authenticated;
