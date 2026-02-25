-- ============================================
-- CAREGIVER VIEW LOGS - Registro de visualizaciones
-- Para notificar al paciente cuando su cuidador revisa sus datos
-- ============================================

-- Tabla para registrar cuando un cuidador ve los datos del paciente
CREATE TABLE IF NOT EXISTS public.caregiver_view_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  caregiver_id UUID NOT NULL REFERENCES public.caregiver_relationships(id) ON DELETE CASCADE,
  caregiver_name TEXT NOT NULL,
  caregiver_relationship TEXT NOT NULL,
  
  -- Qué vio el cuidador
  viewed_medications BOOLEAN DEFAULT FALSE,
  viewed_doses BOOLEAN DEFAULT FALSE,
  viewed_history BOOLEAN DEFAULT FALSE,
  viewed_reports BOOLEAN DEFAULT FALSE,
  
  -- Datos de la vista
  viewed_at TIMESTAMPTZ DEFAULT NOW(),
  session_duration_seconds INTEGER, -- Cuánto tiempo estuvo viendo
  
  -- Notificación al paciente
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMPTZ,
  notification_read_by_patient BOOLEAN DEFAULT FALSE,
  notification_read_at TIMESTAMPTZ,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  device_type TEXT -- 'mobile', 'tablet', 'desktop'
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_caregiver_view_logs_patient ON public.caregiver_view_logs(patient_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_view_logs_caregiver ON public.caregiver_view_logs(caregiver_id);
CREATE INDEX IF NOT EXISTS idx_caregiver_view_logs_viewed_at ON public.caregiver_view_logs(viewed_at DESC);
CREATE INDEX IF NOT EXISTS idx_caregiver_view_logs_unread ON public.caregiver_view_logs(patient_id, notification_read_by_patient) WHERE notification_read_by_patient = FALSE;

-- Habilitar RLS
ALTER TABLE public.caregiver_view_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS

-- Los pacientes pueden ver los logs de sus cuidadores
CREATE POLICY "Patients can view their caregiver view logs"
  ON public.caregiver_view_logs FOR SELECT
  USING (auth.uid() = patient_id);

-- Los cuidadores pueden insertar logs cuando ven datos
CREATE POLICY "Caregivers can insert view logs"
  ON public.caregiver_view_logs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.caregiver_relationships cr
      WHERE cr.id = caregiver_id
      AND cr.patient_id = patient_id
      AND cr.status = 'active'
      AND (cr.caregiver_user_id = auth.uid() OR cr.caregiver_email IN (SELECT email FROM public.users WHERE id = auth.uid()))
    )
  );

-- Los pacientes pueden marcar notificaciones como leídas
CREATE POLICY "Patients can update their view logs"
  ON public.caregiver_view_logs FOR UPDATE
  USING (auth.uid() = patient_id);

-- ============================================
-- FUNCIÓN PARA REGISTRAR VISTA DEL CUIDADOR
-- ============================================

CREATE OR REPLACE FUNCTION log_caregiver_view(
  p_patient_id UUID,
  p_viewed_medications BOOLEAN DEFAULT FALSE,
  p_viewed_doses BOOLEAN DEFAULT FALSE,
  p_viewed_history BOOLEAN DEFAULT FALSE,
  p_device_type TEXT DEFAULT 'unknown'
)
RETURNS UUID AS $$
DECLARE
  v_caregiver_id UUID;
  v_caregiver_name TEXT;
  v_caregiver_relationship TEXT;
  v_log_id UUID;
