'use client';

import { AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface MedicalDisclaimerProps {
  variant?: 'full' | 'compact' | 'banner';
  onAccept?: () => void;
  showClose?: boolean;
}

export function MedicalDisclaimer({ 
  variant = 'compact', 
  onAccept,
  showClose = false 
}: MedicalDisclaimerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  if (variant === 'banner') {
    return (
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2">
        <div className="container mx-auto flex items-center justify-center gap-2 text-sm text-amber-800">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>
            Esta app no sustituye el consejo médico profesional. Consulta siempre con tu médico.
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm">
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-amber-800">
          <strong>Aviso:</strong> Esta aplicación no es un dispositivo médico. 
          No sustituye el consejo de profesionales de la salud.
        </p>
      </div>
    );
  }

  // Full variant - for modals or onboarding
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 max-w-md mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Aviso Importante</h3>
        </div>
        {showClose && (
          <button 
            onClick={() => setIsVisible(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="space-y-4 text-gray-600">
        <p>
          <strong>MediControl es una herramienta de organización personal, no un dispositivo médico.</strong>
        </p>
        
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>No sustituye el consejo de tu médico o farmacéutico</span>
          </li>
          <li className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Las alertas pueden fallar por problemas técnicos</span>
          </li>
          <li className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Eres responsable de verificar que tomas tu medicación</span>
          </li>
          <li className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <span>Las interacciones mostradas son orientativas</span>
          </li>
        </ul>

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500">
            Al continuar, aceptas nuestros{' '}
            <a href="/legal/terms" className="text-blue-600 hover:underline">
              Términos de Servicio
            </a>{' '}
            y reconoces haber leído este aviso.
          </p>
        </div>

        {onAccept && (
          <button
            onClick={onAccept}
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Entendido, continuar
          </button>
        )}
      </div>
    </div>
  );
}
