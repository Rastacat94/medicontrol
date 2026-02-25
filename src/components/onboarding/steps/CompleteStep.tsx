'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, Pill, Users, Bell, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMedicationStore } from '@/store/medication-store';

interface CompleteStepProps {
  onFinish: () => void;
}

export function CompleteStep({ onFinish }: CompleteStepProps) {
  const { profile, medications, caregivers } = useMedicationStore();

  const summaryItems = [
    {
      icon: <CheckCircle2 className="w-6 h-6 text-green-600" />,
      text: profile?.name 
        ? `Hola, ${profile.name}` 
        : 'Perfil configurado',
      color: 'bg-green-50 border-green-200',
    },
    {
      icon: <Pill className="w-6 h-6 text-blue-600" />,
      text: medications.length > 0
        ? `${medications.length} medicamento${medications.length > 1 ? 's' : ''} agregado${medications.length > 1 ? 's' : ''}`
        : 'Puedes agregar medicamentos después',
      color: 'bg-blue-50 border-blue-200',
    },
    {
      icon: <Users className="w-6 h-6 text-purple-600" />,
      text: caregivers.length > 0
        ? `${caregivers[0].name} puede ayudarte`
        : 'Puedes agregar cuidadores después',
      color: 'bg-purple-50 border-purple-200',
    },
    {
      icon: <Bell className="w-6 h-6 text-amber-600" />,
      text: 'Recibirás recordatorios puntuales',
      color: 'bg-amber-50 border-amber-200',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 py-6"
    >
      {/* Celebration animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        className="relative mb-6"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            repeat: Infinity, 
            duration: 3,
            repeatType: 'reverse'
          }}
          className="w-28 h-28 md:w-32 md:h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl"
        >
          <CheckCircle2 className="w-14 h-14 md:w-16 md:h-16 text-white" />
        </motion.div>
        
        {/* Confetti effect */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 0 }}
            animate={{ 
              opacity: [0, 1, 0],
              y: -50 - Math.random() * 50,
              x: (Math.random() - 0.5) * 100,
            }}
            transition={{ 
              delay: 0.3 + i * 0.1,
              duration: 1,
              repeat: Infinity,
              repeatDelay: 2
            }}
            className="absolute top-1/2 left-1/2"
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'][i % 5],
            }}
          />
        ))}
      </motion.div>

      {/* Main message */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-3xl md:text-4xl font-bold text-gray-900 mb-3"
      >
        ¡Todo listo!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-lg md:text-xl text-gray-600 mb-8"
      >
        Ya puedes empezar a usar tu asistente
      </motion.p>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full max-w-sm space-y-3 mb-8"
      >
        {summaryItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            className={`flex items-center gap-3 p-4 rounded-xl border ${item.color}`}
          >
            {item.icon}
            <span className="text-base md:text-lg font-medium text-left">
              {item.text}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Finish button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="w-full max-w-sm"
      >
        <Button
          onClick={onFinish}
          className="h-14 md:h-16 text-xl md:text-2xl font-semibold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 rounded-xl shadow-lg w-full"
        >
          Ir a mi panel
          <ArrowRight className="w-6 h-6 ml-2" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
