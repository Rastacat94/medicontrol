'use client';

import { useState } from 'react';
import { useMedicationStore } from '@/store/medication-store';
import { Medication } from '@/types/medication';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Minus, 
  Edit3,
  MapPin,
  Bell,
  Pill,
  TrendingDown,
  ShoppingCart,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryWarning
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { StockBattery } from './StockBattery';

interface InventoryViewProps {
  onShowPharmacyFinder?: () => void;
}

export function InventoryView({ onShowPharmacyFinder }: InventoryViewProps) {
  const { 
    medications, 
    updateStock, 
    getLowStockMedications,
    caregivers,
    sendAlertToCaregiver
  } = useMedicationStore();
  
  const [editingStock, setEditingStock] = useState<Medication | null>(null);
  const [newStock, setNewStock] = useState('');
  const [showLowStockAlert, setShowLowStockAlert] = useState(false);
  const [selectedMedForAlert, setSelectedMedForAlert] = useState<Medication | null>(null);

  const activeMedications = medications.filter(m => m.status === 'active');
  const lowStockMeds = getLowStockMedications();

  const handleUpdateStock = (medication: Medication, operation: 'add' | 'subtract' | 'set') => {
    const quantity = parseInt(newStock) || 0;
    if (operation === 'set' && quantity < 0) return;
    
    if (operation === 'set') {
      updateStock(medication.id, quantity, 'set');
    } else if (operation === 'add') {
      updateStock(medication.id, medication.dose, 'add');
    } else if (operation === 'subtract') {
      updateStock(medication.id, medication.dose, 'subtract');
    }
    
    setEditingStock(null);
    setNewStock('');
  };

  const getStockStatus = (med: Medication) => {
    const stock = med.stock ?? 0;
    const threshold = med.lowStockThreshold ?? 5;
    
    if (stock === 0) return { status: 'empty', color: 'red', label: 'Sin stock' };
    if (stock <= threshold) return { status: 'low', color: 'amber', label: 'Stock bajo' };
    return { status: 'ok', color: 'green', label: 'Stock OK' };
  };

  const getDaysRemaining = (med: Medication) => {
    const stock = med.stock ?? 0;
    const dailyDoses = med.schedules.length;
    const dosePerTake = med.dose;
    
    if (dailyDoses === 0) return Infinity;
    
    const dailyConsumption = dailyDoses * dosePerTake;
    return Math.floor(stock / dailyConsumption);
  };

  const handleNotifyCaregiver = (med: Medication) => {
    const primaryCaregiver = caregivers.find(c => c.receiveAlerts);
    if (primaryCaregiver) {
      const message = `⚠️ ALERTA DE STOCK BAJO\n\n` +
        `El medicamento ${med.name} tiene stock bajo (${med.stock} ${med.stockUnit || med.doseUnit} restantes).\n` +
        `Por favor, ayuda a reabastecer.`;
      
      sendAlertToCaregiver(primaryCaregiver.id, message);
      alert(`Notificación enviada a ${primaryCaregiver.name}`);
    } else {
      alert('No hay cuidadores configurados. Agrega uno en Configuración.');
    }
  };

  const MedicationStockCard = ({ medication }: { medication: Medication }) => {
    const stockStatus = getStockStatus(medication);
    const daysRemaining = getDaysRemaining(medication);
    const stock = medication.stock ?? 0;
    const threshold = medication.lowStockThreshold ?? 5;

    return (
      <Card className={`transition-all ${stockStatus.status === 'low' ? 'border-amber-300 bg-amber-50' : stockStatus.status === 'empty' ? 'border-red-300 bg-red-50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div 
                className="h-10 w-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: medication.color + '20' }}
              >
                <Pill className="h-5 w-5" style={{ color: medication.color }} />
              </div>
              <div>
                <h3 className="font-semibold">{medication.name}</h3>
                <p className="text-sm text-gray-500">
                  {medication.dose} {medication.doseUnit} • {medication.schedules.length}x/día
                </p>
              </div>
            </div>
            <Badge variant={
              stockStatus.status === 'empty' ? 'destructive' :
              stockStatus.status === 'low' ? 'default' : 'secondary'
            }>
              {stockStatus.label}
            </Badge>
          </div>

          {/* Stock Battery - Barra tipo batería */}
          <div className="mb-3">
            <StockBattery medication={medication} size="md" />
          </div>

          {/* Info adicional */}
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <span>Umbral: {threshold} unidades</span>
            <span>
              {daysRemaining === Infinity ? '∞ días' : 
               daysRemaining <= 0 ? 'Sin stock' :
               `~${daysRemaining} días restantes`}
            </span>
          </div>

          {/* Quick actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingStock(medication);
                setNewStock('');
              }}
              className="flex-1"
            >
              <Edit3 className="h-4 w-4 mr-1" />
              Ajustar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStock(medication.id, medication.dose, 'subtract')}
              disabled={stock <= 0}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateStock(medication.id, medication.dose, 'add')}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Low stock warning */}
          {stockStatus.status === 'low' && (
            <div className="mt-3 p-2 bg-amber-100 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2 text-amber-800 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Te quedan aproximadamente {daysRemaining} días</span>
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => handleNotifyCaregiver(medication)}
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Avisar cuidador
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={onShowPharmacyFinder}
                >
                  <MapPin className="h-3 w-3 mr-1" />
                  Farmacia cercana
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inventario</h2>
          <p className="text-gray-500">Controla el stock de tus medicamentos</p>
        </div>
        {lowStockMeds.length > 0 && (
          <Button 
            variant="destructive"
            onClick={() => setShowLowStockAlert(true)}
            className="animate-pulse"
          >
            <AlertTriangle className="h-4 w-4 mr-2" />
            {lowStockMeds.length} bajo stock
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Medicamentos</p>
                <p className="text-2xl font-bold">{activeMedications.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Stock OK</p>
                <p className="text-2xl font-bold">
                  {activeMedications.filter(m => (m.stock ?? 0) > (m.lowStockThreshold ?? 5)).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <TrendingDown className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Stock bajo</p>
                <p className="text-2xl font-bold">{lowStockMeds.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Sin stock</p>
                <p className="text-2xl font-bold">
                  {activeMedications.filter(m => (m.stock ?? 0) === 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Low stock alert */}
      {lowStockMeds.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" />
              ¡Atención! Tienes {lowStockMeds.length} medicamento{lowStockMeds.length > 1 ? 's' : ''} con stock bajo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
              {lowStockMeds.map(med => (
                <Badge key={med.id} variant="secondary">
                  {med.name} ({med.stock} {med.stockUnit || med.doseUnit})
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (caregivers.length > 0) {
                    lowStockMeds.forEach(med => handleNotifyCaregiver(med));
                  } else {
                    alert('Agrega un cuidador en Configuración para enviar alertas.');
                  }
                }}
              >
                <Bell className="h-4 w-4 mr-2" />
                Avisar a cuidador
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onShowPharmacyFinder}
              >
                <MapPin className="h-4 w-4 mr-2" />
                Buscar farmacia
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Medications grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {activeMedications.length === 0 ? (
          <Card className="col-span-2 text-center py-12">
            <CardContent>
              <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay medicamentos registrados
              </h3>
              <p className="text-gray-500">
                Agrega medicamentos para controlar su inventario
              </p>
            </CardContent>
          </Card>
        ) : (
          activeMedications.map(med => (
            <MedicationStockCard key={med.id} medication={med} />
          ))
        )}
      </div>

      {/* Edit stock dialog */}
      <Dialog open={!!editingStock} onOpenChange={() => setEditingStock(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar stock de {editingStock?.name}</DialogTitle>
            <DialogDescription>
              Ingresa la cantidad actual disponible
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cantidad</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  placeholder={editingStock?.stock?.toString() || '0'}
                  className="flex-1"
                />
                <Select 
                  value={editingStock?.stockUnit || editingStock?.doseUnit || 'pastillas'}
                  onValueChange={(v) => {
                    if (editingStock) {
                      // Update the stockUnit in the medication
                    }
                  }}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pastillas">Pastillas</SelectItem>
                    <SelectItem value="capsulas">Cápsulas</SelectItem>
                    <SelectItem value="mg">mg</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="gotas">Gotas</SelectItem>
                    <SelectItem value="unidades">Unidades</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setEditingStock(null)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => editingStock && handleUpdateStock(editingStock, 'set')}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pharmacy finder placeholder */}
      {onShowPharmacyFinder && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-6 w-6 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-800">¿Necesitas medicamentos?</p>
                <p className="text-sm text-blue-600">Encuentra la farmacia más cercana</p>
              </div>
              <Button onClick={onShowPharmacyFinder}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Buscar farmacia
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
