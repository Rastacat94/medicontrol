'use client';

import { useState, useEffect } from 'react';
import { useMedicationStore } from '@/store/medication-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  AlertTriangle, 
  Bell, 
  Plus, 
  Trash2, 
  User,
  Phone,
  Mail,
  Clock,
  Pill,
  Shield,
  Heart,
  Send,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Caregiver } from '@/types/medication';

export function AlertsView() {
  const { 
    caregivers, 
    alerts,
    addCaregiver,
    updateCaregiver,
    deleteCaregiver,
    addAlert,
    deleteAlert,
    medications,
    checkMissedDoses,
    sendAlertToCaregiver
  } = useMedicationStore();
  
  const [showAddCaregiver, setShowAddCaregiver] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [showPanicConfirm, setShowPanicConfirm] = useState(false);
  const [panicMessage, setPanicMessage] = useState('');
  
  // Caregiver form
  const [cgName, setCgName] = useState('');
  const [cgPhone, setCgPhone] = useState('');
  const [cgEmail, setCgEmail] = useState('');
  const [cgRelationship, setCgRelationship] = useState('');
  
  // Alert form
  const [alertCaregiverId, setAlertCaregiverId] = useState('');
  const [alertType, setAlertType] = useState<'missed_dose' | 'low_stock' | 'panic_button'>('missed_dose');
  const [alertDelay, setAlertDelay] = useState('60');

  // Check for missed doses
  const [missedDoses, setMissedDoses] = useState<ReturnType<typeof checkMissedDoses>>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      requestAnimationFrame(() => {
        setMissedDoses(checkMissedDoses());
      });
    }, 60000); // Check every minute
    
    requestAnimationFrame(() => {
      setMissedDoses(checkMissedDoses());
    });
    
    return () => clearInterval(interval);
  }, [checkMissedDoses]);

  const handleAddCaregiver = () => {
    if (!cgName || !cgPhone) return;
    
    addCaregiver({
      name: cgName,
      phone: cgPhone,
      email: cgEmail || undefined,
      relationship: cgRelationship || 'Cuidador',
      receiveAlerts: true
    });
    
    setCgName('');
    setCgPhone('');
    setCgEmail('');
    setCgRelationship('');
    setShowAddCaregiver(false);
  };

  const handleAddAlert = () => {
    if (!alertCaregiverId) return;
    
    addAlert({
      caregiverId: alertCaregiverId,
      alertType: alertType,
      delayMinutes: parseInt(alertDelay),
      enabled: true
    });
    
    setShowAddAlert(false);
  };

  const handlePanicButton = () => {
    if (caregivers.length === 0) {
      alert('No hay cuidadores configurados. Agrega uno primero.');
      return;
    }
    
    const primaryCaregiver = caregivers.find(c => c.receiveAlerts);
    if (!primaryCaregiver) {
      alert('No hay cuidadores con alertas activadas.');
      return;
    }
    
    const message = `🚨 BOTÓN DE PÁNICO ACTIVADO\n\n` +
      `El usuario ha activado el botón de pánico.\n` +
      `Hora: ${format(new Date(), "HH:mm")}\n` +
      `Fecha: ${format(new Date(), "d 'de' MMMM", { locale: es })}\n\n` +
      (panicMessage ? `Mensaje: ${panicMessage}` : 'Por favor, contacta inmediatamente.');
    
    sendAlertToCaregiver(primaryCaregiver.id, message);
    
    // Simular envío
    alert(`🚨 Alerta enviada a ${primaryCaregiver.name}\n\nMensaje: ${message}`);
    setShowPanicConfirm(false);
    setPanicMessage('');
  };

  const criticalMeds = medications.filter(m => m.isCritical && m.status === 'active');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Alertas y Cuidadores</h2>
        <p className="text-gray-500">Configura quién recibe alertas cuando hay problemas</p>
      </div>

      {/* Panic Button */}
      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-red-800">
            <Shield className="h-5 w-5" />
            Botón de Pánico
          </CardTitle>
          <CardDescription className="text-red-600">
            Activa esta alerta de emergencia para notificar a tu cuidador inmediatamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            size="lg"
            className="w-full h-16 text-lg bg-red-600 hover:bg-red-700 animate-pulse"
            onClick={() => setShowPanicConfirm(true)}
          >
            <AlertTriangle className="h-6 w-6 mr-2" />
            ACTIVAR ALERTA DE EMERGENCIA
          </Button>
        </CardContent>
      </Card>

      {/* Missed Doses Alert */}
      {missedDoses.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800">
              <Clock className="h-5 w-5" />
              ⚠️ Dosis Críticas Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {missedDoses.map((dose, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded-lg">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-red-600" />
                    <span className="font-medium">{dose.medicationName}</span>
                    <Badge variant="outline">{dose.scheduledTime}</Badge>
                  </div>
                  <Badge variant="destructive">
                    {dose.minutesLate} min tarde
                  </Badge>
                </div>
              ))}
            </div>
            <Button
              className="w-full mt-3"
              variant="outline"
              onClick={() => {
                const primaryCaregiver = caregivers.find(c => c.receiveAlerts);
                if (primaryCaregiver) {
                  const message = `⚠️ ALERTA DE DOSIS OMITIDA\n\n` +
                    `El usuario no ha confirmado las siguientes dosis críticas:\n\n` +
                    missedDoses.map(d => `• ${d.medicationName} (${d.scheduledTime}) - ${d.minutesLate} min de retraso`).join('\n');
                  
                  sendAlertToCaregiver(primaryCaregiver.id, message);
                  alert(`Alerta enviada a ${primaryCaregiver.name}`);
                }
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Notificar a cuidador ahora
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Critical Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            Medicamentos Críticos
          </CardTitle>
          <CardDescription>
            Estos medicamentos activarán alertas si no se confirman a tiempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          {criticalMeds.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p>No hay medicamentos marcados como críticos.</p>
              <p className="text-sm">Marca medicamentos como críticos al agregarlos o editarlos.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {criticalMeds.map(med => (
                <div key={med.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: med.color }}
                    />
                    <div>
                      <p className="font-medium">{med.name}</p>
                      <p className="text-xs text-gray-500">
                        Alerta tras {med.criticalAlertDelay || 60} min de retraso
                      </p>
                    </div>
                  </div>
                  <Badge variant="destructive">Crítico</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Caregivers */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Cuidadores
              </CardTitle>
              <CardDescription>
                Personas que recibirán las alertas
              </CardDescription>
            </div>
            <Button size="sm" onClick={() => setShowAddCaregiver(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {caregivers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay cuidadores configurados</p>
              <p className="text-sm">Agrega un cuidador para recibir alertas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {caregivers.map((cg) => (
                <div key={cg.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">{cg.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Phone className="h-3 w-3" />
                        {cg.phone}
                        <span>•</span>
                        <span>{cg.relationship}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={cg.receiveAlerts ? 'default' : 'secondary'}>
                      {cg.receiveAlerts ? 'Alertas ON' : 'Alertas OFF'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteCaregiver(cg.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configured Alerts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Reglas de Alerta
              </CardTitle>
              <CardDescription>
                Configura cuándo y cómo se envían las alertas
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => setShowAddAlert(true)}
              disabled={caregivers.length === 0}
            >
              <Plus className="h-4 w-4 mr-1" />
              Agregar regla
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p>No hay reglas configuradas</p>
              <p className="text-sm">Las alertas automáticas están activas por defecto</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => {
                const caregiver = caregivers.find(c => c.id === alert.caregiverId);
                return (
                  <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">
                        {alert.alertType === 'missed_dose' ? 'Dosis omitida' :
                         alert.alertType === 'low_stock' ? 'Stock bajo' : 'Botón de pánico'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Para: {caregiver?.name || 'Desconocido'} • 
                        Esperar: {alert.delayMinutes} min
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={alert.enabled ? 'default' : 'secondary'}>
                        {alert.enabled ? 'Activa' : 'Inactiva'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteAlert(alert.id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Caregiver Dialog */}
      <Dialog open={showAddCaregiver} onOpenChange={setShowAddCaregiver}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Cuidador</DialogTitle>
            <DialogDescription>
              Esta persona recibirá alertas cuando haya problemas con tus medicamentos
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nombre completo *</Label>
              <Input
                value={cgName}
                onChange={(e) => setCgName(e.target.value)}
                placeholder="Ej: María García"
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono *</Label>
              <Input
                value={cgPhone}
                onChange={(e) => setCgPhone(e.target.value)}
                placeholder="+34 612 345 678"
              />
            </div>
            <div className="space-y-2">
              <Label>Email (opcional)</Label>
              <Input
                type="email"
                value={cgEmail}
                onChange={(e) => setCgEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Relación</Label>
              <Select value={cgRelationship} onValueChange={setCgRelationship}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hijo/a">Hijo/a</SelectItem>
                  <SelectItem value="Cónyuge">Cónyuge</SelectItem>
                  <SelectItem value="Padre/Madre">Padre/Madre</SelectItem>
                  <SelectItem value="Hermano/a">Hermano/a</SelectItem>
                  <SelectItem value="Cuidador">Cuidador profesional</SelectItem>
                  <SelectItem value="Amigo/a">Amigo/a</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddCaregiver(false)} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleAddCaregiver} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!cgName || !cgPhone}
              >
                Agregar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Alert Dialog */}
      <Dialog open={showAddAlert} onOpenChange={setShowAddAlert}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Regla de Alerta</DialogTitle>
            <DialogDescription>
              Configura una nueva alerta automática
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cuidador</Label>
              <Select value={alertCaregiverId} onValueChange={setAlertCaregiverId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cuidador..." />
                </SelectTrigger>
                <SelectContent>
                  {caregivers.map((cg) => (
                    <SelectItem key={cg.id} value={cg.id}>
                      {cg.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tipo de alerta</Label>
              <Select value={alertType} onValueChange={(v) => setAlertType(v as typeof alertType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="missed_dose">Dosis omitida</SelectItem>
                  <SelectItem value="low_stock">Stock bajo</SelectItem>
                  <SelectItem value="panic_button">Botón de pánico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Esperar antes de alertar (minutos)</Label>
              <Input
                type="number"
                value={alertDelay}
                onChange={(e) => setAlertDelay(e.target.value)}
                min="1"
                max="120"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowAddAlert(false)} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleAddAlert} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!alertCaregiverId}
              >
                Crear regla
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Panic Button Confirmation */}
      <AlertDialog open={showPanicConfirm} onOpenChange={setShowPanicConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <Shield className="h-5 w-5" />
              ¿Activar alerta de emergencia?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esto enviará una notificación inmediata a tu cuidador principal ({caregivers.find(c => c.receiveAlerts)?.name || 'ninguno configurado'}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-4">
            <Label>Mensaje adicional (opcional)</Label>
            <Textarea
              value={panicMessage}
              onChange={(e) => setPanicMessage(e.target.value)}
              placeholder="Ej: Necesito ayuda urgente..."
              rows={2}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePanicButton}
              className="bg-red-600 hover:bg-red-700"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Activar alerta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
