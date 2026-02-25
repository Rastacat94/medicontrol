// Servicio de sincronización con Supabase
// Maneja la sincronización de datos entre localStorage y la nube

import { createClient, isSupabaseConfigured, isOnline } from './supabase';
import type { 
  MedicationRow, 
  DoseRecordRow, 
  CaregiverRow,
  UserRow 
} from '@/types/database';
import type { Medication, DoseRecord, Caregiver } from '@/types/medication';
import type { User } from '@/types/auth';

// ============================================
// TIPOS
// ============================================

interface SyncStatus {
  isSyncing: boolean;
  lastSyncAt: Date | null;
  pendingChanges: number;
  error: string | null;
}

interface PendingChange {
  id: string;
  table: 'medications' | 'dose_records' | 'caregivers';
  operation: 'insert' | 'update' | 'delete';
  data: Record<string, unknown>;
  timestamp: number;
}

// ============================================
// CONSTANTES
// ============================================

const PENDING_CHANGES_KEY = 'medicontrol-pending-changes';
const LAST_SYNC_KEY = 'medicontrol-last-sync';
const SYNC_INTERVAL = 5 * 60 * 1000; // 5 minutos

// ============================================
// UTILIDADES
// ============================================

const getPendingChanges = (): PendingChange[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(PENDING_CHANGES_KEY);
  return stored ? JSON.parse(stored) : [];
};

const savePendingChanges = (changes: PendingChange[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PENDING_CHANGES_KEY, JSON.stringify(changes));
  }
};

const addPendingChange = (change: PendingChange) => {
  const changes = getPendingChanges();
  changes.push(change);
  savePendingChanges(changes);
};

const removePendingChange = (id: string) => {
  const changes = getPendingChanges().filter(c => c.id !== id);
  savePendingChanges(changes);
};

const getLastSync = (): Date | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(LAST_SYNC_KEY);
  return stored ? new Date(stored) : null;
};

const setLastSync = (date: Date = new Date()) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LAST_SYNC_KEY, date.toISOString());
  }
};

// ============================================
// CONVERSORES DE TIPOS
// ============================================

// Convertir Medication local a formato Supabase
const medicationToRow = (med: Medication, userId: string): Omit<MedicationRow, 'created_at' | 'updated_at'> => ({
  id: med.id,
  user_id: userId,
  name: med.name,
  generic_name: med.genericName || null,
  dose: med.dose,
  dose_unit: med.doseUnit,
  frequency_type: med.frequencyType,
  frequency_value: med.frequencyValue,
  schedules: med.times,
  instructions: med.instructions || [],
  notes: med.notes || null,
  start_date: med.startDate,
  end_date: med.endDate || null,
  status: med.status,
  prescribed_by: med.prescribedBy || null,
  color: med.color,
  stock: med.stock ?? null,
  stock_unit: med.stockUnit || null,
  low_stock_threshold: med.lowStockThreshold ?? null,
  last_stock_update: med.lastStockUpdate || null,
  is_critical: med.isCritical || false,
  critical_alert_delay: med.criticalAlertDelay || 60,
});

// Convertir fila de Supabase a Medication local
const rowToMedication = (row: MedicationRow): Medication => ({
  id: row.id,
  name: row.name,
  genericName: row.generic_name || undefined,
  dose: row.dose,
  doseUnit: row.dose_unit as Medication['doseUnit'],
  frequencyType: row.frequency_type as Medication['frequencyType'],
  frequencyValue: row.frequency_value,
  times: row.schedules,
  instructions: row.instructions as Medication['instructions'] || [],
  notes: row.notes || undefined,
  startDate: row.start_date,
  endDate: row.end_date || undefined,
  status: row.status as Medication['status'],
  prescribedBy: row.prescribed_by || undefined,
  color: row.color,
  stock: row.stock ?? undefined,
  stockUnit: row.stock_unit || undefined,
  lowStockThreshold: row.low_stock_threshold ?? undefined,
  lastStockUpdate: row.last_stock_update || undefined,
  isCritical: row.is_critical,
  criticalAlertDelay: row.critical_alert_delay,
});

// Convertir DoseRecord local a formato Supabase
const doseRecordToRow = (record: DoseRecord, userId: string): Omit<DoseRecordRow, 'created_at'> => ({
  id: record.id,
  user_id: userId,
  medication_id: record.medicationId,
  scheduled_time: record.scheduledTime,
  actual_time: record.actualTime || null,
  date: record.date,
  status: record.status,
  notes: record.notes || null,
});

