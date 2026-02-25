// Tipos para la aplicación de gestión de medicamentos

export type DoseUnit = 'mg' | 'ml' | 'pastillas' | 'gotas' | 'capsulas' | 'g' | 'unidades';

export type FrequencyType = 'horas' | 'veces_dia' | 'dias_semana' | 'especifico';

export type InstructionType = 
  | 'con_comida' 
  | 'en_ayunas' 
  | 'antes_comer' 
  | 'despues_comer' 
  | 'con_agua' 
  | 'evitar_alcohol'
  | 'evitar_lacteos'
  | 'evitar_toronja'
  | 'ninguna';

export type MedicationStatus = 'active' | 'inactive' | 'suspended';

export type DoseStatus = 'pending' | 'taken' | 'skipped' | 'postponed';

export type InteractionSeverity = 'leve' | 'moderada' | 'grave';

// Configuración de alertas para cuidadores
export interface CaregiverAlert {
  id: string;
  caregiverId: string;
  medicationId?: string; // Si es para un medicamento específico
  alertType: 'missed_dose' | 'low_stock' | 'panic_button';
  delayMinutes: number; // Minutos de retraso antes de alertar
  enabled: boolean;
}

export interface Caregiver {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  receiveAlerts: boolean;
  createdAt: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName?: string;
  dose: number;
  doseUnit: DoseUnit;
  frequencyType: FrequencyType;
  frequencyValue: number;
  schedules: string[];
  instructions: InstructionType[];
  notes?: string;
  startDate: string;
  endDate?: string;
  status: MedicationStatus;
  prescribedBy?: string;
  color: string;
  // Control de inventario
  stock?: number; // Cantidad actual disponible
  stockUnit?: DoseUnit; // Unidad del stock
  lowStockThreshold?: number; // Umbral para alerta de stock bajo
  lastStockUpdate?: string;
  // Medicamento crítico (para alertas)
  isCritical?: boolean; // Si es crítico, alerta si se omite
  criticalAlertDelay?: number; // Minutos antes de alertar
  createdAt: string;
  updatedAt: string;
}

export interface DoseRecord {
  id: string;
  medicationId: string;
  scheduledTime: string;
  actualTime?: string;
  status: DoseStatus;
  notes?: string;
  date: string;
  createdAt: string;
}

export interface Interaction {
  id: string;
  medication1: string;
  medication2: string;
  severity: InteractionSeverity;
  description: string;
  recommendation: string;
  symptoms?: string[];
}

export interface SideEffectNote {
  id: string;
  medicationId: string;
  date: string;
  symptoms: string;
  severity: 'leve' | 'moderada' | 'grave';
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  name: string;
  age?: number;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  primaryDoctor?: {
    name: string;
    phone: string;
    specialty: string;
  };
  allergies?: string[];
  conditions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DaySummary {
  date: string;
  totalDoses: number;
  takenDoses: number;
  skippedDoses: number;
  pendingDoses: number;
  postponedDoses: number;
  complianceRate: number;
}

export interface MedicationDoseForDay {
  medication: Medication;
  time: string;
  dose: number;
  doseUnit: DoseUnit;
  status: DoseStatus;
  record?: DoseRecord;
}

export type ViewMode = 'dashboard' | 'medications' | 'history' | 'reports' | 'settings' | 'share' | 'inventory' | 'alerts' | 'scan';
