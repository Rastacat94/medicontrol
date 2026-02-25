'use client';

import { CheckCircle2, Sparkles, Star } from 'lucide-react';

interface DoseConfirmationProps {
  show: boolean;
  onComplete?: () => void;
}

export function DoseConfirmation({ show, onComplete }: DoseConfirmationProps) {
  if (!show) return null;

  return (
    <>
      {/* Overlay semi-transparente */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm animate-in fade-in duration-300"
      >
        {/* Card de confirmación */}
        <div 
          className="bg-white rounded-3xl shadow-2xl p-8 mx-4 max-w-sm w-full text-center animate-in zoom-in-95 slide-in-from-bottom-4 duration-500"
        >
          {/* Icono animado */}
          <div className="relative w-24 h-24 mx-auto mb-4">
            {/* Círculo de fondo */}
            <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
            <div className="absolute inset-2 bg-green-100 rounded-full" />
            
            {/* Check animado */}
            <div className="absolute inset-0 flex items-center justify-center">
              <CheckCircle2 
                className="w-16 h-16 text-green-500 animate-bounce" 
                style={{ animationDuration: '1s' }}
              />
            </div>

            {/* Destellos */}
            <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-400 animate-pulse" />
            <Star className="absolute -bottom-1 -left-1 w-5 h-5 text-yellow-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
          </div>

          {/* Texto de felicitación */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2 animate-pulse">
            ¡Muy bien! 🎉
          </h2>
          <p className="text-lg text-green-600 font-medium mb-1">
            Dosis registrada
          </p>
          <p className="text-gray-500 text-sm">
            ¡Sigue así, vas muy bien!
          </p>

          {/* Barra de progreso animada */}
          <div className="mt-4 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-shrink"
            />
          </div>
        </div>
      </div>

      {/* Confetti decorativo */}
      <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute animate-fall"
            style={{
              left: `${5 + i * 8}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '2s'
            }}
          >
            <div 
              className="w-3 h-3 rounded-sm"
              style={{
                backgroundColor: ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5],
                transform: `rotate(${i * 30}deg)`
              }}
            />
          </div>
        ))}
      </div>

      {/* Auto-hide timer */}
      <AutoHideTimer show={show} onComplete={onComplete} />

      <style jsx global>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes fall {
          0% {
            transform: translateY(-20px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-shrink {
          animation: shrink 2.5s linear forwards;
        }
        .animate-fall {
          animation: fall 2s ease-in-out forwards;
        }
      `}</style>
    </>
  );
}

// Componente separado para el timer
function AutoHideTimer({ show, onComplete }: { show: boolean; onComplete?: () => void }) {
  if (!show) return null;
  
  // Usar setTimeout en lugar de useEffect con setState
  setTimeout(() => {
    onComplete?.();
  }, 2500);
  
  return null;
}

// Componente más simple para usar inline
export function QuickConfirmation({ 
  show, 
  message = "¡Dosis registrada!",
  subMessage = "¡Muy bien!"
}: { 
  show: boolean;
  message?: string;
  subMessage?: string;
}) {
  if (!show) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top duration-300">
      <div className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 animate-bounce" />
        <div>
          <p className="font-semibold">{message}</p>
          {subMessage && <p className="text-sm text-green-100">{subMessage}</p>}
        </div>
      </div>
    </div>
  );
}

export default DoseConfirmation;
