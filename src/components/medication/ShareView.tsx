'use client';

import { useMedicationStore } from '@/store/medication-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  Share2,
  Copy,
  Mail,
  MessageSquare,
  Smartphone,
  FileText,
  Check,
  Clock,
  Pill,
  User,
  Phone,
  Heart
} from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function ShareView() {
  const { 
    medications, 
    profile, 
    getDaySummary, 
    getWeeklyStats,
    sideEffects,
    doseRecords
  } = useMedicationStore();
  
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareType, setShareType] = useState<'family' | 'doctor' | 'caregiver'>('family');
  const [copied, setCopied] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  const todaySummary = getDaySummary(today);
  const weeklyStats = getWeeklyStats();
  const activeMedications = medications.filter(m => m.status === 'active');
  const weeklyRate = weeklyStats.reduce((a, b) => a + b.rate, 0) / 7;

  const generateShareText = () => {
    let text = '';
    
    const greeting = shareType === 'doctor' 
      ? 'Estimado/a médico/a,\n\n'
      : shareType === 'caregiver'
        ? 'Hola,\n\nAquí tienes el resumen de medicamentos:\n\n'
        : 'Hola,\n\nTe comparto mi información de medicamentos:\n\n';

    text += greeting;

    // Patient info
    if (profile?.name) {
      text += `👤 PACIENTE: ${profile.name}\n`;
      if (profile.age) text += `   Edad: ${profile.age} años\n`;
      if (profile.allergies && profile.allergies.length > 0) {
        text += `   ⚠️ Alergias: ${profile.allergies.join(', ')}\n`;
      }
      if (profile.conditions && profile.conditions.length > 0) {
        text += `   🏥 Condiciones: ${profile.conditions.join(', ')}\n`;
      }
      text += '\n';
    }

    // Active medications
    text += `💊 MEDICAMENTOS ACTIVOS (${activeMedications.length})\n`;
    text += '─────────────────────────\n';
    
    activeMedications.forEach((med, index) => {
      text += `\n${index + 1}. ${med.name}\n`;
      text += `   Dosis: ${med.dose} ${med.doseUnit}\n`;
      text += `   Horarios: ${med.schedules.join(', ')}\n`;
      if (med.instructions.length > 0 && !med.instructions.includes('ninguna')) {
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
        text += `   Instrucciones: ${med.instructions.map(i => labels[i] || i).join(', ')}\n`;
      }
      if (med.notes) text += `   Notas: ${med.notes}\n`;
    });

    // Today's summary
    text += `\n📅 RESUMEN DE HOY (${format(new Date(), "d 'de' MMMM", { locale: es })})\n`;
    text += '─────────────────────────\n';
    text += `   Dosis programadas: ${todaySummary.total}\n`;
    text += `   Dosis tomadas: ${todaySummary.taken}\n`;
    text += `   Dosis pendientes: ${todaySummary.pending}\n`;
    text += `   Cumplimiento: ${todaySummary.rate}%\n`;

    // Weekly summary
    text += `\n📊 CUMPLIMIENTO SEMANAL\n`;
    text += '─────────────────────────\n';
    text += `   Promedio: ${Math.round(weeklyRate)}%\n`;

    // Recent side effects
    const recentEffects = sideEffects
      .filter(e => {
        const effectDate = new Date(e.date);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return effectDate >= weekAgo;
      })
      .slice(0, 5);

    if (recentEffects.length > 0) {
      text += `\n⚠️ EFECTOS SECUNDARIOS RECIENTES\n`;
      text += '─────────────────────────\n';
      recentEffects.forEach(effect => {
        const medName = medications.find(m => m.id === effect.medicationId)?.name || 'Desconocido';
        text += `   • ${medName}: ${effect.symptoms} (${effect.severity})\n`;
      });
    }

    // Emergency contact
    if (profile?.emergencyContact) {
      text += `\n📞 CONTACTO DE EMERGENCIA\n`;
      text += '─────────────────────────\n';
      text += `   ${profile.emergencyContact.name}\n`;
      text += `   ${profile.emergencyContact.phone}\n`;
      text += `   ${profile.emergencyContact.relationship}\n`;
    }

    // Primary doctor
    if (profile?.primaryDoctor) {
      text += `\n👨‍⚕️ MÉDICO PRINCIPAL\n`;
      text += '─────────────────────────\n';
      text += `   ${profile.primaryDoctor.name}\n`;
      if (profile.primaryDoctor.specialty) {
        text += `   ${profile.primaryDoctor.specialty}\n`;
      }
      if (profile.primaryDoctor.phone) {
        text += `   Tel: ${profile.primaryDoctor.phone}\n`;
      }
    }

    // Custom message
    if (customMessage) {
      text += `\n💬 MENSAJE ADICIONAL\n`;
      text += '─────────────────────────\n';
      text += `${customMessage}\n`;
    }

    text += `\n─────────────────────────\n`;
    text += `Generado el ${format(new Date(), "d 'de' MMMM 'a las' HH:mm", { locale: es })}\n`;
    text += `MediControl - Control de medicamentos\n`;

    return text;
  };

  const handleCopy = () => {
    const text = generateShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const text = generateShareText();
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleShareEmail = () => {
    const text = generateShareText();
    const subject = encodeURIComponent('Información de medicamentos - MediControl');
    const body = encodeURIComponent(text);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      const text = generateShareText();
      try {
        await navigator.share({
          title: 'Información de medicamentos',
          text: text,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      setShowShareModal(true);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Compartir</h2>
        <p className="text-gray-500">Comparte tu información de medicamentos con familiares o médicos</p>
      </div>

      {/* Quick Share Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="cursor-pointer hover:border-green-300 transition-colors"
          onClick={() => { setShareType('family'); setShowShareModal(true); }}
        >
          <CardContent className="p-6 text-center">
            <div className="inline-flex p-3 bg-green-100 rounded-full mb-3">
              <User className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">Para familiar</h3>
            <p className="text-sm text-gray-500">Resumen sencillo para familiares</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-blue-300 transition-colors"
          onClick={() => { setShareType('doctor'); setShowShareModal(true); }}
        >
          <CardContent className="p-6 text-center">
            <div className="inline-flex p-3 bg-blue-100 rounded-full mb-3">
              <Heart className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1">Para médico</h3>
            <p className="text-sm text-gray-500">Reporte completo para consulta</p>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:border-purple-300 transition-colors"
          onClick={() => { setShareType('caregiver'); setShowShareModal(true); }}
        >
          <CardContent className="p-6 text-center">
            <div className="inline-flex p-3 bg-purple-100 rounded-full mb-3">
              <Pill className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">Para cuidador</h3>
            <p className="text-sm text-gray-500">Información para asistencia diaria</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Vista previa del resumen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Pill className="h-5 w-5 text-blue-600" />
                <span>Medicamentos activos</span>
              </div>
              <Badge variant="secondary">{activeMedications.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <span>Dosis pendientes hoy</span>
              </div>
              <Badge variant={todaySummary.pending > 0 ? 'destructive' : 'secondary'}>
                {todaySummary.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-green-600" />
                <span>Cumplimiento semanal</span>
              </div>
              <Badge variant="secondary">{Math.round(weeklyRate)}%</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Info */}
      {profile?.emergencyContact && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">Contacto de emergencia</p>
                  <p className="text-sm text-red-600">
                    {profile.emergencyContact.name} - {profile.emergencyContact.phone}
                  </p>
                </div>
              </div>
              <Badge variant="destructive">
                {profile.emergencyContact.relationship}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Compartir rápidamente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm">¡Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="h-5 w-5" />
                  <span className="text-sm">Copiar</span>
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={handleShareWhatsApp}
            >
              <MessageSquare className="h-5 w-5 text-green-600" />
              <span className="text-sm">WhatsApp</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={handleShareEmail}
            >
              <Mail className="h-5 w-5 text-blue-600" />
              <span className="text-sm">Email</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-4 flex-col gap-2"
              onClick={handleShareNative}
            >
              <Share2 className="h-5 w-5 text-purple-600" />
              <span className="text-sm">Compartir</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Modal */}
      <Dialog open={showShareModal} onOpenChange={setShowShareModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Compartir para {shareType === 'doctor' ? 'médico' : shareType === 'caregiver' ? 'cuidador' : 'familiar'}
            </DialogTitle>
            <DialogDescription>
              Revisa el resumen y añade un mensaje personalizado si lo deseas
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Custom message */}
            <div className="space-y-2">
              <Label>Mensaje adicional (opcional)</Label>
              <Textarea
                placeholder="Añade un mensaje personal..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={2}
              />
            </div>

            {/* Preview */}
            <div className="space-y-2">
              <Label>Vista previa</Label>
              <pre className="p-4 bg-gray-100 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono max-h-64 overflow-y-auto">
                {generateShareText()}
              </pre>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleCopy} className="flex-1">
                {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                {copied ? '¡Copiado!' : 'Copiar texto'}
              </Button>
              <Button variant="outline" onClick={handleShareWhatsApp} className="flex-1">
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
              <Button variant="outline" onClick={handleShareEmail} className="flex-1">
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
