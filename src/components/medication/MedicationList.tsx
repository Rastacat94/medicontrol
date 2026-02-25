'use client';

import { useState } from 'react';
import { useMedicationStore } from '@/store/medication-store';
import { Medication } from '@/types/medication';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Pill, 
  Plus, 
  Edit, 
  Trash2, 
  Power, 
  Search,
  Calendar,
  Clock,
  FileText,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { MedicationForm } from './MedicationForm';

export function MedicationList() {
  const { medications, deleteMedication, toggleMedicationStatus } = useMedicationStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filteredMedications = medications.filter((med) =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.genericName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeMedications = filteredMedications.filter((m) => m.status === 'active');
  const inactiveMedications = filteredMedications.filter((m) => m.status !== 'active');

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    deleteMedication(id);
    setDeleteConfirm(null);
  };

  const handleToggleStatus = (id: string) => {
    toggleMedicationStatus(id);
  };

  const getInstructionLabel = (instruction: string): string => {
    const labels: Record<string, string> = {
      'con_comida': 'Con comida',
      'en_ayunas': 'En ayunas',
      'antes_comer': 'Antes de comer',
      'despues_comer': 'Después de comer',
      'con_agua': 'Con agua',
      'evitar_alcohol': 'Sin alcohol',
      'evitar_lacteos': 'Sin lácteos',
      'evitar_toronja': 'Sin toronja',
    };
    return labels[instruction] || instruction;
  };

  const MedicationCard = ({ medication }: { medication: Medication }) => (
    <Card className={`transition-all hover:shadow-md ${medication.status !== 'active' ? 'opacity-60' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div 
            className="h-12 w-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: medication.color + '20' }}
          >
            <Pill className="h-6 w-6" style={{ color: medication.color }} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">{medication.name}</h3>
                {medication.genericName && (
                  <p className="text-sm text-gray-500">{medication.genericName}</p>
                )}
              </div>
              <Badge variant={medication.status === 'active' ? 'default' : 'secondary'}>
                {medication.status === 'active' ? 'Activo' : 
                 medication.status === 'inactive' ? 'Inactivo' : 'Suspendido'}
              </Badge>
            </div>
            
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <Badge variant="outline">
                {medication.dose} {medication.doseUnit}
              </Badge>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {medication.schedules.join(', ')}
              </span>
            </div>
            
            {medication.instructions.length > 0 && !medication.instructions.includes('ninguna') && (
              <div className="mt-2 flex flex-wrap gap-1">
                {medication.instructions.slice(0, 3).map((inst) => (
                  <Badge key={inst} variant="secondary" className="text-xs">
                    {getInstructionLabel(inst)}
                  </Badge>
                ))}
              </div>
            )}
            
            {medication.notes && (
              <p className="mt-2 text-sm text-gray-600 line-clamp-1">
                <FileText className="h-3 w-3 inline mr-1" />
                {medication.notes}
              </p>
            )}
            
            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Desde {format(new Date(medication.startDate), 'd MMM yyyy', { locale: es })}
              </span>
              
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleStatus(medication.id)}
                  title={medication.status === 'active' ? 'Desactivar' : 'Activar'}
                >
                  <Power className={`h-4 w-4 ${medication.status === 'active' ? 'text-green-600' : 'text-gray-400'}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(medication)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteConfirm(medication.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medicamentos</h2>
          <p className="text-gray-500">
            {medications.length} medicamento{medications.length !== 1 ? 's' : ''} registrado{medications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingMedication(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar medicamento
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <Input
          placeholder="Buscar medicamento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 text-base"
        />
      </div>

      {/* Active medications */}
      {activeMedications.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Pill className="h-5 w-5 text-green-600" />
            Medicamentos activos ({activeMedications.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {activeMedications.map((med) => (
              <MedicationCard key={med.id} medication={med} />
            ))}
          </div>
        </div>
      )}

      {/* Inactive medications */}
      {inactiveMedications.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2">
            <Power className="h-5 w-5 text-gray-400" />
            Medicamentos inactivos ({inactiveMedications.length})
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {inactiveMedications.map((med) => (
              <MedicationCard key={med.id} medication={med} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {filteredMedications.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Pill className="h-16 w-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron medicamentos' : 'No hay medicamentos registrados'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchTerm 
                ? 'Intenta con otro término de búsqueda'
                : 'Comienza agregando tu primer medicamento'
              }
            </p>
            {!searchTerm && (
              <Button 
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar medicamento
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Medication form modal */}
      <MedicationForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingMedication(null);
        }}
        editingMedication={editingMedication}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              ¿Eliminar medicamento?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el medicamento y todo su historial de dosis.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
