import { NextRequest, NextResponse } from 'next/server';

// API Cron: Envía recordatorios antes de las dosis programadas
// Se ejecuta cada 5 minutos vía Vercel Cron Jobs

export const maxDuration = 60;

interface ScheduledDose {
  userId: string;
  userName: string;
  userPhone?: string;
  medicationId: string;
  medicationName: string;
  scheduledTime: string;
  dose: string;
}

export async function GET(request: NextRequest) {
  // Verificar secreto del cron
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  const startTime = Date.now();
  const results = {
    remindersQueued: 0,
    remindersSent: 0,
    errors: [] as string[]
  };
  
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM
    
    // En producción: obtener dosis programadas para los próximos 10 minutos
    // const { data: upcomingDoses } = await supabase
    //   .from('medications')
    //   .select(`
    //     id, name, times, dose,
    //     user:users(id, name, phone, fcm_token)
    //   `)
    //   .eq('active', true)
    //   .contains('times', [/* times in next 10 min */]);
    
    // Por cada dosis próxima:
    // 1. Verificar si ya se envió recordatorio
    // 2. Enviar push notification si tiene FCM token
    // 3. Enviar SMS si es medicamento crítico y no tiene app
    
    // Simulación
    const reminderAdvance = 10; // minutos antes
    console.log(`[CRON] Checking for reminders at ${currentTime}...`);
    
    // En producción:
    // for (const dose of upcomingDoses) {
    //   const reminderTime = calculateReminderTime(dose.scheduledTime, reminderAdvance);
    //   if (currentTime === reminderTime) {
    //     await sendReminder(dose);
    //     results.remindersSent++;
    //   }
    // }
    
    const duration = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`,
      results
    });
    
  } catch (error) {
    console.error('[CRON] Error in reminder check:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
}

// Función para enviar recordatorio push
async function sendPushNotification(dose: ScheduledDose): Promise<void> {
  // En producción: usar Firebase Cloud Messaging
  // const message = {
  //   notification: {
  //     title: '💊 Es hora de tu medicamento',
  //     body: `${dose.medicationName} - ${dose.dose}`,
  //   },
  //   token: dose.fcmToken,
  // };
  // await admin.messaging().send(message);
  console.log(`[PUSH] Reminder for ${dose.medicationName} to user ${dose.userId}`);
}

// Función para enviar recordatorio SMS
async function sendReminderSMS(dose: ScheduledDose): Promise<void> {
  if (!dose.userPhone) return;
  
  const message = `💊 MediControl: ${dose.userName}, es hora de tomar ${dose.medicationName} (${dose.dose}).`;
  
  // En producción: llamar a Twilio
  console.log(`[SMS] Reminder to ${dose.userPhone}: ${message}`);
}
