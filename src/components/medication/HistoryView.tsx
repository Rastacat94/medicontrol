'use client';

import { useState } from 'react';
import { useMedicationStore } from '@/store/medication-store';
import { useVoiceNoteStore } from '@/store/voice-note-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  History as HistoryIcon,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Mic
} from 'lucide-react';
import { format, parseISO, startOfWeek, endOfWeek, eachDayOfInterval, subWeeks, addWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { VoiceNoteList } from '@/components/voice-notes/VoiceNoteRecorder';

export function HistoryView() {
  const { getDosesForDate, getDaySummary, medications, doseRecords, sideEffects } = useMedicationStore();
  const { voiceNotes } = useVoiceNoteStore();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');

  const weekStart = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(selectedWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const goToPreviousWeek = () => setSelectedWeek(subWeeks(selectedWeek, 1));
  const goToNextWeek = () => setSelectedWeek(addWeeks(selectedWeek, 1));

  const getMedicationName = (id: string) => {
    return medications.find((m) => m.id === id)?.name || 'Medicamento eliminado';
  };

  const getMedicationColor = (id: string) => {
    return medications.find((m) => m.id === id)?.color || '#gray';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'taken':
        return <Badge className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" />Tomado</Badge>;
      case 'skipped':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Omitido</Badge>;
      case 'postponed':
        return <Badge className="bg-amber-500"><Clock className="h-3 w-3 mr-1" />Pospuesto</Badge>;
      default:
        return <Badge variant="outline">Pendiente</Badge>;
    }
  };

  // Calculate weekly stats
  const weeklyData = weekDays.map((day) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const summary = getDaySummary(dateStr);
    return {
      date: dateStr,
      dayName: format(day, 'EEE', { locale: es }),
      dayNumber: format(day, 'd'),
      ...summary
    };
  });

  const weeklyTotal = weeklyData.reduce((acc, day) => acc + day.total, 0);
  const weeklyTaken = weeklyData.reduce((acc, day) => acc + day.taken, 0);
  const weeklyRate = weeklyTotal > 0 ? Math.round((weeklyTaken / weeklyTotal) * 100) : 0;

  // Get all records for the selected week
  const weekRecords = doseRecords
    .filter((r) => {
      const recordDate = parseISO(r.date);
      return recordDate >= weekStart && recordDate <= weekEnd;
    })
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Historial</h2>
          <p className="text-gray-500">Revisa el cumplimiento de tus medicamentos</p>
        </div>
      </div>

      <Tabs defaultValue="week" onValueChange={(v) => setViewMode(v as 'day' | 'week' | 'month')}>
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="day">Día</TabsTrigger>
          <TabsTrigger value="week">Semana</TabsTrigger>
          <TabsTrigger value="month">Mes</TabsTrigger>
        </TabsList>

        <TabsContent value="day" className="space-y-4">
          <DayHistoryView />
        </TabsContent>

        <TabsContent value="week" className="space-y-4">
          {/* Week navigation */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon" onClick={goToPreviousWeek}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="text-center">
                  <CardTitle className="text-lg">
                    {format(weekStart, "d 'de' MMMM", { locale: es })} - {format(weekEnd, "d 'de' MMMM", { locale: es })}
                  </CardTitle>
                  <CardDescription>Semana {format(selectedWeek, 'w', { locale: es })}</CardDescription>
                </div>
                <Button variant="ghost" size="icon" onClick={goToNextWeek}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Weekly summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{weeklyTotal}</p>
                  <p className="text-sm text-gray-600">Dosis totales</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{weeklyTaken}</p>
                  <p className="text-sm text-gray-600">Tomadas</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">{weeklyRate}%</p>
                  <p className="text-sm text-gray-600">Cumplimiento</p>
                </div>
              </div>

              {/* Week grid */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {weeklyData.map((day) => (
                  <div 
                    key={day.date}
                    className={`text-center p-2 rounded-lg ${
                      day.rate >= 80 ? 'bg-green-100' :
                      day.rate >= 50 ? 'bg-amber-100' :
                      day.total > 0 ? 'bg-red-100' : 'bg-gray-100'
                    }`}
                  >
                    <p className="text-xs text-gray-600">{day.dayName}</p>
                    <p className="text-lg font-bold">{day.dayNumber}</p>
                    <p className="text-xs font-medium">{day.rate}%</p>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progreso semanal</span>
                  <span className="font-medium">{weeklyTaken}/{weeklyTotal}</span>
                </div>
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all"
                    style={{ width: `${weeklyRate}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Records list */}
          {weekRecords.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <HistoryIcon className="h-5 w-5" />
                  Detalle de la semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {weekRecords.map((record) => (
                    <div 
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: getMedicationColor(record.medicationId) }}
                        />
                        <div>
                          <p className="font-medium">{getMedicationName(record.medicationId)}</p>
                          <p className="text-sm text-gray-500">
                            {format(parseISO(record.date), "d MMM", { locale: es })} - {record.scheduledTime}
                          </p>
                        </div>
                      </div>
                      {getStatusBadge(record.status)}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Voice Notes Section */}
          {voiceNotes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Mic className="h-5 w-5 text-blue-600" />
                  Notas de Voz ({voiceNotes.length})
                </CardTitle>
                <CardDescription>
                  Grabaciones para compartir con tu médico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <VoiceNoteList limit={5} showTitle={false} />
                {voiceNotes.length > 5 && (
                  <p className="text-sm text-gray-500 text-center mt-3">
                    Y {voiceNotes.length - 5} notas más...
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="month" className="space-y-4">
          <MonthHistoryView />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DayHistoryView() {
  const { getDosesForDate, getDaySummary, selectedDate, setSelectedDate, medications } = useMedicationStore();
  const doses = getDosesForDate(selectedDate);
  const summary = getDaySummary(selectedDate);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Seleccionar fecha</CardTitle>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{summary.total}</p>
              <p className="text-sm text-gray-600">Total</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{summary.taken}</p>
              <p className="text-sm text-gray-600">Tomadas</p>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">{summary.pending}</p>
              <p className="text-sm text-gray-600">Pendientes</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{summary.rate}%</p>
              <p className="text-sm text-gray-600">Cumplimiento</p>
            </div>
          </div>

          {doses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No hay dosis registradas para este día</p>
            </div>
          ) : (
            <div className="space-y-2">
              {doses.map((dose, index) => (
                <div 
                  key={`${dose.medication.id}-${dose.time}-${index}`}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: dose.medication.color }}
                    />
                    <div>
                      <p className="font-medium">{dose.medication.name}</p>
                      <p className="text-sm text-gray-500">
                        {dose.time} - {dose.dose} {dose.doseUnit}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    dose.status === 'taken' ? 'default' :
                    dose.status === 'skipped' ? 'destructive' : 'secondary'
                  }>
                    {dose.status === 'taken' ? 'Tomado' :
                     dose.status === 'skipped' ? 'Omitido' :
                     dose.status === 'postponed' ? 'Pospuesto' : 'Pendiente'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MonthHistoryView() {
  const { getDaySummary } = useMedicationStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  
  const daysInMonth = new Date(
    selectedMonth.getFullYear(),
    selectedMonth.getMonth() + 1,
    0
  ).getDate();

  const monthData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const date = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), day);
    const dateStr = format(date, 'yyyy-MM-dd');
    const summary = getDaySummary(dateStr);
    return {
      day,
      dateStr,
      ...summary
    };
  });

  const monthlyTotal = monthData.reduce((acc, day) => acc + day.total, 0);
  const monthlyTaken = monthData.reduce((acc, day) => acc + day.taken, 0);
  const monthlyRate = monthlyTotal > 0 ? Math.round((monthlyTaken / monthlyTotal) * 100) : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() - 1)))}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle>
              {format(selectedMonth, 'MMMM yyyy', { locale: es })}
            </CardTitle>
            <Button variant="ghost" onClick={() => setSelectedMonth(new Date(selectedMonth.setMonth(selectedMonth.getMonth() + 1)))}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{monthlyTotal}</p>
              <p className="text-sm text-gray-600">Dosis totales</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{monthlyTaken}</p>
              <p className="text-sm text-gray-600">Tomadas</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{monthlyRate}%</p>
              <p className="text-sm text-gray-600">Cumplimiento</p>
            </div>
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 p-2">
                {day}
              </div>
            ))}
            {Array.from({ length: new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1).getDay() - 1 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {monthData.map((day) => (
              <div 
                key={day.day}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-sm ${
                  day.total === 0 ? 'bg-gray-50' :
                  day.rate >= 80 ? 'bg-green-100' :
                  day.rate >= 50 ? 'bg-amber-100' : 'bg-red-100'
                }`}
                title={`${day.taken}/${day.total} dosis tomadas`}
              >
                <span className="font-medium">{day.day}</span>
                {day.total > 0 && (
                  <span className="text-xs">{day.rate}%</span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
