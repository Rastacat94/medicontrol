-- ============================================
-- NOTIFICATIONS SYSTEM
-- Sistema de notificaciones para pacientes
-- ============================================

-- Tipos de notificación
CREATE TYPE notification_type AS ENUM (
  'caregiver_view',      -- Cuidador vio los datos
  'caregiver_alert',     -- Alerta de cuidador
  'medication_reminder', -- Recordatorio de medicamento
  'missed_dose',         -- Dosis olvidada
  'low_stock',           -- Stock bajo
  'system'               -- Sistema
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Tipo y contenido
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Datos adicionales (JSON para flexibilidad)
  data JSONB DEFAULT '{}',
  -- Ejemplo para caregiver_view:
  -- {
  --   "caregiver_name": "María García",
  --   "caregiver_relationship": "hija",
  --   "viewed_at": "2024-01-15T10:30:00Z",
  --   "sections_viewed": ["medications", "doses"]
  -- }
  
  -- Estado
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Para notificaciones que expiran
  expires_at TIMESTAMPTZ,
  
  -- Prioridad (para ordenar y mostrar)
  priority INTEGER DEFAULT 0, -- 0=normal, 1=alta, 2=urgente
  
  -- Para agrupar notificaciones similares
  group_id TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = FALSE;

-- Habilitar RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS

-- Usuarios pueden ver sus propias notificaciones
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden actualizar sus notificaciones (marcar como leídas)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Solo el sistema puede insertar notificaciones (via service role)
-- Pero permitimos insert para usuarios autenticados (se validará en la API)
CREATE POLICY "System can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Usuarios pueden eliminar sus notificaciones
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCIÓN PARA CREAR NOTIFICACIÓN DE VISTA DE CUIDADOR
-- ============================================

CREATE OR REPLACE FUNCTION create_caregiver_view_notification(
  p_patient_id UUID,
  p_caregiver_name TEXT,
  p_caregiver_relationship TEXT,
  p_sections_viewed TEXT[] DEFAULT ARRAY[]::TEXT[]
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
  relationship_display TEXT;
  title_text TEXT;
  message_text TEXT;
BEGIN
  -- Traducir relación a texto amigable
  relationship_display := CASE LOWER(p_caregiver_relationship)
    WHEN 'hijo' THEN 'tu hijo'
    WHEN 'hija' THEN 'tu hija'
    WHEN 'hijo/a' THEN 'tu hijo/a'
    WHEN 'conyuge' THEN 'tu cónyuge'
    WHEN 'esposo' THEN 'tu esposo'
    WHEN 'esposa' THEN 'tu esposa'
    WHEN 'medico' THEN 'tu médico'
    WHEN 'medica' THEN 'tu médica'
    WHEN 'enfermera' THEN 'tu enfermera'
    WHEN 'enfermero' THEN 'tu enfermero'
    WHEN 'hermano' THEN 'tu hermano'
    WHEN 'hermana' THEN 'tu hermana'
    WHEN 'nieto' THEN 'tu nieto'
    WHEN 'nieta' THEN 'tu nieta'
    WHEN 'padre' THEN 'tu padre'
    WHEN 'madre' THEN 'tu madre'
    WHEN 'amigo' THEN 'tu amigo'
    WHEN 'amiga' THEN 'tu amiga'
    WHEN 'cuidador' THEN 'tu cuidador'
    WHEN 'cuidadora' THEN 'tu cuidadora'
    ELSE 'tu familiar'
  END;
  
  -- Crear título y mensaje personalizado
  title_text := '👨‍👩‍👧 ' || COALESCE(p_caregiver_name, 'Tu cuidador') || ' revisó tus registros';
  message_text := COALESCE(p_caregiver_name, 'Tu cuidador') || ', ' || relationship_display || ', acaba de revisar tus medicamentos y registros del día. ¡Estás acompañado/a!';
  
  -- Insertar notificación
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    message,
    data,
    priority
  ) VALUES (
    p_patient_id,
    'caregiver_view',
    title_text,
    message_text,
    jsonb_build_object(
      'caregiver_name', p_caregiver_name,
      'caregiver_relationship', p_caregiver_relationship,
      'viewed_at', NOW(),
      'sections_viewed', p_sections_viewed
    ),
    1 -- Alta prioridad para que aparezca primero
  )
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA OBTENER NOTIFICACIONES NO LEÍDAS
-- ============================================

CREATE OR REPLACE FUNCTION get_unread_notifications(
  p_user_id UUID,
  p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  type TEXT,
  title TEXT,
  message TEXT,
  data JSONB,
  priority INTEGER,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.type,
    n.title,
    n.message,
    n.data,
    n.priority,
    n.created_at
  FROM public.notifications n
  WHERE n.user_id = p_user_id
    AND n.is_read = FALSE
    AND (n.expires_at IS NULL OR n.expires_at > NOW())
  ORDER BY n.priority DESC, n.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA MARCAR NOTIFICACIÓN COMO LEÍDA
-- ============================================

CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  updated BOOLEAN;
BEGIN
  UPDATE public.notifications
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE id = p_notification_id 
    AND user_id = p_user_id
    AND is_read = FALSE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA MARCAR TODAS COMO LEÍDAS
-- ============================================

CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  count_updated INTEGER;
BEGIN
  UPDATE public.notifications
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE user_id = p_user_id
    AND is_read = FALSE;
  
  GET DIAGNOSTICS count_updated = ROW_COUNT;
  
  RETURN count_updated;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA CONTAR NOTIFICACIONES NO LEÍDAS
-- ============================================

CREATE OR REPLACE FUNCTION count_unread_notifications(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  unread_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO unread_count
  FROM public.notifications
  WHERE user_id = p_user_id
    AND is_read = FALSE
    AND (expires_at IS NULL OR expires_at > NOW());
  
  RETURN unread_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA LIMPIAR NOTIFICACIONES ANTIGUAS
-- ============================================

CREATE OR REPLACE FUNCTION cleanup_old_notifications(
  p_days_old INTEGER DEFAULT 30
)
RETURNS INTEGER AS $$
DECLARE
  count_deleted INTEGER;
BEGIN
  DELETE FROM public.notifications
  WHERE is_read = TRUE
    AND created_at < NOW() - (p_days_old || ' days')::INTERVAL;
  
  GET DIAGNOSTICS count_deleted = ROW_COUNT;
  
  RETURN count_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON public.notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_caregiver_view_notification(UUID, TEXT, TEXT, TEXT[]) TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_notifications(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION count_unread_notifications(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_notifications(INTEGER) TO authenticated;

-- ============================================
-- TRIGGER PARA LIMPIAR NOTIFICACIONES ANTIGUAS
-- Se ejecuta automáticamente al insertar nuevas
-- ============================================

-- Nota: En producción, esto debería ser un job programado
-- Aquí lo dejamos como referencia

-- CREATE OR REPLACE FUNCTION auto_cleanup_notifications()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- Limpiar notificaciones leídas de más de 30 días
--   PERFORM cleanup_old_notifications(30);
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;

-- CREATE TRIGGER trigger_cleanup_notifications
--   AFTER INSERT ON public.notifications
--   FOR EACH STATEMENT
--   EXECUTE FUNCTION auto_cleanup_notifications();
