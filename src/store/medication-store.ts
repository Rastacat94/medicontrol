import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Medication, 
  DoseRecord, 
  UserProfile, 
  SideEffectNote,
  ViewMode,
  DoseStatus,
  MedicationDoseForDay,
  Caregiver,
  CaregiverAlert
} from '@/types/medication';
import { v4 as uuidv4 } from 'uuid';

interface MedicationStore {
  // Estado
  medications: Medication[];
  doseRecords: DoseRecord[];
  sideEffects: SideEffectNote[];
  profile: UserProfile | null;
  caregivers: Caregiver[];
  alerts: CaregiverAlert[];
  currentView: ViewMode;
  selectedDate: string;
  lastAlertCheck: string;
  
  // Setters for sync (bulk updates from cloud)
  setMedications: (medications: Medication[]) => void;
  setDoseRecords: (doseRecords: DoseRecord[]) => void;
  setSideEffects: (sideEffects: SideEffectNote[]) => void;
  setProfile: (profile: UserProfile | null) => void;
  setCaregivers: (caregivers: Caregiver[]) => void;
  setAlerts: (alerts: CaregiverAlert[]) => void;
  
  // Acciones de medicamentos
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'>) => Medication;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  deleteMedication: (id: string) => void;
  toggleMedicationStatus: (id: string) => void;
  
  // Control de inventario
  updateStock: (medicationId: string, quantity: number, operation: 'set' | 'add' | 'subtract') => void;
  getLowStockMedications: () => Medication[];
  
  // Acciones de registro de dosis
  recordDose: (medicationId: string, scheduledTime: string, date: string, status: DoseStatus, notes?: string) => void;
  updateDoseRecord: (recordId: string, updates: Partial<DoseRecord>) => void;
  
  // Acciones de efectos secundarios
  addSideEffect: (effect: Omit<SideEffectNote, 'id' | 'createdAt'>) => void;
  
  // Acciones de perfil
  updateProfile: (profile: Partial<UserProfile>) => void;
  
  // Acciones de cuidadores
  addCaregiver: (caregiver: Omit<Caregiver, 'id' | 'createdAt'>) => void;
  updateCaregiver: (id: string, updates: Partial<Caregiver>) => void;
  deleteCaregiver: (id: string) => void;
  
  // Acciones de alertas
  addAlert: (alert: Omit<CaregiverAlert, 'id'>) => void;
  updateAlert: (id: string, updates: Partial<CaregiverAlert>) => void;
  deleteAlert: (id: string) => void;
  
  // Sistema de alertas de dosis omitidas
  checkMissedDoses: () => { medicationId: string; medicationName: string; scheduledTime: string; minutesLate: number }[];
  sendAlertToCaregiver: (caregiverId: string, message: string) => void;
  
  // Navegación
  setCurrentView: (view: ViewMode) => void;
  setSelectedDate: (date: string) => void;
  
  // Utilidades
  getMedicationsForDate: (date: string) => Medication[];
  getDosesForDate: (date: string) => MedicationDoseForDay[];
  getNextDose: () => MedicationDoseForDay | null;
  getDaySummary: (date: string) => { total: number; taken: number; pending: number; skipped: number; postponed: number; rate: number };
  getWeeklyStats: () => { date: string; rate: number }[];
  getComplianceRate: (days: number) => number;
  exportData: () => string;
  clearAllData: () => void;
}

const MEDICATION_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
];

const getToday = () => new Date().toISOString().split('T')[0];

