import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/caregiver/patient/[patientId]
// Obtiene datos del paciente para el cuidador y notifica al paciente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  const { patientId } = await params;
  
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured' },
      { status: 200 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verificar que el usuario es cuidador activo de este paciente
    const { data: relationship, error: relError } = await supabase
      .from('caregiver_relationships')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .or(`caregiver_user_id.eq.${user.id},caregiver_email.eq.${user.email}`)
      .single();

    if (relError || !relationship) {
      return NextResponse.json(
        { error: 'Not authorized to view this patient' },
        { status: 403 }
      );
    }

    // Obtener datos según permisos
    const response: {
      patient: {
        id: string;
        name: string;
        email: string;
        phone?: string;
      } | null;
      medications?: unknown[];
      doseRecords?: unknown[];
      todaySummary?: {
        total: number;
        taken: number;
        pending: number;
        skipped: number;
      };
    } = {
      patient: null,
    };

    // Datos básicos del paciente
    const { data: patient } = await supabase
      .from('users')
      .select('id, name, email, phone')
      .eq('id', patientId)
      .single();

    response.patient = patient;

    // Obtener nombre del cuidador desde su perfil
    const { data: caregiverProfile } = await supabase
      .from('users')
      .select('name')
      .eq('id', user.id)
      .single();

    const caregiverName = caregiverProfile?.name || relationship.caregiver_name || 'Tu cuidador';
    const caregiverRelationship = relationship.relationship || 'familiar';

    // Determinar qué secciones se van a ver
    const sectionsViewed: string[] = [];
    
    // Medicamentos (si tiene permiso)
    if (relationship.can_view_medications) {
      sectionsViewed.push('medications');
      const { data: medications } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', patientId)
        .eq('status', 'active');
      
      response.medications = medications || [];
    }

    // Historial de dosis (si tiene permiso)
    if (relationship.can_view_doses) {
      sectionsViewed.push('doses');
      const today = new Date().toISOString().split('T')[0];
      
      const { data: doseRecords } = await supabase
        .from('dose_records')
        .select('*')
        .eq('user_id', patientId)
        .eq('date', today);
      
      response.doseRecords = doseRecords || [];

      // Resumen de hoy
      const records = doseRecords || [];
      response.todaySummary = {
        total: records.length,
        taken: records.filter(r => r.status === 'taken').length,
        pending: records.filter(r => r.status === 'pending').length,
        skipped: records.filter(r => r.status === 'skipped').length,
      };
    }

    // 📢 CREAR NOTIFICACIÓN PARA EL PACIENTE
    // Notificarle que su cuidador acaba de revisar sus datos
    try {
      // Crear mensaje personalizado según la relación
      const relationshipDisplay = getRelationshipDisplay(caregiverRelationship);
      const title = `👨‍👩‍👧 ${caregiverName} revisó tus registros`;
      const message = `${caregiverName}, ${relationshipDisplay}, acaba de revisar tus medicamentos y registros del día. ¡Estás acompañado/a! 💙`;

      await supabase
        .from('notifications')
        .insert({
          user_id: patientId,
          type: 'caregiver_view',
          title,
          message,
          data: {
            caregiver_name: caregiverName,
            caregiver_relationship: caregiverRelationship,
            caregiver_user_id: user.id,
            viewed_at: new Date().toISOString(),
            sections_viewed: sectionsViewed,
          },
          priority: 1,
        });
      
      console.log('[API] Notification created for patient:', patientId);
    } catch (notifError) {
      // No fallar la request si la notificación falla
      console.error('[API] Error creating notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      data: response,
      permissions: {
        canViewMedications: relationship.can_view_medications,
        canViewDoses: relationship.can_view_doses,
        canViewHistory: relationship.can_view_history,
        canReceiveAlerts: relationship.can_receive_alerts,
      },
    });

  } catch (error) {
    console.error('[API] Error getting patient data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Función auxiliar para obtener texto amigable de la relación
function getRelationshipDisplay(relationship: string): string {
  const relations: Record<string, string> = {
    'hijo': 'tu hijo',
    'hija': 'tu hija',
    'hijo/a': 'tu hijo/a',
    'conyuge': 'tu cónyuge',
    'esposo': 'tu esposo',
    'esposa': 'tu esposa',
    'medico': 'tu médico',
    'medica': 'tu médica',
    'enfermera': 'tu enfermera',
    'enfermero': 'tu enfermero',
    'hermano': 'tu hermano',
    'hermana': 'tu hermana',
    'nieto': 'tu nieto',
    'nieta': 'tu nieta',
    'padre': 'tu padre',
    'madre': 'tu madre',
    'amigo': 'tu amigo',
    'amiga': 'tu amiga',
    'cuidador': 'tu cuidador',
    'cuidadora': 'tu cuidadora',
    'otro': 'tu familiar',
  };
  
  return relations[relationship.toLowerCase()] || 'tu familiar';
}
