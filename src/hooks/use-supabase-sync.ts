'use client';

import { useEffect, useCallback } from 'react';
import { useMedicationStore } from '@/store/medication-store';
import { useAuthStore } from '@/store/auth-store';
import { createClient } from '@/lib/supabase';
import type { Medication, DoseRecord, Caregiver } from '@/types/medication';

// Helper para convertir de DB a Medication
const dbToMedication = (row: Record<string, unknown>): Medication => ({
  id: row.id as string,
  name: row.name as string,
  genericName: row.generic_name as string | undefined,
  dose: Number(row.dose),
  doseUnit: row.dose_unit as Medication['doseUnit'],
  frequencyType: row.frequency_type as Medication['frequencyType'],
  frequencyValue: row.frequency_value as number,
  schedules: row.schedules as string[],
  instructions: (row.instructions as string[]) || [],
  notes: row.notes as string | undefined,
  startDate: row.start_date as string,
  endDate: row.end_date as string | undefined,
  status: row.status as Medication['status'],
  prescribedBy: row.prescribed_by as string | undefined,
  color: row.color as string,
  stock: row.stock !== null ? Number(row.stock) : undefined,
  stockUnit: row.stock_unit as Medication['stockUnit'] | undefined,
  lowStockThreshold: row.low_stock_threshold as number | undefined,
  lastStockUpdate: row.last_stock_update as string | undefined,
  isCritical: row.is_critical as boolean,
  criticalAlertDelay: row.critical_alert_delay as number,
  createdAt: row.created_at as string,
  updatedAt: row.updated_at as string,
});

// Helper para convertir de DB a DoseRecord
const dbToDoseRecord = (row: Record<string, unknown>): DoseRecord => ({
  id: row.id as string,
  medicationId: row.medication_id as string,
  scheduledTime: row.scheduled_time as string,
  actualTime: row.actual_time as string | undefined,
  date: row.date as string,
  status: row.status as DoseRecord['status'],
  notes: row.notes as string | undefined,
  createdAt: row.created_at as string,
});

// Helper para convertir de DB a Caregiver
const dbToCaregiver = (row: Record<string, unknown>): Caregiver => ({
  id: row.id as string,
  name: row.name as string,
  email: row.email as string,
  phone: row.phone as string,
  relationship: row.relationship as string,
  receiveAlerts: row.receive_alerts as boolean,
  createdAt: row.created_at as string,
});

