'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Pill, Camera, Edit3, Clock, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMedicationStore, getNextMedicationColor } from '@/store/medication-store';
import { Medication } from '@/types/medication';

interface MedicationStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onScanRequest: () => void;
  scannedData?: Partial<Medication>;
}

export function MedicationStep({ 
  onNext, 
  onBack, 
  onSkip, 
  onScanRequest,
  scannedData 
}: MedicationStepProps) {
  const { medications, addMedication } = useMedicationStore();
  const [inputMode, setInputMode] = useState<'choose' | 'scan' | 'manual'>(
    scannedData ? 'manual' : 'choose'
  );
  const [name, setName] = useState(scannedData?.name || '');
  const [dose, setDose] = useState(scannedData?.dose?.toString() || '1');
  const [time, setTime] = useState('08:00');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMedication = () => {
    if (!name.trim()) return;

    setIsAdding(true);
    
    // Add medication with basic schedule
    addMedication({
      name: name.trim(),
      dose: parseFloat(dose) || 1,
      doseUnit: scannedData?.doseUnit || 'pastillas',
      frequencyType: 'veces_dia',
      frequencyValue: 1,
      schedules: [time],
      instructions: [],
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      color: getNextMedicationColor(medications),
      stock: scannedData?.stock || 0,
      stockUnit: scannedData?.stockUnit || scannedData?.doseUnit || 'pastillas',
    });

    // Small delay for visual feedback
    setTimeout(() => {
      setIsAdding(false);
      onNext();
    }, 500);
  };

  const handleScanClick = () => {
    setInputMode('scan');
    onScanRequest();
  };

  // If we got scanned data, switch to manual mode to show it
  if (scannedData && inputMode === 'choose') {
    setInputMode('manual');
    setName(scannedData.name || '');
    setDose(scannedData.dose?.toString() || '1');
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-[70vh] px-4 py-6"
    >
      {/* Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Pill className="w-10 h-10 text-green-600" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Agrega tu primer medicamento
        </h2>
        <p className="text-lg text-gray-600">
          Puedes agregar más después
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full">
        {inputMode === 'choose' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-4"
          >
            {/* Scan option */}
            <Button
              variant="outline"
              onClick={handleScanClick}
              className="h-20 md:h-24 flex flex-col gap-2 border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl"
            >
              <Camera className="w-8 h-8 text-blue-600" />
              <span className="text-lg md:text-xl font-medium">Escanear caja</span>
              <span className="text-sm text-gray-500">La cámara detectará el nombre</span>
            </Button>

            {/* Manual option */}
            <Button
              variant="outline"
              onClick={() => setInputMode('manual')}
              className="h-20 md:h-24 flex flex-col gap-2 border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-xl"
            >
              <Edit3 className="w-8 h-8 text-green-600" />
              <span className="text-lg md:text-xl font-medium">Escribir nombre</span>
              <span className="text-sm text-gray-500">Ingresar manualmente</span>
            </Button>
          </motion.div>
        )}

        {inputMode === 'manual' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-5"
          >
            {/* Back to options */}
            <Button
              variant="ghost"
              onClick={() => setInputMode('choose')}
              className="self-start text-base text-gray-500 hover:text-gray-700"
            >
              ← Cambiar método
            </Button>

            {/* Scanned data indicator */}
            {scannedData && (
              <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                <AlertCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-700">
                  Datos detectados de la imagen
                </span>
              </div>
            )}

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="med-name" className="text-lg font-medium text-gray-700">
                Nombre del medicamento
              </Label>
              <div className="relative">
                <Pill className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Input
                  id="med-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Metformina"
                  className="h-14 pl-12 text-lg md:text-xl border-2 focus:border-green-500 rounded-xl"
                />
              </div>
            </div>

            {/* Dose */}
            <div className="space-y-2">
              <Label htmlFor="med-dose" className="text-lg font-medium text-gray-700">
                Dosis (cantidad)
              </Label>
              <Input
                id="med-dose"
                type="number"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="Ej: 1"
                min="0.25"
                step="0.25"
                className="h-14 text-lg md:text-xl border-2 focus:border-green-500 rounded-xl text-center"
              />
            </div>

            {/* Time */}
            <div className="space-y-2">
              <Label htmlFor="med-time" className="text-lg font-medium text-gray-700">
                ¿A qué hora?
              </Label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
                <Input
                  id="med-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="h-14 pl-12 text-lg md:text-xl border-2 focus:border-green-500 rounded-xl"
                />
              </div>
            </div>

            {/* Helper text */}
            <p className="text-center text-gray-500 text-base bg-gray-50 p-3 rounded-lg">
              💡 Puedes agregar más medicamentos y horarios después
            </p>
          </motion.div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 mt-6 max-w-md mx-auto w-full">
        {inputMode === 'manual' && (
          <Button
            onClick={handleAddMedication}
            disabled={!name.trim() || isAdding}
            className="h-14 md:h-16 text-xl md:text-2xl font-semibold bg-green-600 hover:bg-green-700 rounded-xl shadow-lg disabled:opacity-50"
          >
            {isAdding ? (
              'Agregando...'
            ) : (
              <>
                <Plus className="w-6 h-6 mr-2" />
                Agregar y continuar
              </>
            )}
          </Button>
        )}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12 text-base md:text-lg rounded-xl"
          >
            Atrás
          </Button>
          <Button
            variant="ghost"
            onClick={onSkip}
            className="flex-1 h-12 text-base text-gray-500 hover:text-gray-700"
          >
            Omitir por ahora
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
