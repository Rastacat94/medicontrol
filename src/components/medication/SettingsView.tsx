'use client';

import { useMedicationStore } from '@/store/medication-store';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  Settings as SettingsIcon,
  User,
  Phone,
  Heart,
  AlertCircle,
  Trash2,
  Download,
  Upload,
  Shield,
  Database,
  Crown,
  Mail,
  LogOut,
  Bell
} from 'lucide-react';
import { useState } from 'react';

export function SettingsView() {
  const { 
    profile, 
    updateProfile, 
    medications, 
    doseRecords,
    clearAllData 
  } = useMedicationStore();
  
  const { user, logout, updateProfile: updateAuthProfile, isAuthenticated } = useAuthStore();
  
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Profile form state - use user data directly as initial values
  const [name, setName] = useState(user?.name || profile?.name || '');
  const [email] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [emergencyName, setEmergencyName] = useState(profile?.emergencyContact?.name || '');
  const [emergencyPhone, setEmergencyPhone] = useState(profile?.emergencyContact?.phone || '');
  const [emergencyRelationship, setEmergencyRelationship] = useState(profile?.emergencyContact?.relationship || '');
  const [doctorName, setDoctorName] = useState(profile?.primaryDoctor?.name || '');
  const [doctorPhone, setDoctorPhone] = useState(profile?.primaryDoctor?.phone || '');
  const [doctorSpecialty, setDoctorSpecialty] = useState(profile?.primaryDoctor?.specialty || '');
  const [allergies, setAllergies] = useState(profile?.allergies?.join(', ') || '');
  const [conditions, setConditions] = useState(profile?.conditions?.join(', ') || '');

  const handleSaveProfile = () => {
    // Update medication profile
    updateProfile({
      name,
      age: age ? parseInt(age) : undefined,
      emergencyContact: emergencyName ? {
        name: emergencyName,
        phone: emergencyPhone,
        relationship: emergencyRelationship
      } : undefined,
      primaryDoctor: doctorName ? {
        name: doctorName,
        phone: doctorPhone,
        specialty: doctorSpecialty
      } : undefined,
      allergies: allergies ? allergies.split(',').map(a => a.trim()).filter(Boolean) : undefined,
      conditions: conditions ? conditions.split(',').map(c => c.trim()).filter(Boolean) : undefined
    });
    
    // Update auth profile
    if (user) {
      updateAuthProfile({
        name,
        phone
      });
    }
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    // Reset form
    setName('');
    setAge('');
    setEmergencyName('');
    setEmergencyPhone('');
    setEmergencyRelationship('');
    setDoctorName('');
    setDoctorPhone('');
    setDoctorSpecialty('');
    setAllergies('');
    setConditions('');
  };

  const handleExportJSON = () => {
    const data = {
      profile,
      medications,
      doseRecords,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medicontrol-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.profile) {
          updateProfile(data.profile);
        }
        alert('Datos importados correctamente. Recarga la página para ver los cambios.');
      } catch {
        alert('Error al importar el archivo. Asegúrate de que es un archivo JSON válido.');
      }
    };
    reader.readAsText(file);
  };

  const stats = {
    totalMedications: medications.length,
    activeMedications: medications.filter(m => m.status === 'active').length,
    totalRecords: doseRecords.length,
    daysWithRecords: new Set(doseRecords.map(r => r.date)).size
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configuración</h2>
        <p className="text-gray-500">Personaliza tu perfil y gestiona tus datos</p>
      </div>

      {/* Account Info */}
      {isAuthenticated && user && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Mi Cuenta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {user.isPremium ? (
                  <Badge className="bg-amber-500 hover:bg-amber-600">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Bell className="h-3 w-3 mr-1" />
                    {user.smsCredits} SMS disponibles
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Cerrar sesión
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Información personal
          </CardTitle>
          <CardDescription>
            Estos datos se incluirán en los reportes que compartas
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Edad</Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Tu edad"
                min="0"
                max="150"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="allergies">Alergias (separadas por coma)</Label>
            <Input
              id="allergies"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              placeholder="Ej: Penicilina, Aspirina, Látex..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditions">Condiciones médicas (separadas por coma)</Label>
            <Input
              id="conditions"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder="Ej: Diabetes, Hipertensión, Asma..."
            />
          </div>

          <Button onClick={handleSaveProfile} className="bg-blue-600 hover:bg-blue-700">
            Guardar perfil
          </Button>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contacto de emergencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Nombre del contacto"
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Número de teléfono"
              />
            </div>
            <div className="space-y-2">
              <Label>Relación</Label>
              <Input
                value={emergencyRelationship}
                onChange={(e) => setEmergencyRelationship(e.target.value)}
                placeholder="Ej: Hijo/a, Cónyuge..."
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} variant="outline">
            Guardar contacto
          </Button>
        </CardContent>
      </Card>

      {/* Primary Doctor */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Médico principal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Nombre</Label>
              <Input
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. / Dra. Nombre"
              />
            </div>
            <div className="space-y-2">
              <Label>Teléfono</Label>
              <Input
                value={doctorPhone}
                onChange={(e) => setDoctorPhone(e.target.value)}
                placeholder="Número de consultorio"
              />
            </div>
            <div className="space-y-2">
              <Label>Especialidad</Label>
              <Input
                value={doctorSpecialty}
                onChange={(e) => setDoctorSpecialty(e.target.value)}
                placeholder="Ej: Medicina interna"
              />
            </div>
          </div>
          <Button onClick={handleSaveProfile} variant="outline">
            Guardar médico
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            Gestión de datos
          </CardTitle>
          <CardDescription>
            Exporta o importa tus datos. Los datos se guardan automáticamente en tu dispositivo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.totalMedications}</p>
              <p className="text-xs text-gray-500">Medicamentos</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.activeMedications}</p>
              <p className="text-xs text-gray-500">Activos</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{stats.totalRecords}</p>
              <p className="text-xs text-gray-500">Registros</p>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{stats.daysWithRecords}</p>
              <p className="text-xs text-gray-500">Días registrados</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExportJSON}>
              <Download className="h-4 w-4 mr-2" />
              Exportar backup
            </Button>
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportJSON}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar backup
                </span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            Zona de peligro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Eliminar todos los datos</p>
              <p className="text-sm text-gray-500">Esta acción no se puede deshacer</p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowClearConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar todo
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold">MediControl</p>
                <p className="text-sm text-gray-500">Control de medicamentos v1.0</p>
              </div>
            </div>
            <Badge variant="secondary">
              Datos locales
            </Badge>
          </div>
          <p className="mt-4 text-xs text-gray-400 text-center">
            Tus datos se almacenan exclusivamente en tu dispositivo y nunca se envían a servidores externos.
          </p>
        </CardContent>
      </Card>

      {/* Clear Data Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              ¿Eliminar todos los datos?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminarán todos los medicamentos, historial de dosis y tu perfil personal. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700"
            >
              Sí, eliminar todo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
