import { NextRequest, NextResponse } from 'next/server';

// Twilio SMS API for critical medication alerts
// This endpoint sends SMS alerts to caregivers when critical doses are missed

interface SMSAlertRequest {
  to: string; // Phone number
  message: string;
  priority: 'high' | 'critical' | 'emergency';
  patientName: string;
  medicationName: string;
  scheduledTime: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: SMSAlertRequest = await request.json();
    const { to, message, priority, patientName, medicationName, scheduledTime } = body;

    if (!to || !message) {
      return NextResponse.json(
        { error: 'Falta número de teléfono o mensaje' },
        { status: 400 }
      );
    }

    // Validate phone number format (E.164)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(to)) {
      return NextResponse.json(
        { error: 'Formato de teléfono inválido. Use formato internacional (+57...)' },
        { status: 400 }
      );
    }

    // Get Twilio credentials from environment
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;

    // If Twilio is not configured, simulate the SMS (for development)
    if (!accountSid || !authToken || !fromNumber) {
      console.log('='.repeat(50));
      console.log('📱 SMS SIMULADO (Twilio no configurado)');
      console.log('='.repeat(50));
      console.log(`Para: ${to}`);
      console.log(`Prioridad: ${priority.toUpperCase()}`);
      console.log(`Mensaje: ${message}`);
      console.log('='.repeat(50));
      
      // Return success for development
      return NextResponse.json({
        success: true,
        simulated: true,
        messageId: `sim_${Date.now()}`,
        to,
        message,
        timestamp: new Date().toISOString(),
        note: 'Configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_PHONE_NUMBER en .env para SMS reales'
      });
    }

    // Format message based on priority
    let formattedMessage = '';
    switch (priority) {
      case 'emergency':
        formattedMessage = `🚨 EMERGENCIA - MediControl\n\n${message}\n\n📞 Contacta inmediatamente a ${patientName}`;
        break;
      case 'critical':
        formattedMessage = `⚠️ ALERTA CRÍTICA - MediControl\n\n${message}\n\nMedicamento: ${medicationName}\nHorario: ${scheduledTime}\nPaciente: ${patientName}`;
        break;
      default:
        formattedMessage = `📱 MediControl\n\n${message}`;
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    
    const formData = new URLSearchParams();
    formData.append('To', to);
    formData.append('From', fromNumber);
    formData.append('Body', formattedMessage);

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Twilio error:', result);
      return NextResponse.json(
        { error: 'Error al enviar SMS', details: result.message },
        { status: 500 }
      );
    }

    // Log successful send
    console.log(`✅ SMS enviado exitosamente a ${to}`);
    console.log(`   Message SID: ${result.sid}`);
    console.log(`   Status: ${result.status}`);

    return NextResponse.json({
      success: true,
      messageId: result.sid,
      to,
      status: result.status,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Error sending SMS:', error);
    return NextResponse.json(
      { error: 'Error interno al procesar la solicitud' },
      { status: 500 }
    );
  }
}

// GET endpoint to check SMS balance (for premium users)
export async function GET() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    return NextResponse.json({
      configured: false,
      message: 'Twilio no está configurado'
    });
  }

  try {
    // Fetch account balance from Twilio
    const balanceUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Balance.json`;
    
    const response = await fetch(balanceUrl, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
      },
    });

    const result = await response.json();

    return NextResponse.json({
      configured: true,
      balance: {
        amount: result.balance,
        currency: result.currency,
      }
    });
  } catch {
    return NextResponse.json({
      configured: true,
      balance: null,
      message: 'No se pudo obtener el balance'
    });
  }
}
