// Tipos para el sistema de alertas automáticas

export type AlertType = 'missed_dose' | 'low_stock' | 'interaction_warning' | 'reminder';
export type AlertStatus = 'pending' | 'sent' | 'acknowledged' | 'failed';
export type AlertChannel = 'sms' | 'push' | 'email';

export interface AlertConfig {
  // Minutos después de la hora programada para considerar dosis omitida
  missedDoseThreshold: number; // default: 30 minutos
  // Minutos antes para enviar recordatorio
  reminderAdvance: number; // default: 10 minutos
  // Máximo de alertas por día para el mismo medicamento
  maxAlertsPerDay: number; // default: 3
  // Intervalo mínimo entre alertas duplicadas (minutos)
  minAlertInterval: number; // default: 60
}

export interface AlertRecord {
  id: string;
  userId: string;
  medicationId: string;
  type: AlertType;
  status: AlertStatus;
  channel: AlertChannel;
  scheduledAt: Date;
  sentAt?: Date;
  acknowledgedAt?: Date;
  recipientPhone?: string;
  recipientEmail?: string;
  message: string;
  error?: string;
  createdAt: Date;
}

export interface AlertQueueItem {
  id: string;
  userId: string;
  medicationId: string;
  doseTime: string;
  scheduledDate: string;
  type: AlertType;
  attempts: number;
  lastAttemptAt?: Date;
  nextAttemptAt: Date;
  status: 'queued' | 'processing' | 'completed' | 'failed';
}

export interface CaregiverAlert {
  caregiverId: string;
  caregiverName: string;
  caregiverPhone: string;
  userId: string;
  userName: string;
  medicationName: string;
  missedDoseTime: string;
  missedDoseDate: string;
}

// Configuración por defecto
export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  missedDoseThreshold: 30,
  reminderAdvance: 10,
  maxAlertsPerDay: 3,
  minAlertInterval: 60
};

// Plantillas de mensajes
export const ALERT_MESSAGES = {
  missed_dose: {
    sms: (data: { userName: string; medName: string; time: string }) =>
      `🚨 ALERTA MediControl: ${data.userName} NO ha tomado ${data.medName} a las ${data.time}. Por favor, contáctalo para verificar.`,
    push: (data: { medName: string; time: string }) =>
      `Dosis omitida: ${data.medName} a las ${data.time}`
  },
  reminder: {
    sms: (data: { userName: string; medName: string; time: string }) =>
      `💊 MediControl: ${data.userName}, recuerda tomar ${data.medName} a las ${data.time}.`,
    push: (data: { medName: string; time: string }) =>
      `Es hora de tomar ${data.medName}`
  },
  low_stock: {
    sms: (data: { userName: string; medName: string; remaining: number }) =>
      `📦 MediControl: A ${data.userName} le quedan solo ${data.remaining} unidades de ${data.medName}. Considera reposición.`,
    push: (data: { medName: string; remaining: number }) =>
      `Stock bajo: ${data.medName} (${data.remaining} restantes)`
  }
};
