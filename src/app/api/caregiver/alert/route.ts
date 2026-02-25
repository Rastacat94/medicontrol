import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

// POST /api/caregiver/alert
// Envía una alerta de ayuda al cuidador
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      caregiverId, 
      patientName,
      message,
      context,
      medicationName 
    } = body;

    if (!caregiverId) {
      return NextResponse.json(
        { error: 'Caregiver ID is required' },
        { status: 400 }
      );
    }

    // Crear notificación en la base de datos
    if (isSupabaseConfigured()) {
      const supabase = await createServerSupabaseClient();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      // Obtener información del cuidador
      const { data: caregiver } = await supabase
        .from('caregiver_relationships')
        .select('*')
        .eq('id', caregiverId)
        .single();

      if (!caregiver) {
        return NextResponse.json(
          { error: 'Caregiver not found' },
          { status: 404 }
        );
      }

      // Crear notificación para el cuidador
      const notificationTitle = `🆘 ${patientName || 'Tu paciente'} necesita ayuda`;
      const notificationMessage = message || 
        `${patientName} necesita ayuda con la configuración de su medicina${medicationName ? ` (${medicationName})` : ''}.`;

      // Insertar notificación
      await supabase
        .from('notifications')
        .insert({
          user_id: caregiver.caregiver_user_id || user.id, // El cuidador recibe la notificación
          type: 'caregiver_alert',
          title: notificationTitle,
          message: notificationMessage,
          priority: 2, // Alta prioridad
          data: {
            patient_id: user.id,
            patient_name: patientName,
            caregiver_id: caregiverId,
            context,
            medication_name: medicationName,
            created_from: 'difficulty_alert',
          },
        });

      // TODO: Enviar SMS/Push notification real
      // if (caregiver.caregiver_phone) {
      //   await sendSMS(caregiver.caregiver_phone, notificationMessage);
      // }
    }

    return NextResponse.json({
      success: true,
      message: 'Alert sent to caregiver',
    });

  } catch (error) {
    console.error('[API] Error sending caregiver alert:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