export function useSupabaseSync() {
  const { user, isAuthenticated } = useAuthStore();
  const { 
    setMedications, 
    setDoseRecords, 
    setCaregivers,
    medications,
    doseRecords,
    caregivers
  } = useMedicationStore();

  // Cargar datos desde Supabase al iniciar
  const loadFromSupabase = useCallback(async () => {
    if (!user || !isAuthenticated) return;

    const supabase = createClient();

    try {
      // Cargar medicamentos
      const { data: medsData, error: medsError } = await supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (medsError) {
        console.error('Error loading medications:', medsError);
      } else if (medsData) {
        setMedications(medsData.map(dbToMedication));
      }

      // Cargar registros de dosis
      const { data: dosesData, error: dosesError } = await supabase
        .from('dose_records')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (dosesError) {
        console.error('Error loading dose records:', dosesError);
      } else if (dosesData) {
        setDoseRecords(dosesData.map(dbToDoseRecord));
      }

      // Cargar cuidadores
      const { data: caregiversData, error: cgError } = await supabase
        .from('caregivers')
        .select('*')
        .eq('user_id', user.id);

      if (cgError) {
        console.error('Error loading caregivers:', cgError);
      } else if (caregiversData) {
        setCaregivers(caregiversData.map(dbToCaregiver));
      }

      console.log('[Supabase] Data loaded successfully');
    } catch (error) {
      console.error('[Supabase] Error loading data:', error);
    }
  }, [user, isAuthenticated, setMedications, setDoseRecords, setCaregivers]);

  // Guardar medicamento en Supabase
  const saveMedication = useCallback(async (medication: Medication) => {
    if (!user) return;

    const supabase = createClient();

    const dbMed = {
      user_id: user.id,
      name: medication.name,
      generic_name: medication.genericName || null,
      dose: medication.dose,
      dose_unit: medication.doseUnit,
      frequency_type: medication.frequencyType,
      frequency_value: medication.frequencyValue,
      schedules: medication.schedules,
      instructions: medication.instructions || [],
      notes: medication.notes || null,
      start_date: medication.startDate,
      end_date: medication.endDate || null,
      status: medication.status,
      prescribed_by: medication.prescribedBy || null,
      color: medication.color,
      stock: medication.stock ?? 0,
      stock_unit: medication.stockUnit || medication.doseUnit,
      low_stock_threshold: medication.lowStockThreshold ?? 5,
      is_critical: medication.isCritical ?? false,
      critical_alert_delay: medication.criticalAlertDelay ?? 60,
    };

    try {
      const { error } = await supabase
        .from('medications')
        .upsert({ id: medication.id, ...dbMed });

      if (error) {
        console.error('[Supabase] Error saving medication:', error);
      } else {
        console.log('[Supabase] Medication saved:', medication.id);
      }
    } catch (error) {
      console.error('[Supabase] Error saving medication:', error);
    }
  }, [user]);

  // Eliminar medicamento de Supabase
  const deleteMedicationFromSupabase = useCallback(async (id: string) => {
    if (!user) return;

    const supabase = createClient();

    try {
      // Primero eliminar registros de dosis relacionados
      await supabase
        .from('dose_records')
        .delete()
        .eq('medication_id', id);

      // Luego eliminar el medicamento
      const { error } = await supabase
        .from('medications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[Supabase] Error deleting medication:', error);
      } else {
        console.log('[Supabase] Medication deleted:', id);
      }
    } catch (error) {
      console.error('[Supabase] Error deleting medication:', error);
    }
  }, [user]);

  // Guardar registro de dosis en Supabase
  const saveDoseRecord = useCallback(async (record: DoseRecord) => {
    if (!user) return;

    const supabase = createClient();

    const dbRecord = {
      user_id: user.id,
      medication_id: record.medicationId,
      scheduled_time: record.scheduledTime,
      actual_time: record.actualTime || null,
      date: record.date,
      status: record.status,
      notes: record.notes || null,
    };

    try {
      const { error } = await supabase
        .from('dose_records')
        .upsert({ id: record.id, ...dbRecord });

      if (error) {
        console.error('[Supabase] Error saving dose record:', error);
      } else {
        console.log('[Supabase] Dose record saved:', record.id);
      }
    } catch (error) {
      console.error('[Supabase] Error saving dose record:', error);
    }
  }, [user]);

  // Guardar cuidador en Supabase
  const saveCaregiver = useCallback(async (caregiver: Caregiver) => {
    if (!user) return;

    const supabase = createClient();

    const dbCaregiver = {
      user_id: user.id,
      name: caregiver.name,
      email: caregiver.email,
      phone: caregiver.phone,
      relationship: caregiver.relationship,
      receive_alerts: caregiver.receiveAlerts,
    };

    try {
      const { error } = await supabase
        .from('caregivers')
        .upsert({ id: caregiver.id, ...dbCaregiver });

      if (error) {
        console.error('[Supabase] Error saving caregiver:', error);
      } else {
        console.log('[Supabase] Caregiver saved:', caregiver.id);
      }
    } catch (error) {
      console.error('[Supabase] Error saving caregiver:', error);
    }
  }, [user]);

  // Eliminar cuidador de Supabase
  const deleteCaregiverFromSupabase = useCallback(async (id: string) => {
    if (!user) return;

    const supabase = createClient();

    try {
      const { error } = await supabase
        .from('caregivers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('[Supabase] Error deleting caregiver:', error);
      } else {
        console.log('[Supabase] Caregiver deleted:', id);
      }
    } catch (error) {
      console.error('[Supabase] Error deleting caregiver:', error);
    }
  }, [user]);

  // Cargar datos cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated && user) {
      loadFromSupabase();
    }
  }, [isAuthenticated, user, loadFromSupabase]);

  return {
    loadFromSupabase,
    saveMedication,
    deleteMedicationFromSupabase,
    saveDoseRecord,
    saveCaregiver,
    deleteCaregiverFromSupabase,
  };
}