// Convertir fila de Supabase a DoseRecord local
const rowToDoseRecord = (row: DoseRecordRow): DoseRecord => ({
  id: row.id,
  medicationId: row.medication_id,
  scheduledTime: row.scheduled_time,
  actualTime: row.actual_time || undefined,
  date: row.date,
  status: row.status as DoseRecord['status'],
  notes: row.notes || undefined,
});

// ============================================
// SERVICIO DE SINCRONIZACIÓN
// ============================================

export const syncService = {
  // Estado de sincronización
  status: {
    isSyncing: false,
    lastSyncAt: null as Date | null,
    pendingChanges: 0,
    error: null as string | null,
  },

  // Inicializar servicio
  init() {
    this.status.lastSyncAt = getLastSync();
    this.status.pendingChanges = getPendingChanges().length;
    
    // Sincronizar periódicamente
    if (typeof window !== 'undefined') {
      setInterval(() => this.syncPendingChanges(), SYNC_INTERVAL);
      
      // Sincronizar cuando vuelve la conexión
      window.addEventListener('online', () => this.syncPendingChanges());
    }
  },

  // ============================================
  // MEDICAMENTOS
  // ============================================

  async syncMedications(userId: string, localMedications: Medication[]): Promise<{
    medications: Medication[];
    synced: number;
    error?: string;
  }> {
    if (!isSupabaseConfigured() || !isOnline()) {
      return { medications: localMedications, synced: 0 };
    }

    try {
      const supabase = createClient();
      
      // Obtener medicamentos de la nube
      const { data: cloudMeds, error } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Convertir a formato local
      const cloudMedications = (cloudMeds || []).map(rowToMedication);

      // Merge: usar el más reciente (por updated_at)
      const allMeds = [...localMedications];
      
      for (const cloudMed of cloudMedications) {
        const localIndex = allMeds.findIndex(m => m.id === cloudMed.id);
        if (localIndex === -1) {
          // Nuevo desde la nube
          allMeds.push(cloudMed);
        }
        // Si existe en ambos, el local tiene prioridad (se subirá después)
      }

      return { medications: allMeds, synced: cloudMedications.length };
    } catch (error) {
      console.error('[Sync] Error syncing medications:', error);
      return { 
        medications: localMedications, 
        synced: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  async uploadMedication(med: Medication, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      // Guardar como cambio pendiente
      addPendingChange({
        id: `${Date.now()}-${med.id}`,
        table: 'medications',
        operation: 'insert',
        data: { medication: med, userId },
        timestamp: Date.now(),
      });
      return false;
    }

    if (!isOnline()) {
      addPendingChange({
        id: `${Date.now()}-${med.id}`,
        table: 'medications',
        operation: 'insert',
        data: { medication: med, userId },
        timestamp: Date.now(),
      });
      return false;
    }

    try {
      const supabase = createClient();
      const row = medicationToRow(med, userId);
      
      const { error } = await supabase
        .from('medications')
        .upsert(row, { onConflict: 'id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[Sync] Error uploading medication:', error);
      
      // Guardar como pendiente
      addPendingChange({
        id: `${Date.now()}-${med.id}`,
        table: 'medications',
        operation: 'insert',
        data: { medication: med, userId },
        timestamp: Date.now(),
      });
      return false;
    }
  },

  async deleteMedication(medId: string, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !isOnline()) {
      addPendingChange({
        id: `${Date.now()}-${medId}`,
        table: 'medications',
        operation: 'delete',
        data: { medId, userId },
        timestamp: Date.now(),
      });
      return false;
    }

    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', medId)
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[Sync] Error deleting medication:', error);
      return false;
    }
  },

  // ============================================
  // REGISTROS DE DOSIS
  // ============================================

  async syncDoseRecords(userId: string, localRecords: DoseRecord[]): Promise<{
    records: DoseRecord[];
    synced: number;
    error?: string;
  }> {
    if (!isSupabaseConfigured() || !isOnline()) {
      return { records: localRecords, synced: 0 };
    }

    try {
      const supabase = createClient();
      
      // Obtener últimos 30 días de la nube
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: cloudRecords, error } = await supabase
        .from('dose_records')
        .select('*')
        .eq('user_id', userId)
        .gte('date', thirtyDaysAgo.toISOString().split('T')[0]);

      if (error) throw error;

      const cloudDoseRecords = (cloudRecords || []).map(rowToDoseRecord);

      // Merge
      const allRecords = [...localRecords];
      
      for (const cloudRecord of cloudDoseRecords) {
        const localIndex = allRecords.findIndex(r => r.id === cloudRecord.id);
        if (localIndex === -1) {
          allRecords.push(cloudRecord);
        }
      }

      return { records: allRecords, synced: cloudDoseRecords.length };
    } catch (error) {
      console.error('[Sync] Error syncing dose records:', error);
      return { 
        records: localRecords, 
        synced: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },

  async uploadDoseRecord(record: DoseRecord, userId: string): Promise<boolean> {
    if (!isSupabaseConfigured() || !isOnline()) {
      addPendingChange({
        id: `${Date.now()}-${record.id}`,
        table: 'dose_records',
        operation: 'insert',
        data: { record, userId },
        timestamp: Date.now(),
      });
      return false;
    }

    try {
      const supabase = createClient();
      const row = doseRecordToRow(record, userId);
      
      const { error } = await supabase
        .from('dose_records')
        .upsert(row, { onConflict: 'id' });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('[Sync] Error uploading dose record:', error);
      
      addPendingChange({
        id: `${Date.now()}-${record.id}`,
        table: 'dose_records',
        operation: 'insert',
        data: { record, userId },
        timestamp: Date.now(),
      });
      return false;
    }
  },

  // ============================================
  // SINCRONIZACIÓN DE CAMBIOS PENDIENTES
  // ============================================

  async syncPendingChanges(): Promise<{ synced: number; failed: number }> {
    const pending = getPendingChanges();
    
    if (pending.length === 0) {
      return { synced: 0, failed: 0 };
    }

    if (!isSupabaseConfigured() || !isOnline()) {
      return { synced: 0, failed: pending.length };
    }

    this.status.isSyncing = true;
    let synced = 0;
    let failed = 0;

    const supabase = createClient();

    for (const change of pending) {
      try {
        switch (change.table) {
          case 'medications':
            if (change.operation === 'delete') {
              await supabase
                .from('medications')
                .delete()
                .eq('id', change.data.medId);
            } else {
              const med = change.data.medication as Medication;
              const userId = change.data.userId as string;
              await supabase
                .from('medications')
                .upsert(medicationToRow(med, userId), { onConflict: 'id' });
            }
            break;

          case 'dose_records':
            const record = change.data.record as DoseRecord;
            const userId = change.data.userId as string;
            await supabase
              .from('dose_records')
              .upsert(doseRecordToRow(record, userId), { onConflict: 'id' });
            break;
        }

        removePendingChange(change.id);
        synced++;
      } catch (error) {
        console.error('[Sync] Error processing pending change:', error);
        failed++;
      }
    }

    this.status.isSyncing = false;
    this.status.pendingChanges = getPendingChanges().length;
    
    if (synced > 0) {
      setLastSync();
      this.status.lastSyncAt = new Date();
    }

    return { synced, failed };
  },

  // ============================================
  // UTILIDADES
  // ============================================

  getSyncStatus(): SyncStatus {
    return {
      ...this.status,
      pendingChanges: getPendingChanges().length,
      lastSyncAt: getLastSync(),
    };
  },

  clearPendingChanges() {
    savePendingChanges([]);
    this.status.pendingChanges = 0;
  },

  // Forzar sincronización completa
  async fullSync(userId: string, localData: {
    medications: Medication[];
    doseRecords: DoseRecord[];
  }): Promise<{
    medications: Medication[];
    doseRecords: DoseRecord[];
  }> {
    // Sincronizar cambios pendientes primero
    await this.syncPendingChanges();

    // Obtener datos de la nube
    const medsResult = await this.syncMedications(userId, localData.medications);
    const recordsResult = await this.syncDoseRecords(userId, localData.doseRecords);

    setLastSync();
    this.status.lastSyncAt = new Date();

    return {
      medications: medsResult.medications,
      doseRecords: recordsResult.records,
    };
  },
};

// Inicializar el servicio
if (typeof window !== 'undefined') {
  syncService.init();
}

export default syncService;
