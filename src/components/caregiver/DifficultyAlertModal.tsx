'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Phone, 
  MessageCircle, 
  Send,
  Heart,
  UserCheck,
  Clock,
  X
} from 'lucide-react';
import { useMedicationStore } from '@/store/medication-store';
import { useNotificationStore } from '@/store/notification-store';

interface DifficultyAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  context: 'medication_form' | 'general' | 'timeout';
  medicationName?: string;
}

export function DifficultyAlertModal({ 
  isOpen, 
  onClose, 
  context,
  medicationName 
}: DifficultyAlertModalProps) {
  const { caregivers } = useMedicationStore();
  const { addNotification } = useNotificationStore();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const getContextMessage = () => {
    switch (context) {
      case 'medication_form':
        return `¿Tienes dificultad para registrar${medicationName ? ` ${medicationName}` : ' el medicamento'}?`;
      case 'timeout':
        return '¿Necesitas ayuda para continuar?';
      default:
        return '¿Necesitas ayuda con algo?';
    }
  };

  const handleRequestHelp = async (caregiverId: string, caregiverName: string) => {
    setIsSending(true);
    
    try {
      // Llamar a la API para enviar alerta al cuidador
      const response = await fetch('/api/caregiver/alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          caregiverId,
          message: `Necesito ayuda con ${medicationName || 'la configuración de mi medicina'}`,
          context,
          medicationName,
        }),
      });

      if (!response.ok) {
        throw new Error('Error al enviar alerta');
      }

      // También crear notificación local para demo
      addNotification({
        id: `help-${Date.now()}`,
        type: 'caregiver_alert',
        title: `🆘 Ayuda solicitada a ${caregiverName}`,
        message: `Se ha enviado una solicitud de ayuda${medicationName ? ` para ${medicationName}` : ''}.`,
        is_read: false,
        priority: 2,
        created_at: new Date().toISOString(),
        data: {
          caregiver_name: caregiverName,
          context,
          medication_name: medicationName,
        },
      });

      setSent(true);
      
      setTimeout(() => {
        onClose();
        setSent(false);
        setIsSending(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error enviando alerta:', error);
      // Mostrar mensaje de error al usuario
      alert('No se pudo enviar la solicitud de ayuda. Por favor intenta de nuevo.');
      setIsSending(false);
    }
  };

  const primaryCaregiver = caregivers.find(c => c.receiveAlerts) || caregivers[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <Card className="w-full max-w-md bg-white shadow-2xl animate-in zoom-in-95 duration-300">
        <CardContent className="p-6">
          {sent ? (
            // Confirmación de envío
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                ¡Ayuda solicitada!
              </h3>
              <p className="text-gray-600">
                Tu cuidador ha sido notificado y te contactará pronto.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">¿Necesitas ayuda?</h3>
                    <p className="text-sm text-gray-500">{getContextMessage()}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Mensaje explicativo */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  Puedes pedir ayuda a tu cuidador. Ellos recibirán una notificación 
                  y podrán ayudarte a configurar tu medicamento.
                </p>
              </div>

              {/* Lista de cuidadores */}
              {caregivers.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Tus cuidadores:</p>
                  {caregivers.map((caregiver) => (
                    <div 
                      key={caregiver.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium">{caregiver.name}</p>
                          <p className="text-xs text-gray-500">{caregiver.relationship}</p>
                        </div>
                        {caregiver.receiveAlerts && (
                          <Badge variant="secondary" className="text-xs">
                            Principal
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRequestHelp(caregiver.id, caregiver.name)}
                        disabled={isSending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSending ? (
                          <Clock className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-1" />
                            Pedir ayuda
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 mb-3">
                    No tienes cuidadores configurados
                  </p>
                  <Button variant="outline" size="sm">
                    Agregar cuidador
                  </Button>
                </div>
              )}

              {/* Acciones alternativas */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 mb-2">También puedes:</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="h-4 w-4 mr-1" />
                    Llamar
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageCircle className="h-4 w-4 mr-1" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Componente de botón flotante para mostrar cuando hay dificultad
export function HelpButton({ 
  onClick,
  visible 
}: { 
  onClick: () => void;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <Button
      onClick={onClick}
      className="fixed bottom-24 right-4 z-40 h-14 px-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg rounded-full animate-in slide-in-from-right duration-300"
    >
      <HelpCircle className="h-5 w-5 mr-2" />
      Pedir ayuda
    </Button>
  );
}

// Hook para detectar dificultades (timeout o cancelaciones)
export function useDifficultyDetection(
  timeoutMs: number = 60000, // 1 minuto por defecto
  onCancel?: () => void
) {
  const [showHelpButton, setShowHelpButton] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);

  const startTracking = () => {
    setStartTime(Date.now());
    setShowHelpButton(false);
    
    // Detectar si tarda mucho
    const timeout = setTimeout(() => {
      setShowHelpButton(true);
    }, timeoutMs);

    return () => clearTimeout(timeout);
  };

  const recordCancel = () => {
    const newCount = attemptCount + 1;
    setAttemptCount(newCount);
    
    // Si cancela 2+ veces, mostrar ayuda
    if (newCount >= 2) {
      setShowHelpButton(true);
      onCancel?.();
    }
  };

  const reset = () => {
    setStartTime(null);
    setAttemptCount(0);
    setShowHelpButton(false);
  };

  return {
    showHelpButton,
    attemptCount,
    startTracking,
    recordCancel,
    reset,
  };
}

export default DifficultyAlertModal;
