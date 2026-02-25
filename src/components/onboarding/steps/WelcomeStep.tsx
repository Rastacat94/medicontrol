'use client';

import { motion } from 'framer-motion';
import { Heart, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WelcomeStepProps {
  onNext: () => void;
  onSkip: () => void;
}

export function WelcomeStep({ onNext, onSkip }: WelcomeStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4"
    >
      {/* Friendly illustration */}
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="relative mb-8"
      >
        <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center shadow-lg">
          <Heart className="w-16 h-16 md:w-20 md:h-20 text-red-500" />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 -right-2"
          >
            <Sparkles className="w-8 h-8 text-yellow-500" />
          </motion.div>
        </div>
      </motion.div>

      {/* Main message */}
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 leading-tight"
      >
        Hola, soy tu asistente de medicamentos
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-lg md:text-xl text-gray-600 mb-6 max-w-md leading-relaxed"
      >
        Te ayudo a recordar cuándo tomar tus medicinas de forma fácil y segura.
      </motion.p>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex flex-col gap-3 mb-8 w-full max-w-sm"
      >
        <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl">
          <span className="text-3xl">📸</span>
          <p className="text-base md:text-lg text-left text-gray-700">
            Escanea tus medicamentos con la cámara
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl">
          <span className="text-3xl">⏰</span>
          <p className="text-base md:text-lg text-left text-gray-700">
            Recibe recordatorios a la hora exacta
          </p>
        </div>
        <div className="flex items-center gap-4 p-4 bg-amber-50 rounded-xl">
          <span className="text-3xl">👨‍👩‍👧</span>
          <p className="text-base md:text-lg text-left text-gray-700">
            Tu familia puede ayudarte desde lejos
          </p>
        </div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col gap-3 w-full max-w-sm"
      >
        <Button
          onClick={onNext}
          className="h-14 md:h-16 text-xl md:text-2xl font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg"
        >
          Comenzar
        </Button>
        <Button
          variant="ghost"
          onClick={onSkip}
          className="h-12 text-base text-gray-500 hover:text-gray-700"
        >
          Omitir por ahora
        </Button>
      </motion.div>
    </motion.div>
  );
}
