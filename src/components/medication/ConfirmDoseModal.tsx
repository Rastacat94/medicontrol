'use client';

import { useMedicationStore } from '@/store/medication-store';
import { MedicationDoseForDay, DoseStatus } from '@/types/medication';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Pill,
  AlertCircle,
  MessageSquare,
  Mic,
  HelpCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { VoiceNoteRecorder } from '@/components/voice-notes/VoiceNoteRecorder';
import { useVoiceNoteStore, type VoiceNote } from '@/store/voice-note-store';
import { DoseConfirmation } from './DoseConfirmation';
import { DifficultyAlertModal } from '@/components/caregiver/DifficultyAlertModal';

interface ConfirmDoseModalProps {
  dose: MedicationDoseForDay;
  open: boolean;
  onClose: () => void;
}

export function ConfirmDoseModal({ dose, open, onClose }: ConfirmDoseModalProps) {
  const { recordDose, updateDoseRecord, selectedDate, caregivers } = useMedicationStore();
  const { addVoiceNote } = useVoiceNoteStore();
  const [notes, setNotes] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DoseStatus | null>(null);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Estados para detección de dificultad
  const [showHelpButton, setShowHelpButton] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  // Detectar si el usuario tarda mucho en confirmar (más de 30 segundos)
  useEffect(() => {
    if (!open) {
      return;
    }
    
    // Mostrar botón de ayuda después de 30 segundos
    const timeout = setTimeout(() => {
      setShowHelpButton(true);
    }, 30000);
    
    return () => {
      clearTimeout(timeout);
      setShowHelpButton(false);
    };
  }, [open]);

  const handleConfirm = (status: DoseStatus) => {
    setSelectedStatus(status);
    
    if (dose.record) {
      // Update existing record
      updateDoseRecord(dose.record.id, {
        status,
        notes: notes || undefined,
        actualTime: status !== 'pending' ? new Date().toISOString() : undefined
      });
    } else {
      // Create new record
      recordDose(dose.medication.id, dose.time, selectedDate, status, notes || undefined);
    }
    
    // Mostrar animación de confirmación SOLO si es "taken"
    if (status === 'taken') {
      setShowConfirmation(true);
      // El modal se cerrará cuando termine la animación
    } else {
      // Para otros estados, cerrar inmediatamente
      setTimeout(() => {
        onClose();
        setNotes('');
        setSelectedStatus(null);
        setShowVoiceRecorder(false);
      }, 300);
    }
  };

  // Callback cuando termina la animación de confirmación
  const handleConfirmationComplete = () => {
    setShowConfirmation(false);
    onClose();
    setNotes('');
    setSelectedStatus(null);
    setShowVoiceRecorder(false);
  };

  // Handler para cuando se crea una nota de voz
  const handleVoiceNoteCreated = (note: VoiceNote) => {
    // La nota ya se guardó en el store
    console.log('Nota de voz creada:', note);
  };

  const getInstructionLabel = (instruction: string): string => {
    const labels: Record<string, string> = {
      'con_comida': 'Con comida',
      'en_ayunas': 'En ayunas',
      'antes_comer': 'Antes de comer',
      'despues_comer': 'Después de comer',
      'con_agua': 'Con agua',
      'evitar_alcohol': 'Evitar alcohol',
      'evitar_lacteos': 'Evitar lácteos',
      'evitar_toronja': 'Evitar toronja',
    };
    return labels[instruction] || instruction;
  };

  const currentTime = new Date().toTimeString().slice(0, 5);
  const isOverdue = dose.status === 'pending' && dose.time < currentTime;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="h-5 w-5 rounded-full"
              style={{ backgroundColor: dose.medication.color }}
            />
            {dose.medication.name}
          </DialogTitle>
          <DialogDescription>
            {dose.medication.genericName && (
              <span className="block text-sm">{dose.medication.genericName}</span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Dose info */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className={`h-6 w-6 ${isOverdue ? 'text-red-500' : 'text-blue-600'}`} />
              <div>
                <span className="text-2xl font-bold">{dose.time}</span>
                {isOverdue && (
                  <Badge variant="destructive" className="ml-2">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    Atrasada
                  </Badge>
                )}
              </div>
            </div>
            <Badge variant="outline" className="text-base px-3 py-1">
              <Pill className="h-4 w-4 mr-1" />
              {dose.dose} {dose.doseUnit}
            </Badge>
          </div>

          {/* Instructions */}
          {dose.medication.instructions.length > 0 && !dose.medication.instructions.includes('ninguna') && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Instrucciones:</p>
              <div className="flex flex-wrap gap-2">
                {dose.medication.instructions.map((inst) => (
                  <Badge key={inst} variant="secondary" className="py-1">
                    {getInstructionLabel(inst)}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {dose.medication.notes && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <span className="font-medium">Nota: </span>
                {dose.medication.notes}
              </p>
            </div>
          )}

          {/* Additional notes input */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Notas adicionales (opcional)
            </label>
            <Textarea
              placeholder="¿Algún comentario sobre esta dosis?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Voice Note Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Nota de voz para el médico
              </label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
                className="text-blue-600"
              >
                {showVoiceRecorder ? 'Ocultar' : 'Grabar'}
              </Button>
            </div>
            
            {showVoiceRecorder && (
              <VoiceNoteRecorder
                medicationId={dose.medication.id}
                medicationName={dose.medication.name}
                doseTime={dose.time}
                doseDate={selectedDate}
                onNoteCreated={handleVoiceNoteCreated}
                compact
              />
            )}
            
            {!showVoiceRecorder && (
              <p className="text-xs text-gray-500">
                💡 Graba cómo te sientes con el medicamento para contárselo a tu médico
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              variant="outline"
              className={`h-16 flex-col gap-1 ${
                dose.status === 'skipped' ? 'border-red-500 bg-red-50' : ''
              }`}
              onClick={() => handleConfirm('skipped')}
              disabled={selectedStatus !== null}
            >
              <XCircle className={`h-6 w-6 ${dose.status === 'skipped' ? 'text-red-500' : ''}`} />
              <span>Omitir</span>
            </Button>
            
            <Button
              size="lg"
              variant="outline"
              className={`h-16 flex-col gap-1 ${
                dose.status === 'postponed' ? 'border-amber-500 bg-amber-50' : ''
              }`}
              onClick={() => handleConfirm('postponed')}
              disabled={selectedStatus !== null}
            >
              <Clock className={`h-6 w-6 ${dose.status === 'postponed' ? 'text-amber-500' : ''}`} />
              <span>Posponer</span>
            </Button>
          </div>

          <Button
            size="lg"
            className={`w-full h-16 text-lg ${
              dose.status === 'taken' 
                ? 'bg-green-500 hover:bg-green-500' 
                : 'bg-green-600 hover:bg-green-700'
            }`}
            onClick={() => handleConfirm('taken')}
            disabled={selectedStatus !== null}
          >
            <CheckCircle2 className="h-6 w-6 mr-2" />
            {dose.status === 'taken' ? '✓ Tomado' : 'Confirmar toma'}
          </Button>

          {dose.record?.actualTime && (
            <p className="text-center text-sm text-gray-500">
              Registrado a las {format(new Date(dose.record.actualTime), 'HH:mm', { locale: es })}
            </p>
          )}
          
          {/* Botón de ayuda - aparece si tarda mucho y tiene cuidadores */}
          {showHelpButton && caregivers.length > 0 && (
            <Button
              variant="outline"
              className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
              onClick={() => setShowHelpModal(true)}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              ¿Necesitas ayuda? Pedir ayuda a mi cuidador
            </Button>
          )}
        </div>
      </DialogContent>

      {/* Animación de confirmación positiva */}
      <DoseConfirmation 
        show={showConfirmation} 
        onComplete={handleConfirmationComplete}
      />
      
      {/* Modal de ayuda al cuidador */}
      <DifficultyAlertModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        context="timeout"
        medicationName={dose.medication.name}
      />
    </Dialog>
  );
}