export const useMedicationStore = create<MedicationStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      medications: [],
      doseRecords: [],
      sideEffects: [],
      profile: null,
      caregivers: [],
      alerts: [],
      currentView: 'dashboard',
      selectedDate: getToday(),
      lastAlertCheck: new Date().toISOString(),
      
      // Setters for sync (bulk updates from cloud)
      setMedications: (medications) => set({ medications }),
      setDoseRecords: (doseRecords) => set({ doseRecords }),
      setSideEffects: (sideEffects) => set({ sideEffects }),
      setProfile: (profile) => set({ profile }),
      setCaregivers: (caregivers) => set({ caregivers }),
      setAlerts: (alerts) => set({ alerts }),
      
      // Acciones de medicamentos
      addMedication: (medicationData) => {
        const now = new Date().toISOString();
        const newMedication: Medication = {
          ...medicationData,
          id: uuidv4(),
          stock: medicationData.stock ?? 0,
          lowStockThreshold: medicationData.lowStockThreshold ?? 5,
          isCritical: medicationData.isCritical ?? false,
          criticalAlertDelay: medicationData.criticalAlertDelay ?? 60,
          createdAt: now,
          updatedAt: now,
        };
        
        set((state) => ({
          medications: [...state.medications, newMedication]
        }));
        
        return newMedication;
      },
      
      updateMedication: (id, updates) => {
        set((state) => ({
          medications: state.medications.map((med) =>
            med.id === id
              ? { ...med, ...updates, updatedAt: new Date().toISOString() }
              : med
          )
        }));
      },
      
      deleteMedication: (id) => {
        set((state) => ({
          medications: state.medications.filter((med) => med.id !== id),
          doseRecords: state.doseRecords.filter((rec) => rec.medicationId !== id)
        }));
      },
      
      toggleMedicationStatus: (id) => {
        set((state) => ({
          medications: state.medications.map((med) =>
            med.id === id
              ? {
                  ...med,
                  status: med.status === 'active' ? 'inactive' : 'active',
                  updatedAt: new Date().toISOString()
                }
              : med
          )
        }));
      },
      
      // Control de inventario
      updateStock: (medicationId, quantity, operation) => {
        set((state) => ({
          medications: state.medications.map((med) => {
            if (med.id !== medicationId) return med;
            
            let newStock: number;
            switch (operation) {
              case 'set':
                newStock = Math.max(0, quantity);
                break;
              case 'add':
                newStock = Math.max(0, (med.stock ?? 0) + quantity);
                break;
              case 'subtract':
                newStock = Math.max(0, (med.stock ?? 0) - quantity);
                break;
              default:
                newStock = med.stock ?? 0;
            }
            
            return {
              ...med,
              stock: newStock,
              lastStockUpdate: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
          })
        }));
      },
      
      getLowStockMedications: () => {
        const state = get();
        return state.medications.filter((med) => {
          if (med.status !== 'active') return false;
          const stock = med.stock ?? 0;
          const threshold = med.lowStockThreshold ?? 5;
          return stock <= threshold && stock > 0;
        });
      },
      
      // Acciones de registro de dosis
      recordDose: (medicationId, scheduledTime, date, status, notes) => {
        const now = new Date().toISOString();
        const state = get();
        
        // Si se marca como tomada, descontar del inventario
        if (status === 'taken') {
          const medication = state.medications.find(m => m.id === medicationId);
          if (medication && medication.stock !== undefined) {
            // Descontar la cantidad de la dosis del stock
            get().updateStock(medicationId, medication.dose, 'subtract');
          }
        }
        
        const newRecord: DoseRecord = {
          id: uuidv4(),
          medicationId,
          scheduledTime,
          date,
          status,
          notes,
          actualTime: status !== 'pending' ? now : undefined,
          createdAt: now
        };
        
        set((state) => ({
          doseRecords: [...state.doseRecords, newRecord]
        }));
      },
      
      updateDoseRecord: (recordId, updates) => {
        set((state) => ({
          doseRecords: state.doseRecords.map((rec) =>
            rec.id === recordId
              ? { ...rec, ...updates }
              : rec
          )
        }));
      },
      
      // Acciones de efectos secundarios
      addSideEffect: (effectData) => {
        const newEffect: SideEffectNote = {
          ...effectData,
          id: uuidv4(),
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          sideEffects: [...state.sideEffects, newEffect]
        }));
      },
      
      // Acciones de perfil
      updateProfile: (profileUpdates) => {
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...profileUpdates, updatedAt: new Date().toISOString() }
            : {
                id: uuidv4(),
                name: '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                ...profileUpdates
              }
        }));
      },
      
      // Acciones de cuidadores
      addCaregiver: (caregiverData) => {
        const newCaregiver: Caregiver = {
          ...caregiverData,
          id: uuidv4(),
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          caregivers: [...state.caregivers, newCaregiver]
        }));
      },
      
      updateCaregiver: (id, updates) => {
        set((state) => ({
          caregivers: state.caregivers.map((cg) =>
            cg.id === id ? { ...cg, ...updates } : cg
          )
        }));
      },
      
      deleteCaregiver: (id) => {
        set((state) => ({
          caregivers: state.caregivers.filter((cg) => cg.id !== id),
          alerts: state.alerts.filter((a) => a.caregiverId !== id)
        }));
      },
      
      // Acciones de alertas
      addAlert: (alertData) => {
        const newAlert: CaregiverAlert = {
          ...alertData,
          id: uuidv4()
        };
        
        set((state) => ({
          alerts: [...state.alerts, newAlert]
        }));
      },
      
      updateAlert: (id, updates) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          )
        }));
      },
      
      deleteAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id)
        }));
      },
      
      // Sistema de alertas de dosis omitidas
      checkMissedDoses: () => {
        const state = get();
        const now = new Date();
        const today = getToday();
        const currentTime = now.toTimeString().slice(0, 5);
        
        const missedDoses: { medicationId: string; medicationName: string; scheduledTime: string; minutesLate: number }[] = [];
        
        const todayDoses = state.getDosesForDate(today);
        
        todayDoses.forEach((dose) => {
          if (dose.status !== 'pending') return;
          
          // Solo medicamentos críticos
          if (!dose.medication.isCritical) return;
          
          const [hours, minutes] = dose.time.split(':').map(Number);
          const scheduledDate = new Date(now);
          scheduledDate.setHours(hours, minutes, 0, 0);
          
          const minutesLate = Math.floor((now.getTime() - scheduledDate.getTime()) / (1000 * 60));
          const alertDelay = dose.medication.criticalAlertDelay ?? 60;
          
          if (minutesLate >= alertDelay) {
            missedDoses.push({
              medicationId: dose.medication.id,
              medicationName: dose.medication.name,
              scheduledTime: dose.time,
              minutesLate
            });
          }
        });
        
        return missedDoses;
      },
      
      sendAlertToCaregiver: (caregiverId, message) => {
        // En una implementación real, esto enviaría una notificación push, SMS o email
        // Por ahora, lo guardamos en localStorage para demostración
        const alerts = JSON.parse(localStorage.getItem('medicontrol-pending-alerts') || '[]');
        alerts.push({
          id: uuidv4(),
          caregiverId,
          message,
          timestamp: new Date().toISOString(),
          sent: false
        });
        localStorage.setItem('medicontrol-pending-alerts', JSON.stringify(alerts));
        console.log(`[ALERT] Para cuidador ${caregiverId}: ${message}`);
      },
      
      // Navegación
      setCurrentView: (view) => set({ currentView: view }),
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      // Utilidades
      getMedicationsForDate: (date) => {
        const state = get();
        return state.medications.filter((med) => {
          if (med.status !== 'active') return false;
          const startDate = new Date(med.startDate);
          const targetDate = new Date(date);
          if (startDate > targetDate) return false;
          if (med.endDate && new Date(med.endDate) < targetDate) return false;
          return true;
        });
      },
      
      getDosesForDate: (date) => {
        const state = get();
        const activeMeds = state.getMedicationsForDate(date);
        const doses: MedicationDoseForDay[] = [];
        
        activeMeds.forEach((med) => {
          med.schedules.forEach((time) => {
            const existingRecord = state.doseRecords.find(
              (rec) => rec.medicationId === med.id && rec.date === date && rec.scheduledTime === time
            );
            
            doses.push({
              medication: med,
              time,
              dose: med.dose,
              doseUnit: med.doseUnit,
              status: existingRecord?.status || 'pending',
              record: existingRecord
            });
          });
        });
        
        return doses.sort((a, b) => a.time.localeCompare(b.time));
      },
      
      getNextDose: () => {
        const state = get();
        const today = getToday();
        const now = new Date();
        const currentTime = now.toTimeString().slice(0, 5);
        
        const todayDoses = state.getDosesForDate(today);
        const pendingDoses = todayDoses.filter(
          (dose) => dose.status === 'pending' && dose.time >= currentTime
        );
        
        if (pendingDoses.length > 0) {
          return pendingDoses[0];
        }
        
        // Buscar en los próximos días
        for (let i = 1; i <= 7; i++) {
          const nextDate = new Date(now);
          nextDate.setDate(nextDate.getDate() + i);
          const dateStr = nextDate.toISOString().split('T')[0];
          const nextDayDoses = state.getDosesForDate(dateStr);
          const pendingNext = nextDayDoses.filter((d) => d.status === 'pending');
          if (pendingNext.length > 0) {
            return pendingNext[0];
          }
        }
        
        return null;
      },
      
      getDaySummary: (date) => {
        const state = get();
        const doses = state.getDosesForDate(date);
        const total = doses.length;
        const taken = doses.filter((d) => d.status === 'taken').length;
        const pending = doses.filter((d) => d.status === 'pending').length;
        const skipped = doses.filter((d) => d.status === 'skipped').length;
        const postponed = doses.filter((d) => d.status === 'postponed').length;
        const rate = total > 0 ? Math.round((taken / total) * 100) : 0;
        
        return { total, taken, pending, skipped, postponed, rate };
      },
      
      getWeeklyStats: () => {
        const state = get();
        const stats: { date: string; rate: number }[] = [];
        
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const summary = state.getDaySummary(dateStr);
          stats.push({ date: dateStr, rate: summary.rate });
        }
        
        return stats;
      },
      
      getComplianceRate: (days) => {
        const state = get();
        let totalDoses = 0;
        let takenDoses = 0;
        
        for (let i = 0; i < days; i++) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const summary = state.getDaySummary(dateStr);
          totalDoses += summary.total;
          takenDoses += summary.taken;
        }
        
        return totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
      },
      
      exportData: () => {
        const state = get();
        const today = getToday();
        
        let exportText = `═══════════════════════════════════════════════════════════════\n`;
        exportText += `           REPORTE DE MEDICAMENTOS - ${today}\n`;
        exportText += `═══════════════════════════════════════════════════════════════\n\n`;
        
        // Perfil
        if (state.profile) {
          exportText += `👤 PACIENTE: ${state.profile.name}\n`;
          if (state.profile.age) exportText += `   Edad: ${state.profile.age} años\n`;
          if (state.profile.allergies && state.profile.allergies.length > 0) {
            exportText += `   Alergias: ${state.profile.allergies.join(', ')}\n`;
          }
          if (state.profile.conditions && state.profile.conditions.length > 0) {
            exportText += `   Condiciones: ${state.profile.conditions.join(', ')}\n`;
          }
          if (state.profile.emergencyContact) {
            exportText += `   Contacto de emergencia: ${state.profile.emergencyContact.name} (${state.profile.emergencyContact.phone})\n`;
          }
          if (state.profile.primaryDoctor) {
            exportText += `   Médico principal: ${state.profile.primaryDoctor.name}\n`;
          }
          exportText += `\n`;
        }
        
        // Medicamentos activos
        exportText += `💊 MEDICAMENTOS ACTIVOS\n`;
        exportText += `─────────────────────────────────────────────────────────────\n`;
        
        const activeMeds = state.medications.filter((m) => m.status === 'active');
        if (activeMeds.length === 0) {
          exportText += `   No hay medicamentos activos registrados.\n`;
        } else {
          activeMeds.forEach((med, index) => {
            exportText += `\n   ${index + 1}. ${med.name}${med.isCritical ? ' ⚠️ CRÍTICO' : ''}\n`;
            if (med.genericName) exportText += `      Nombre genérico: ${med.genericName}\n`;
            exportText += `      Dosis: ${med.dose} ${med.doseUnit}\n`;
            exportText += `      Horarios: ${med.schedules.join(', ')}\n`;
            if (med.stock !== undefined) {
              exportText += `      Stock actual: ${med.stock} ${med.stockUnit || med.doseUnit}\n`;
              if (med.stock <= (med.lowStockThreshold ?? 5)) {
                exportText += `      ⚠️ STOCK BAJO\n`;
              }
            }
            if (med.instructions.length > 0 && !med.instructions.includes('ninguna')) {
              const instructionsText = med.instructions.map((i) => {
                const instructionLabels: Record<string, string> = {
                  'con_comida': 'Con comida',
                  'en_ayunas': 'En ayunas',
                  'antes_comer': 'Antes de comer',
                  'despues_comer': 'Después de comer',
                  'con_agua': 'Con agua',
                  'evitar_alcohol': 'Evitar alcohol',
                  'evitar_lacteos': 'Evitar lácteos',
                  'evitar_toronja': 'Evitar toronja',
                };
                return instructionLabels[i] || i;
              });
              exportText += `      Instrucciones: ${instructionsText.join(', ')}\n`;
            }
            if (med.notes) exportText += `      Notas: ${med.notes}\n`;
            if (med.prescribedBy) exportText += `      Prescrito por: ${med.prescribedBy}\n`;
          });
        }
        
        // Cuidadores
        if (state.caregivers.length > 0) {
          exportText += `\n👥 CUIDADORES\n`;
          exportText += `─────────────────────────────────────────────────────────────\n`;
          state.caregivers.forEach((cg) => {
            exportText += `   • ${cg.name} (${cg.relationship}) - ${cg.phone}\n`;
          });
        }
        
        // Resumen del día
        exportText += `\n📊 RESUMEN DEL DÍA (${today})\n`;
        exportText += `─────────────────────────────────────────────────────────────\n`;
        const todaySummary = state.getDaySummary(today);
        exportText += `   Total de dosis programadas: ${todaySummary.total}\n`;
        exportText += `   Dosis tomadas: ${todaySummary.taken}\n`;
        exportText += `   Dosis pendientes: ${todaySummary.pending}\n`;
        exportText += `   Dosis omitidas: ${todaySummary.skipped}\n`;
        exportText += `   Tasa de cumplimiento: ${todaySummary.rate}%\n`;
        
        // Cumplimiento semanal
        exportText += `\n📈 CUMPLIMIENTO SEMANAL\n`;
        exportText += `─────────────────────────────────────────────────────────────\n`;
        const weeklyRate = state.getComplianceRate(7);
        exportText += `   Tasa de cumplimiento (últimos 7 días): ${weeklyRate}%\n`;
        
        // Efectos secundarios recientes
        const recentEffects = state.sideEffects
          .filter((e) => {
            const effectDate = new Date(e.date);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return effectDate >= weekAgo;
          })
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        if (recentEffects.length > 0) {
          exportText += `\n⚠️ EFECTOS SECUNDARIOS RECIENTES\n`;
          exportText += `─────────────────────────────────────────────────────────────\n`;
          recentEffects.forEach((effect) => {
            const med = state.medications.find((m) => m.id === effect.medicationId);
            exportText += `   ${effect.date}: ${med?.name || 'Medicamento desconocido'}\n`;
            exportText += `      Síntomas: ${effect.symptoms}\n`;
            exportText += `      Severidad: ${effect.severity}\n`;
            if (effect.notes) exportText += `      Notas: ${effect.notes}\n`;
          });
        }
        
        exportText += `\n═══════════════════════════════════════════════════════════════\n`;
        exportText += `   Generado el: ${new Date().toLocaleString('es-ES')}\n`;
        exportText += `   Este reporte no sustituye el consejo médico profesional.\n`;
        exportText += `═══════════════════════════════════════════════════════════════\n`;
        
        return exportText;
      },
      
      clearAllData: () => {
        set({
          medications: [],
          doseRecords: [],
          sideEffects: [],
          profile: null,
          caregivers: [],
          alerts: [],
          currentView: 'dashboard',
          selectedDate: getToday()
        });
      }
    }),
    {
      name: 'medication-storage',
      version: 2
    }
  )
);

// Función helper para obtener un color para medicamento
export function getNextMedicationColor(existingMedications: Medication[]): string {
  const usedColors = existingMedications.map((m) => m.color);
  const availableColor = MEDICATION_COLORS.find((c) => !usedColors.includes(c));
  return availableColor || MEDICATION_COLORS[Math.floor(Math.random() * MEDICATION_COLORS.length)];
}
