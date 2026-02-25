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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileText,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  Calendar,
  Pill,
  AlertTriangle,
  Plus,
  Trash2,
  BarChart3
} from 'lucide-react';
import { format, parseISO, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState } from 'react';
import { SideEffectNote } from '@/types/medication';

export function ReportsView() {
  const { 
    medications, 
    doseRecords, 
    sideEffects, 
    addSideEffect,
    exportData,
    getDaySummary,
    getComplianceRate
  } = useMedicationStore();
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSideEffectModal, setShowSideEffectModal] = useState(false);
  const [exportedData, setExportedData] = useState('');

  // Side effect form state
  const [selectedMed, setSelectedMed] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState<'leve' | 'moderada' | 'grave'>('leve');
  const [notes, setNotes] = useState('');

  const activeMedications = medications.filter(m => m.status === 'active');
  const weeklyRate = getComplianceRate(7);
  const monthlyRate = getComplianceRate(30);

  // Recent side effects
  const recentSideEffects = sideEffects
    .filter(e => {
      const effectDate = new Date(e.date);
      const twoWeeksAgo = subDays(new Date(), 14);
      return effectDate >= twoWeeksAgo;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleExport = () => {
    const data = exportData();
    setExportedData(data);
    setShowExportModal(true);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(exportedData);
  };

  const handleDownload = () => {
    const blob = new Blob([exportedData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-medicamentos-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleAddSideEffect = () => {
    if (!selectedMed || !symptoms) return;
    
    addSideEffect({
      medicationId: selectedMed,
      date: new Date().toISOString().split('T')[0],
      symptoms,
      severity,
      notes: notes || undefined
    });

    // Reset form
    setSelectedMed('');
    setSymptoms('');
    setSeverity('leve');
    setNotes('');
    setShowSideEffectModal(false);
  };

  const getMedicationName = (id: string) => {
    return medications.find(m => m.id === id)?.name || 'Medicamento desconocido';
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'grave':
        return <Badge variant="destructive">Grave</Badge>;
      case 'moderada':
        return <Badge className="bg-orange-500">Moderada</Badge>;
      default:
        return <Badge variant="secondary">Leve</Badge>;
    }
  };

  // Calculate stats for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    return {
      date: dateStr,
      dayName: format(date, 'EEE', { locale: es }),
      ...getDaySummary(dateStr)
    };
  }).reverse();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Reportes</h2>
          <p className="text-gray-500">Genera reportes y registra efectos secundarios</p>
        </div>
        <Button onClick={handleExport} className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Exportar reporte
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Pill className="h-5 w-5 text-blue-600" />
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
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cumplimiento 7d</p>
                <p className="text-2xl font-bold">{weeklyRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Cumplimiento 30d</p>
                <p className="text-2xl font-bold">{monthlyRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Efectos registrados</p>
                <p className="text-2xl font-bold">{recentSideEffects.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cumplimiento últimos 7 días
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {last7Days.map((day) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-gray-200 rounded-t relative h-24">
                  <div
                    className={`absolute bottom-0 w-full rounded-t transition-all ${
                      day.rate >= 80 ? 'bg-green-500' :
                      day.rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                    style={{ height: `${Math.max(day.rate, 5)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500">{day.dayName}</span>
                <span className="text-xs font-medium">{day.rate}%</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Side Effects Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Efectos secundarios
              </CardTitle>
              <CardDescription>
                Registra cualquier efecto secundario para compartir con tu médico
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSideEffectModal(true)}
              disabled={activeMedications.length === 0}
            >
              <Plus className="h-4 w-4 mr-1" />
              Registrar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentSideEffects.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay efectos secundarios registrados</p>
              <p className="text-sm">Es una buena señal</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentSideEffects.map((effect) => (
                <div 
                  key={effect.id}
                  className="flex items-start justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{getMedicationName(effect.medicationId)}</span>
                      {getSeverityBadge(effect.severity)}
                    </div>
                    <p className="text-sm text-gray-700">{effect.symptoms}</p>
                    {effect.notes && (
                      <p className="text-xs text-gray-500 mt-1">{effect.notes}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {format(parseISO(effect.date), "d 'de' MMMM", { locale: es })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Resumen rápido
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Medicamentos activos</span>
              <span className="font-semibold">{activeMedications.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Dosis totales (7 días)</span>
              <span className="font-semibold">{last7Days.reduce((a, b) => a + b.total, 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Dosis tomadas (7 días)</span>
              <span className="font-semibold">{last7Days.reduce((a, b) => a + b.taken, 0)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Dosis omitidas (7 días)</span>
              <span className="font-semibold">{last7Days.reduce((a, b) => a + b.skipped, 0)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Modal */}
      <Dialog open={showExportModal} onOpenChange={setShowExportModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Reporte Exportado
            </DialogTitle>
            <DialogDescription>
              Puedes copiar el texto o descargar el archivo para compartir con tu médico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <pre className="p-4 bg-gray-100 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono">
              {exportedData}
            </pre>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleCopyToClipboard} className="flex-1">
                Copiar al portapapeles
              </Button>
              <Button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Download className="h-4 w-4 mr-2" />
                Descargar archivo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Side Effect Modal */}
      <Dialog open={showSideEffectModal} onOpenChange={setShowSideEffectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Registrar efecto secundario
            </DialogTitle>
            <DialogDescription>
              Registra cualquier efecto adverso que hayas experimentado
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Medicamento</Label>
              <Select value={selectedMed} onValueChange={setSelectedMed}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un medicamento" />
                </SelectTrigger>
                <SelectContent>
                  {activeMedications.map((med) => (
                    <SelectItem key={med.id} value={med.id}>
                      {med.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Síntomas</Label>
              <Textarea
                placeholder="Describe los síntomas que has experimentado..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Severidad</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as 'leve' | 'moderada' | 'grave')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leve">Leve - Molesto pero tolerable</SelectItem>
                  <SelectItem value="moderada">Moderada - Afecta actividades diarias</SelectItem>
                  <SelectItem value="grave">Grave - Requiere atención médica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Notas adicionales (opcional)</Label>
              <Input
                placeholder="Cualquier información adicional..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowSideEffectModal(false)} className="flex-1">
                Cancelar
              </Button>
              <Button 
                onClick={handleAddSideEffect} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                disabled={!selectedMed || !symptoms}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
