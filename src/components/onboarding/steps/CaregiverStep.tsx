'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Users, User, Phone, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMedicationStore } from '@/store/medication-store';

interface CaregiverStepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
}

export function CaregiverStep({ onNext, onBack, onSkip }: CaregiverStepProps) {
  const { caregivers, addCaregiver } = useMedicationStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddCaregiver = () => {
    if (!name.trim() || !phone.trim()) return;

    setIsAdding(true);
    
    addCaregiver({
      name: name.trim(),
      phone: phone.trim(),
      relationship: relationship.trim() || 'Familiar',
      receiveAlerts: true,
    });

    // Small delay for visual feedback
    setTimeout(() => {
      setIsAdding(false);
      onNext();
    }, 500);
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
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Users className="w-10 h-10 text-purple-600" />
        </motion.div>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          ¿Quieres que alguien te ayude?
        </h2>
        <p className="text-lg text-gray-600">
          Un familiar puede recibir alertas si olvidas una dosis
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col gap-5 max-w-md mx-auto w-full">
        {/* Existing caregivers */}
        {caregivers.length > 0 && (
          <div className="p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <Heart className="w-5 h-5" />
              <span className="font-medium">
                {caregivers.length} cuidador{caregivers.length > 1 ? 'es' : ''} agregado{caregivers.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}

        {/* Form */}
        <div className="space-y-2">
          <Label htmlFor="cg-name" className="text-lg font-medium text-gray-700">
            Nombre de la persona
          </Label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <Input
              id="cg-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: María (mi hija)"
              className="h-14 pl-12 text-lg md:text-xl border-2 focus:border-purple-500 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cg-phone" className="text-lg font-medium text-gray-700">
            Su número de teléfono
          </Label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            <Input
              id="cg-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 555-123-4567"
              className="h-14 pl-12 text-lg md:text-xl border-2 focus:border-purple-500 rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cg-relation" className="text-lg font-medium text-gray-700">
            Parentesco (opcional)
          </Label>
          <Input
            id="cg-relation"
            type="text"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            placeholder="Ej: Hijo/a, Esposo/a, Hermano/a"
            className="h-14 text-lg md:text-xl border-2 focus:border-purple-500 rounded-xl"
          />
        </div>

        {/* Helper text */}
        <div className="p-4 bg-blue-50 rounded-xl">
          <p className="text-base text-blue-700">
            📱 Esta persona recibirá un mensaje si olvidas tomar un medicamento importante
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 mt-6 max-w-md mx-auto w-full">
        <Button
          onClick={handleAddCaregiver}
          disabled={!name.trim() || !phone.trim() || isAdding}
          className="h-14 md:h-16 text-xl md:text-2xl font-semibold bg-purple-600 hover:bg-purple-700 rounded-xl shadow-lg disabled:opacity-50"
        >
          {isAdding ? 'Guardando...' : '¡Listo!'}
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
            Omitir por ahora
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