BEGIN
  -- Obtener datos del cuidador
  SELECT cr.id, cr.caregiver_name, cr.relationship
  INTO v_caregiver_id, v_caregiver_name, v_caregiver_relationship
  FROM public.caregiver_relationships cr
  WHERE cr.patient_id = p_patient_id
  AND cr.status = 'active'
  AND (cr.caregiver_user_id = auth.uid() OR cr.caregiver_email IN (SELECT email FROM public.users WHERE id = auth.uid()))
  LIMIT 1;
  
  IF v_caregiver_id IS NULL THEN
    RAISE EXCEPTION 'Not authorized as caregiver for this patient';
  END IF;
  
  -- Insertar el log
  INSERT INTO public.caregiver_view_logs (
    patient_id,
    caregiver_id,
    caregiver_name,
    caregiver_relationship,
    viewed_medications,
    viewed_doses,
    viewed_history,
    device_type
  )
  VALUES (
    p_patient_id,
    v_caregiver_id,
    v_caregiver_name,
    v_caregiver_relationship,
    p_viewed_medications,
    p_viewed_doses,
    p_viewed_history,
    p_device_type
  )
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA OBTENER NOTIFICACIONES DEL PACIENTE
-- ============================================

CREATE OR REPLACE FUNCTION get_patient_notifications(
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  id UUID,
  caregiver_name TEXT,
  caregiver_relationship TEXT,
  viewed_medications BOOLEAN,
  viewed_doses BOOLEAN,
  viewed_history BOOLEAN,
  viewed_at TIMESTAMPTZ,
  notification_read BOOLEAN,
  time_ago TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cvl.id,
    cvl.caregiver_name,
    cvl.caregiver_relationship,
    cvl.viewed_medications,
    cvl.viewed_doses,
    cvl.viewed_history,
    cvl.viewed_at,
    cvl.notification_read_by_patient,
    CASE
      WHEN cvl.viewed_at > NOW() - INTERVAL '1 minute' THEN 'hace unos segundos'
      WHEN cvl.viewed_at > NOW() - INTERVAL '1 hour' THEN 'hace ' || EXTRACT(MINUTE FROM (NOW() - cvl.viewed_at))::INTEGER || ' minutos'
      WHEN cvl.viewed_at > NOW() - INTERVAL '24 hours' THEN 'hace ' || EXTRACT(HOUR FROM (NOW() - cvl.viewed_at))::INTEGER || ' horas'
      WHEN cvl.viewed_at > NOW() - INTERVAL '7 days' THEN 'hace ' || EXTRACT(DAY FROM (NOW() - cvl.viewed_at))::INTEGER || ' días'
      ELSE TO_CHAR(cvl.viewed_at, 'DD/MM/YYYY')
    END as time_ago
  FROM public.caregiver_view_logs cvl
  WHERE cvl.patient_id = auth.uid()
  ORDER BY cvl.viewed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA MARCAR NOTIFICACIÓN COMO LEÍDA
-- ============================================

CREATE OR REPLACE FUNCTION mark_notification_read(
  p_log_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE public.caregiver_view_logs
  SET 
    notification_read_by_patient = TRUE,
    notification_read_at = NOW()
  WHERE id = p_log_id
  AND patient_id = auth.uid();
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA CONTAR NOTIFICACIONES NO LEÍDAS
-- ============================================

CREATE OR REPLACE FUNCTION get_unread_notifications_count()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM public.caregiver_view_logs
  WHERE patient_id = auth.uid()
  AND notification_read_by_patient = FALSE
  AND viewed_at > NOW() - INTERVAL '7 days'; -- Solo últimas 24 horas
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER PARA NOTIFICACIONES EN TIEMPO REAL
-- ============================================

-- Habilitar realtime para la tabla (opcional, requiere configuración en Supabase)
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.caregiver_view_logs;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON public.caregiver_view_logs TO authenticated;
GRANT EXECUTE ON FUNCTION log_caregiver_view(UUID, BOOLEAN, BOOLEAN, BOOLEAN, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_patient_notifications(INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notifications_count() TO authenticated;

-- ============================================
-- DATOS DE EJEMPLO (opcional, para testing)
-- ============================================

-- Insertar un log de ejemplo después de que existan relaciones cuidador-paciente
-- INSERT INTO public.caregiver_view_logs (patient_id, caregiver_id, caregiver_name, caregiver_relationship, viewed_medications, viewed_doses)
-- VALUES ('patient-uuid', 'caregiver-uuid', 'Carlos García', 'hijo', TRUE, TRUE);
