-- ============================================
-- VOICE NOTES SYSTEM
-- Notas de voz para el médico
-- ============================================

-- Tabla de notas de voz
CREATE TABLE IF NOT EXISTS public.voice_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  medication_id UUID REFERENCES public.medications(id) ON DELETE SET NULL,
  
  -- Audio (stored as base64 or URL)
  audio_url TEXT, -- URL del archivo de audio en storage
  audio_base64 TEXT, -- Alternativa: audio en base64
  duration_seconds INTEGER NOT NULL DEFAULT 10,
  
  -- Transcripción (opcional, generada por IA)
  transcription TEXT,
  
  -- Metadata
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  dose_time TEXT, -- Hora de la dosis relacionada
  dose_date DATE, -- Fecha de la dosis
  
  -- Estado
  is_shared BOOLEAN DEFAULT FALSE, -- Si ya se compartió con el médico
  shared_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_voice_notes_user_id ON public.voice_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_medication_id ON public.voice_notes(medication_id);
CREATE INDEX IF NOT EXISTS idx_voice_notes_date ON public.voice_notes(dose_date);
CREATE INDEX IF NOT EXISTS idx_voice_notes_recorded_at ON public.voice_notes(recorded_at DESC);

-- Habilitar RLS
ALTER TABLE public.voice_notes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS

-- Usuarios pueden ver sus propias notas
CREATE POLICY "Users can view own voice notes"
  ON public.voice_notes FOR SELECT
  USING (auth.uid() = user_id);

-- Usuarios pueden crear sus propias notas
CREATE POLICY "Users can create own voice notes"
  ON public.voice_notes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden actualizar sus propias notas
CREATE POLICY "Users can update own voice notes"
  ON public.voice_notes FOR UPDATE
  USING (auth.uid() = user_id);

-- Usuarios pueden eliminar sus propias notas
CREATE POLICY "Users can delete own voice notes"
  ON public.voice_notes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCIÓN PARA OBTENER NOTAS POR RANGO DE FECHAS
-- ============================================

CREATE OR REPLACE FUNCTION get_voice_notes_by_date_range(
  p_user_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  id UUID,
  medication_id UUID,
  medication_name TEXT,
  audio_url TEXT,
  audio_base64 TEXT,
  duration_seconds INTEGER,
  transcription TEXT,
  recorded_at TIMESTAMPTZ,
  dose_time TEXT,
  dose_date DATE,
  is_shared BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    vn.id,
    vn.medication_id,
    m.name as medication_name,
    vn.audio_url,
    vn.audio_base64,
    vn.duration_seconds,
    vn.transcription,
    vn.recorded_at,
    vn.dose_time,
    vn.dose_date,
    vn.is_shared
  FROM public.voice_notes vn
  LEFT JOIN public.medications m ON m.id = vn.medication_id
  WHERE vn.user_id = p_user_id
    AND vn.dose_date >= p_start_date
    AND vn.dose_date <= p_end_date
  ORDER BY vn.recorded_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN PARA TRANSCRIBIR NOTA (placeholder para IA)
-- ============================================

CREATE OR REPLACE FUNCTION transcribe_voice_note(
  p_voice_note_id UUID
)
RETURNS TEXT AS $$
DECLARE
  v_transcription TEXT;
BEGIN
  -- En producción, aquí se llamaría a un servicio de transcripción
  -- Por ahora, retornamos un placeholder
  UPDATE public.voice_notes
  SET transcription = 'Transcripción en proceso...'
  WHERE id = p_voice_note_id;
  
  RETURN 'Transcripción en proceso...';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON public.voice_notes TO authenticated;
GRANT EXECUTE ON FUNCTION get_voice_notes_by_date_range(UUID, DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION transcribe_voice_note(UUID) TO authenticated;
