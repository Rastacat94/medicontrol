'use client';

import { useMedicationStore } from '@/store/medication-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Pill, 
  Calendar,
  TrendingUp,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import { ConfirmDoseModal } from './ConfirmDoseModal';
import { MedicationDoseForDay, DoseStatus } from '@/types/medication';
import { NotificationHighlight, NotificationWidget } from '@/components/notifications/NotificationCenter';
import { useNotificationStore } from '@/store/notification-store';
import { AdBanner } from '@/components/monetization/AdBanner';

export function Dashboard() {
  const { 
    selectedDate, 
    setSelectedDate, 
    getDosesForDate, 
    getDaySummary,
    getNextDose,
    getWeeklyStats,
    medications
  } = useMedicationStore();
  
  const { fetchNotifications } = useNotificationStore();
  
  const [selectedDose, setSelectedDose] = useState<MedicationDoseForDay | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  // Cargar notificaciones
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);
  
  const doses = getDosesForDate(selectedDate);
  const summary = getDaySummary(selectedDate);
  const nextDose = getNextDose();
  const weeklyStats = getWeeklyStats();
  
  const today = new Date().toISOString().split('T')[0];
  const isTodayView = selectedDate === today;
  
  const currentTime = new Date().toTimeString().slice(0, 5);

  const handleDoseClick = (dose: MedicationDoseForDay) => {
    setSelectedDose(dose);
    setShowConfirmModal(true);
  };

  const getStatusIcon = (status: DoseStatus, time: string) => {
    if (status === 'taken') {
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    }
    if (status === 'skipped') {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    if (status === 'postponed') {
      return <Clock className="h-5 w-5 text-amber-500" />;
    }
    if (isTodayView && time < currentTime) {
      return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getStatusColor = (status: DoseStatus, time: string) => {
    if (status === 'taken') return 'bg-green-50 border-green-200';
    if (status === 'skipped') return 'bg-red-50 border-red-200';
    if (status === 'postponed') return 'bg-amber-50 border-amber-200';
    if (isTodayView && time < currentTime) return 'bg-red-50 border-red-200';
    return 'bg-white border-gray-200';
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

  // Generate date buttons for the week
  const getDateButtons = () => {
    const buttons = [];
    for (let i = -3; i <= 3; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const isSelected = dateStr === selectedDate;
      const isTodayDate = dateStr === today;
      
      buttons.push(
        <button
          key={dateStr}
          onClick={() => setSelectedDate(dateStr)}
          className={`flex flex-col items-center p-2 rounded-lg transition-all ${
            isSelected 
              ? 'bg-blue-600 text-white' 
              : isTodayDate
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="text-xs font-medium">
            {format(date, 'EEE', { locale: es })}
          </span>
          <span className="text-lg font-bold">
            {format(date, 'd')}
          </span>
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="space-y-6">
      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {getDateButtons()}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total dosis</p>
                <p className="text-3xl font-bold">{summary.total}</p>
              </div>
              <Pill className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Tomadas</p>
                <p className="text-3xl font-bold">{summary.taken}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-sm">Pendientes</p>
                <p className="text-3xl font-bold">{summary.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-200" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Cumplimiento</p>
                <p className="text-3xl font-bold">{summary.rate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notificación destacada - Te acompañan */}
      <NotificationHighlight />

      {/* Widget de cuidadores */}
      <NotificationWidget />

      {/* Next dose highlight */}
      {nextDose && isTodayView && (
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardHeader className="pb-2">
            <CardDescription className="text-blue-600 font-medium">
              PRÓXIMA DOSIS
            </CardDescription>
            <CardTitle className="flex items-center gap-3">
              <div 
                className="h-4 w-4 rounded-full" 
                style={{ backgroundColor: nextDose.medication.color }}
              />
              {nextDose.medication.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="text-2xl font-bold text-blue-600">{nextDose.time}</span>
                </div>
                <span className="text-gray-600">
                  {nextDose.dose} {nextDose.doseUnit}
                </span>
              </div>
              <Button 
                size="lg"
                onClick={() => handleDoseClick(nextDose)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Confirmar toma
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Progreso semanal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-24">
            {weeklyStats.map((stat, index) => (
              <div key={stat.date} className="flex-1 flex flex-col items-center gap-1">
                <div 
                  className="w-full bg-blue-500 rounded-t transition-all"
                  style={{ height: `${Math.max(stat.rate, 5)}%` }}
                />
                <span className="text-xs text-gray-500">
                  {format(parseISO(stat.date), 'EEE', { locale: es })}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Cumplimiento promedio</span>
              <span className="font-medium">{weeklyStats.reduce((a, b) => a + b.rate, 0) / 7}%</span>
            </div>
            <Progress value={weeklyStats.reduce((a, b) => a + b.rate, 0) / 7} />
          </div>
        </CardContent>
      </Card>

      {/* Doses list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isTodayView ? 'Medicamentos de hoy' : `Medicamentos del ${format(parseISO(selectedDate), "d 'de' MMMM", { locale: es })}`}
          </CardTitle>
          {medications.filter(m => m.status === 'active').length === 0 && (
            <CardDescription>
              No hay medicamentos activos. Agrega medicamentos para comenzar.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {doses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Pill className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay dosis programadas para este día</p>
            </div>
          ) : (
            <div className="space-y-3">
              {doses.map((dose, index) => (
                <div
                  key={`${dose.medication.id}-${dose.time}-${index}`}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getStatusColor(dose.status, dose.time)}`}
                  onClick={() => handleDoseClick(dose)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-4 w-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: dose.medication.color }}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-lg">{dose.time}</span>
                          <Badge variant="outline" className="text-sm">
                            {dose.dose} {dose.doseUnit}
                          </Badge>
                        </div>
                        <p className="font-medium text-gray-900">{dose.medication.name}</p>
                        {dose.medication.instructions.length > 0 && !dose.medication.instructions.includes('ninguna') && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {dose.medication.instructions.slice(0, 3).map((inst) => (
                              <Badge key={inst} variant="secondary" className="text-xs">
                                {getInstructionLabel(inst)}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(dose.status, dose.time)}
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirm dose modal */}
      {selectedDose && (
        <ConfirmDoseModal
          dose={selectedDose}
          open={showConfirmModal}
          onClose={() => {
            setShowConfirmModal(false);
            setSelectedDose(null);
          }}
        />
      )}
    </div>
  );
}
