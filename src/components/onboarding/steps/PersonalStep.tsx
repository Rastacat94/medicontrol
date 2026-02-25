'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { User, Phone, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMedicationStore } from '@/store/medication-store';

interface PersonalStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function PersonalStep({ onNext, onBack, onSkip }: PersonalStepProps) {
  const { profile, updateProfile } = useMedicationStore();
  const [name, setName] = useState(profile?.name || '');
  const [age, setAge] = useState(profile?.age?.toString() || '');
  const [phone, setPhone] = useState(profile?.phone || '');

  const handleNext = () => {
    if (name.trim()) {
      updateProfile({
        name: name.trim(),
        age: age ? parseInt(age) : undefined,
        phone: phone.trim() || undefined,
      });
    }
    onNext();
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-[70vh] px-4 py-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <User className="w-10 h-10 text-blue-600" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Cuéntame sobre ti
        </h2>
        <p className="text-lg text-gray-600">
          Para personalizar tus recordatorios
        </p>
      </div>

      {/* Form */}
      <div className="flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-lg font-medium text-gray-700">
            ¿Cómo te llamas?
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre"
              className="h-14 pl-12 text-lg md:text-xl border-2 focus:border-blue-500 rounded-xl"
            />
          </div>
        </div>

        {/* Age */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-lg font-medium text-gray-700">
            Tu edad (opcional)
          </Label>
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <Input
              id="age"
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Ej: 75"
              min="1"
              max="120"
              className="h-14 pl-12 text-lg md:text-xl border-2 focus:border-blue-500 rounded-xl"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-lg font-medium text-gray-700">
            Tu teléfono (para alertas)
          </Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 555-123-4567"
              className="h-14 pl-12 text-lg md:text-xl border-2 focus:border-blue-500 rounded-xl"
            />
          </div>
          <p className="text-sm text-gray-500 ml-2">
            Solo lo usaremos para enviarte recordatorios importantes
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 mt-8 max-w-md mx-auto w-full">
        <Button
          onClick={handleNext}
          disabled={!name.trim()}
          className="h-14 md:h-16 text-xl md:text-2xl font-semibold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-lg disabled:opacity-50"
        >
          Siguiente
        </Button>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onBack}
            className="flex-1 h-12 text-base md:text-lg rounded-xl"
          >
            Atrás
          </Button>
          <Button
            variant="ghost"
            onClick={onSkip}
            className="flex-1 h-12 text-base text-gray-500 hover:text-gray-700"
          >
            Omitir
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
