'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WelcomeStep } from './steps/WelcomeStep';
import { PersonalStep } from './steps/PersonalStep';
import { MedicationStep } from './steps/MedicationStep';
import { CaregiverStep } from './steps/CaregiverStep';
import { CompleteStep } from './steps/CompleteStep';
import { Medication } from '@/types/medication';

interface OnboardingWizardProps {
  onComplete: () => void;
  onScanRequest?: () => void;
  scannedMedication?: Partial<Medication>;
}

type StepId = 'welcome' | 'personal' | 'medication' | 'caregiver' | 'complete';

const STEPS: { id: StepId; label: string }[] = [
  { id: 'welcome', label: 'Bienvenida' },
  { id: 'personal', label: 'Datos' },
  { id: 'medication', label: 'Medicamento' },
  { id: 'caregiver', label: 'Cuidador' },
  { id: 'complete', label: 'Listo' },
];

export function OnboardingWizard({ 
  onComplete, 
  onScanRequest,
  scannedMedication 
}: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [scannedData, setScannedData] = useState<Partial<Medication> | undefined>(scannedMedication);

  const currentStep = STEPS[currentStepIndex];
  const isWelcome = currentStep.id === 'welcome';
  const isComplete = currentStep.id === 'complete';
  const isLastStep = currentStepIndex === STEPS.length - 2; // Before complete

  const goToNext = useCallback(() => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex]);

  const goToBack = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const handleSkip = useCallback(() => {
    // Skip to complete step
    setCurrentStepIndex(STEPS.length - 1);
  }, []);

  const handleScanRequest = useCallback(() => {
    if (onScanRequest) {
      onScanRequest();
    }
  }, [onScanRequest]);

  const handleScannedData = useCallback((data: Partial<Medication>) => {
    setScannedData(data);
  }, []);

  // Update scanned data when prop changes
  const effectiveScannedData = scannedMedication || scannedData;

  const renderStep = () => {
    switch (currentStep.id) {
      case 'welcome':
        return (
          <WelcomeStep 
            onNext={goToNext} 
            onSkip={handleSkip} 
          />
        );
      case 'personal':
        return (
          <PersonalStep
            onNext={goToNext}
            onBack={goToBack}
            onSkip={handleSkip}
          />
        );
      case 'medication':
        return (
          <MedicationStep
            onNext={goToNext}
            onBack={goToBack}
            onSkip={handleSkip}
            onScanRequest={handleScanRequest}
            scannedData={effectiveScannedData}
          />
        );
      case 'caregiver':
        return (
          <CaregiverStep
            onNext={goToNext}
            onBack={goToBack}
            onSkip={handleSkip}
          />
        );
      case 'complete':
        return (
          <CompleteStep onFinish={onComplete} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-50 to-white z-50 overflow-y-auto">
      {/* Skip button (always visible except on complete) */}
      {!isComplete && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="h-10 px-4 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5 mr-1" />
            Omitir todo
          </Button>
        </div>
      )}

      {/* Progress dots */}
      {!isWelcome && !isComplete && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <div className="flex items-center gap-2">
            {STEPS.slice(1, -1).map((step, index) => {
              const stepIndex = index + 1; // Adjust for welcome being 0
              const isActive = stepIndex === currentStepIndex;
              const isCompleted = stepIndex < currentStepIndex;
              
              return (
                <motion.div
                  key={step.id}
                  initial={false}
                  animate={{
                    scale: isActive ? 1.3 : 1,
                  }}
                  className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                    isActive
                      ? 'bg-blue-600'
                      : isCompleted
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                  }`}
                />
              );
            })}
          </div>
          <p className="text-center text-sm text-gray-500 mt-1">
            Paso {currentStepIndex} de {STEPS.length - 1}
          </p>
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
