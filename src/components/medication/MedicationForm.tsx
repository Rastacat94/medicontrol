'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMedicationStore, getNextMedicationColor } from '@/store/medication-store';
import { Medication, InstructionType, DoseUnit, FrequencyType } from '@/types/medication';
import { checkNewMedicationInteractions } from '@/data/interactions';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Pill, 
  Plus, 
  AlertTriangle,
  X,
  Clock,
  Save,
  Package,
  Heart,
  Bell,
  HelpCircle
} from 'lucide-react';
import { DifficultyAlertModal } from '@/components/caregiver/DifficultyAlertModal';

interface MedicationFormProps {
  open: boolean;
  onClose: () => void;
  editingMedication?: Medication | null;
  scannedData?: Partial<Medication>;
}

const DOSE_UNITS: { value: DoseUnit; label: string }[] = [
  { value: 'mg', label: 'Miligramos (mg)' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'pastillas', label: 'Pastillas' },
  { value: 'capsulas', label: 'Cápsulas' },
  { value: 'gotas', label: 'Gotas' },
  { value: 'g', label: 'Gramos (g)' },
  { value: 'unidades', label: 'Unidades' },
];

const INSTRUCTIONS: { value: InstructionType; label: string }[] = [
  { value: 'con_comida', label: 'Con comida' },
  { value: 'en_ayunas', label: 'En ayunas' },
  { value: 'antes_comer', label: 'Antes de comer' },
  { value: 'despues_comer', label: 'Después de comer' },
  { value: 'con_agua', label: 'Con agua' },
  { value: 'evitar_alcohol', label: 'Evitar alcohol' },
  { value: 'evitar_lacteos', label: 'Evitar lácteos' },
  { value: 'evitar_toronja', label: 'Evitar toronja' },
  { value: 'ninguna', label: 'Sin instrucciones especiales' },
];

