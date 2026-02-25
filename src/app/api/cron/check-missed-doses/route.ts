import { NextRequest, NextResponse } from 'next/server';

// API Cron: Verifica dosis omitidas y envía alertas a cuidadores
// Se ejecuta cada 15 minutos vía Vercel Cron Jobs

export const maxDuration = 60; // 60 segundos máximo

interface Medication {
  id: string;
  userId: string;
  name: string;
  times: string[];
  critical: boolean;
  active: boolean;
}

interface DoseRecord {
  medicationId: string;
  date: string;
  time: string;
  status: 'taken' | 'skipped' | 'missed';
}

interface User {
  id: string;
  name: string;
  phone?: string;
  caregivers: Array<{
    id: string;
    name: string;
    phone: string;
    receiveMissedDose: boolean;
  }>;
}

// Simulación de verificación - En producción usar Supabase
const checkMissedDosesForUser = async (user: User, medications: Medication[]): Promise<void> => {
  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM
  const today = now.toISOString().split('T')[0];
  
  // Umbral: 30 minutos después de la hora programada
  const thresholdMinutes = 30;
  
  for (const med of medications) {
    if (!med.active || !med.critical) continue;
    
    for (const scheduledTime of med.times) {
      // Calcular si han pasado más de 30 minutos desde la hora programada
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const scheduledDate = new Date(now);
      scheduledDate.setHours(hours, minutes, 0, 0);
      
      const diffMinutes = (now.getTime() - scheduledDate.getTime()) / (1000 * 60);
      
      // Si está entre 30-90 minutos después de la hora programada
      if (diffMinutes >= thresholdMinutes && diffMinutes < 90) {
        // Verificar si ya se registró la dosis
        // En producción: query a Supabase
        const doseTaken = false; // Simular dosis no tomada
        
        if (!doseTaken) {
          // Verificar si ya se envió alerta recientemente
          const lastAlertKey = `alert_${user.id}_${med.id}_${today}_${scheduledTime}`;
          // En producción: verificar en tabla de alertas
          
          // Enviar alerta a cuidadores
          for (const caregiver of user.caregivers) {
            if (caregiver.receiveMissedDose && caregiver.phone) {
              await sendMissedDoseAlert(user, med, scheduledTime, caregiver);
            }
          }
        }
      }
    }
  }
};

const sendMissedDoseAlert = async (
  user: User,
  medication: Medication,
  time: string,
  caregiver: { name: string; phone: string }
): Promise<void> => {
  // En producción, usar Twilio
  const message = `🚨 ALERTA MediControl: ${user.name} NO ha tomado ${medication.name} a las ${time}. Por favor, contáctalo para verificar.`;
  
  console.log(`[ALERT] Sending SMS to ${caregiver.phone}: ${message}`);
  
  // Llamar a la API de Twilio
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/send-alert-sms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: caregiver.phone,
        message,
        type: 'missed_dose',
        userId: user.id,
        medicationId: medication.id
      })
    });
    
    if (!response.ok) {
      console.error('[ALERT] Failed to send SMS');
    }
  } catch (error) {
    console.error('[ALERT] Error sending SMS:', error);
  }
};

export async function GET(request: NextRequest) {
  // Verificar secreto del cron para seguridad
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  const startTime = Date.now();
  const results = {
    checked: 0,
    alertsSent: 0,
    errors: [] as string[]
  };
  
  try {
    // En producción: obtener todos los usuarios activos de Supabase
    // Por ahora, simulamos con localStorage data
    
    // Simulación de usuarios y medicamentos
    // En producción real:
    // const { data: users } = await supabase.from('users').select('*, caregivers(*), medications(*)');
    
    console.log('[CRON] Starting missed dose check...');
    
    // Simulación de la lógica
    // for (const user of users) {
    //   results.checked++;
    //   await checkMissedDosesForUser(user, user.medications);
    // }
    
    const duration = Date.now() - startTime;
    
    console.log(`[CRON] Completed in ${duration}ms. Checked: ${results.checked}, Alerts: ${results.alertsSent}`);
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results
    });
    
  } catch (error) {
    console.error('[CRON] Error in missed dose check:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// También soportar POST para Vercel Cron
export async function POST(request: NextRequest) {
  return GET(request);
}