export function MedicationForm({ open, onClose, editingMedication, scannedData }: MedicationFormProps) {
  const { medications, addMedication, updateMedication, caregivers } = useMedicationStore();
  
  // Form state
  const [name, setName] = useState('');
  const [genericName, setGenericName] = useState('');
  const [dose, setDose] = useState('');
  const [doseUnit, setDoseUnit] = useState<DoseUnit>('mg');
  const [frequencyType, setFrequencyType] = useState<FrequencyType>('veces_dia');
  const [frequencyValue, setFrequencyValue] = useState('1');
  const [schedules, setSchedules] = useState<string[]>(['08:00']);
  const [instructions, setInstructions] = useState<InstructionType[]>([]);
  const [notes, setNotes] = useState('');
  const [prescribedBy, setPrescribedBy] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<'active' | 'inactive'>('active');
  
  // New fields for inventory and alerts
  const [stock, setStock] = useState('');
  const [stockUnit, setStockUnit] = useState<DoseUnit>('pastillas');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [isCritical, setIsCritical] = useState(false);
  const [criticalAlertDelay, setCriticalAlertDelay] = useState('60');
  
  // Interaction warnings
  const [interactions, setInteractions] = useState<ReturnType<typeof checkNewMedicationInteractions>>([]);
  
  // Difficulty detection - Ayuda al cuidador
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showHelpButton, setShowHelpButton] = useState(false);
  const [cancelCount, setCancelCount] = useState(0);
  
  // Detectar si tarda mucho (más de 45 segundos)
  useEffect(() => {
    if (!open) {
      return;
    }
    
    // Mostrar botón de ayuda después de 45 segundos
    const timeout = setTimeout(() => {
      setShowHelpButton(true);
    }, 45000);
    
    return () => {
      clearTimeout(timeout);
      setShowHelpButton(false);
      setCancelCount(0);
    };
  }, [open]);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => {
        const dataToUse = editingMedication || scannedData;
        
        if (dataToUse) {
          setName(dataToUse.name || '');
          setGenericName(dataToUse.genericName || '');
          setDose(dataToUse.dose?.toString() || '');
          setDoseUnit(dataToUse.doseUnit || 'mg');
          
          if ('frequencyType' in dataToUse && dataToUse.frequencyType) {
            setFrequencyType(dataToUse.frequencyType);
            setFrequencyValue(dataToUse.frequencyValue?.toString() || '1');
            setSchedules(dataToUse.schedules || ['08:00']);
          }
          
          if ('instructions' in dataToUse && dataToUse.instructions) {
            setInstructions(dataToUse.instructions);
          }
          
          setNotes(dataToUse.notes || '');
          setPrescribedBy(dataToUse.prescribedBy || '');
          setStartDate(dataToUse.startDate || new Date().toISOString().split('T')[0]);
          setEndDate(dataToUse.endDate || '');
          setStatus(dataToUse.status === 'suspended' ? 'inactive' : (dataToUse.status || 'active'));
          
          // Inventory and alerts
          setStock(dataToUse.stock?.toString() || '');
          setStockUnit(dataToUse.stockUnit || dataToUse.doseUnit || 'pastillas');
          setLowStockThreshold(dataToUse.lowStockThreshold?.toString() || '5');
          setIsCritical(dataToUse.isCritical || false);
          setCriticalAlertDelay(dataToUse.criticalAlertDelay?.toString() || '60');
        } else {
          // Reset to defaults
          setName('');
          setGenericName('');
          setDose('');
          setDoseUnit('mg');
          setFrequencyType('veces_dia');
          setFrequencyValue('1');
          setSchedules(['08:00']);
          setInstructions([]);
          setNotes('');
          setPrescribedBy('');
          setStartDate(new Date().toISOString().split('T')[0]);
          setEndDate('');
          setStatus('active');
          setStock('');
          setStockUnit('pastillas');
          setLowStockThreshold('5');
          setIsCritical(false);
          setCriticalAlertDelay('60');
        }
        setInteractions([]);
      });
    }
  }, [open, editingMedication, scannedData]);

  // Check interactions when name changes
  useEffect(() => {
    if (name.length >= 3) {
      const existingNames = medications
        .filter(m => m.status === 'active' && m.id !== editingMedication?.id)
        .map(m => m.name);
      const found = checkNewMedicationInteractions(name, existingNames);
      requestAnimationFrame(() => {
        setInteractions(found);
      });
    } else {
      requestAnimationFrame(() => {
        setInteractions([]);
      });
    }
  }, [name, medications, editingMedication]);

  const addSchedule = () => {
    const lastTime = schedules[schedules.length - 1];
    const [hours] = lastTime.split(':').map(Number);
    const newHours = Math.min(hours + 8, 23);
    const newTime = `${newHours.toString().padStart(2, '0')}:00`;
    setSchedules([...schedules, newTime]);
  };

  const removeSchedule = (index: number) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter((_, i) => i !== index));
    }
  };

  const updateSchedule = (index: number, value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index] = value;
    setSchedules(newSchedules.sort());
  };

  const toggleInstruction = (instruction: InstructionType) => {
    if (instruction === 'ninguna') {
      setInstructions([instruction]);
    } else {
      setInstructions(prev => {
        const filtered = prev.filter(i => i !== 'ninguna');
        if (filtered.includes(instruction)) {
          return filtered.filter(i => i !== instruction);
        }
        return [...filtered, instruction];
      });
    }
  };

  const handleSubmit = () => {
    if (!name || !dose || schedules.length === 0) return;

    const medicationData = {
      name,
      genericName: genericName || undefined,
      dose: parseFloat(dose),
      doseUnit,
      frequencyType,
      frequencyValue: parseInt(frequencyValue),
      schedules: schedules.sort(),
      instructions,
      notes: notes || undefined,
      prescribedBy: prescribedBy || undefined,
      startDate,
      endDate: endDate || undefined,
      status: status as 'active' | 'inactive',
      color: editingMedication?.color || getNextMedicationColor(medications),
      // Inventory
      stock: stock ? parseInt(stock) : 0,
      stockUnit: stockUnit,
      lowStockThreshold: lowStockThreshold ? parseInt(lowStockThreshold) : 5,
      // Critical alert settings
      isCritical,
      criticalAlertDelay: criticalAlertDelay ? parseInt(criticalAlertDelay) : 60
    };

    if (editingMedication) {
      updateMedication(editingMedication.id, medicationData);
    } else {
      addMedication(medicationData);
    }

    onClose();
  };

  // Detectar cancelación para mostrar ayuda
  const handleCancel = () => {
    const newCount = cancelCount + 1;
    setCancelCount(newCount);
    
    // Si cancela 2+ veces, mostrar opción de ayuda
    if (newCount >= 2 && caregivers.length > 0) {
      setShowHelpModal(true);
    } else {
      onClose();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'grave': return 'border-red-500 bg-red-50';
      case 'moderada': return 'border-orange-500 bg-orange-50';
      case 'leve': return 'border-yellow-500 bg-yellow-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            {editingMedication ? 'Editar medicamento' : scannedData ? 'Confirmar medicamento escaneado' : 'Agregar medicamento'}
          </DialogTitle>
          <DialogDescription>
            {scannedData ? 'Revisa los datos detectados y completa la información faltante' : 'Completa la información del medicamento. Los campos marcados con * son obligatorios.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Interaction warnings */}
          {interactions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-600 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                ¡Alerta de interacciones!
              </h4>
              {interactions.map((interaction) => (
                <Card key={interaction.id} className={`border-2 ${getSeverityColor(interaction.severity)}`}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant={
                          interaction.severity === 'grave' ? 'destructive' :
                          interaction.severity === 'moderada' ? 'default' : 'secondary'
                        }>
                          {interaction.severity.toUpperCase()}
                        </Badge>
                        <p className="mt-1 text-sm font-medium">{interaction.description}</p>
                        <p className="mt-1 text-xs text-gray-600">{interaction.recommendation}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Scanned data indicator */}
          {scannedData && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 text-green-800">
                  <Pill className="h-4 w-4" />
                  <span className="font-medium">Datos detectados por IA</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre del medicamento *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Metformina, Losartán..."
                className="text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="genericName">Nombre genérico (opcional)</Label>
              <Input
                id="genericName"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="Ej: Metformina hidrocloruro"
                className="text-base"
              />
            </div>
          </div>

          {/* Dose */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dose">Dosis *</Label>
              <Input
                id="dose"
                type="number"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                placeholder="500"
                className="text-base"
                min="0"
                step="0.1"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="doseUnit">Unidad</Label>
              <Select value={doseUnit} onValueChange={(v) => setDoseUnit(v as DoseUnit)}>
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOSE_UNITS.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Frequency */}
          <div className="space-y-3">
            <Label>Frecuencia</Label>
            <div className="flex gap-4">
              <Select value={frequencyType} onValueChange={(v) => setFrequencyType(v as FrequencyType)}>
                <SelectTrigger className="w-48 text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="veces_dia">Veces al día</SelectItem>
                  <SelectItem value="horas">Cada X horas</SelectItem>
                  <SelectItem value="especifico">Horarios específicos</SelectItem>
                </SelectContent>
              </Select>
              
              {frequencyType !== 'especifico' && (
                <Input
                  type="number"
                  value={frequencyValue}
                  onChange={(e) => setFrequencyValue(e.target.value)}
                  className="w-24 text-base"
                  min="1"
                  max="24"
                />
              )}
            </div>
          </div>

          {/* Schedules */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horarios *
              </Label>
              <Button type="button" variant="outline" size="sm" onClick={addSchedule}>
                <Plus className="h-4 w-4 mr-1" />
                Agregar horario
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {schedules.map((schedule, index) => (
                <div key={index} className="flex items-center gap-1">
                  <Input
                    type="time"
                    value={schedule}
                    onChange={(e) => updateSchedule(index, e.target.value)}
                    className="w-32 text-base"
                  />
                  {schedules.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSchedule(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <Label>Instrucciones especiales</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {INSTRUCTIONS.map((instruction) => (
                <label
                  key={instruction.value}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                    instructions.includes(instruction.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Checkbox
                    checked={instructions.includes(instruction.value)}
                    onCheckedChange={() => toggleInstruction(instruction.value)}
                  />
                  <span className="text-sm">{instruction.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Inventory Section */}
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium">Control de inventario</h4>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock inicial</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stockUnit">Unidad</Label>
                  <Select value={stockUnit} onValueChange={(v) => setStockUnit(v as DoseUnit)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DOSE_UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value}>
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="threshold">Alerta si queda</Label>
                  <Input
                    id="threshold"
                    type="number"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    placeholder="5"
                    min="1"
                  />
                </div>
              </div>
              
              <p className="text-xs text-gray-500">
                El stock se descuenta automáticamente cada vez que marcas una dosis como "Tomada"
              </p>
            </CardContent>
          </Card>

          {/* Critical Medication Section */}
          <Card className={isCritical ? 'border-red-200 bg-red-50' : ''}>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className={`h-5 w-5 ${isCritical ? 'text-red-600' : 'text-gray-400'}`} />
                  <div>
                    <h4 className="font-medium">Medicamento crítico</h4>
                    <p className="text-xs text-gray-500">
                      Activa alertas si se olvida una dosis
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isCritical}
                  onCheckedChange={setIsCritical}
                />
              </div>
              
              {isCritical && (
                <div className="space-y-3 pt-2 border-t">
                  <div className="flex items-center gap-2 text-red-600">
                    <Bell className="h-4 w-4" />
                    <span className="text-sm font-medium">Alertar al cuidador después de:</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={criticalAlertDelay}
                      onChange={(e) => setCriticalAlertDelay(e.target.value)}
                      className="w-20"
                      min="5"
                      max="180"
                    />
                    <span className="text-sm text-gray-600">minutos de retraso</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes and prescriber */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prescribedBy">Prescrito por</Label>
              <Input
                id="prescribedBy"
                value={prescribedBy}
                onChange={(e) => setPrescribedBy(e.target.value)}
                placeholder="Dr. / Dra. Nombre"
                className="text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as 'active' | 'inactive')}>
                <SelectTrigger className="text-base">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha de inicio</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-base"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha de fin (opcional)</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-base"
              />
            </div>
          </div>

          {/* Additional notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notas adicionales</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Cualquier información relevante sobre este medicamento..."
              className="text-base"
              rows={3}
            />
          </div>

          {/* Submit buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!name || !dose || schedules.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingMedication ? 'Guardar cambios' : 'Agregar medicamento'}
            </Button>
          </div>
        </div>

        {/* Botón flotante de ayuda */}
        {showHelpButton && caregivers.length > 0 && (
          <Button
            onClick={() => setShowHelpModal(true)}
            className="fixed bottom-24 right-4 z-50 h-14 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg rounded-full animate-in slide-in-from-right duration-300"
          >
            <HelpCircle className="h-5 w-5 mr-2" />
            Pedir ayuda
          </Button>
        )}
      </DialogContent>

      {/* Modal de ayuda para cuidador */}
      <DifficultyAlertModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        context="medication_form"
        medicationName={name || 'el medicamento'}
      />
    </Dialog>
  );
}
