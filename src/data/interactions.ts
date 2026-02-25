import { Interaction } from '@/types/medication';

// Base de datos de interacciones medicamentosas comunes
// Esta es una base de datos de referencia, no sustituye el consejo médico profesional

export const medicationInteractions: Interaction[] = [
  // Interacciones con anticoagulantes
  {
    id: 'int-001',
    medication1: 'warfarina',
    medication2: 'ain',
    severity: 'grave',
    description: 'Los AINEs (ibuprofeno, naproxeno, diclofenaco) pueden aumentar significativamente el riesgo de sangrado cuando se combinan con warfarina.',
    recommendation: 'Evitar la combinación. Si es necesario, usar el AINE de menor riesgo y bajo estricta supervisión médica con monitoreo frecuente del INR.',
    symptoms: ['Sangrado gastrointestinal', 'Hematomas', 'Sangrado nasal', 'Sangrado de encías']
  },
  {
    id: 'int-002',
    medication1: 'warfarina',
    medication2: 'aspirina',
    severity: 'grave',
    description: 'La aspirina aumenta el riesgo de sangrado cuando se combina con warfarina debido a sus efectos aditivos sobre la coagulación.',
    recommendation: 'Solo usar bajo supervisión médica estricta. Monitorear signos de sangrado.',
    symptoms: ['Sangrado gastrointestinal', 'Hemorragia interna', 'Petequias']
  },
  {
    id: 'int-003',
    medication1: 'warfarina',
    medication2: 'omeprazol',
    severity: 'moderada',
    description: 'El omeprazol puede aumentar los niveles de warfarina en sangre, incrementando el riesgo de sangrado.',
    recommendation: 'Monitorear el INR más frecuentemente. Ajustar dosis de warfarina si es necesario.',
    symptoms: ['Sangrado anormal', 'Moretones sin causa']
  },

  // Interacciones con medicamentos para diabetes
  {
    id: 'int-004',
    medication1: 'metformina',
    medication2: 'alcohol',
    severity: 'grave',
    description: 'El alcohol aumenta significativamente el riesgo de acidosis láctica cuando se toma con metformina.',
    recommendation: 'Evitar el consumo de alcohol mientras se toma metformina. Si se consume, limitar a cantidades muy pequeñas.',
    symptoms: ['Debilidad', 'Dificultad para respirar', 'Mareos', 'Náuseas intensas', 'Dolor abdominal']
  },
  {
    id: 'int-005',
    medication1: 'insulina',
    medication2: 'beta-bloqueadores',
    severity: 'moderada',
    description: 'Los beta-bloqueadores pueden enmascarar los síntomas de hipoglucemia (taquicardia, temblor) causados por la insulina.',
    recommendation: 'Monitorear los niveles de glucosa con más frecuencia. Educar sobre otros síntomas de hipoglucemia.',
    symptoms: ['Hipoglucemia sin síntomas típicos', 'Sudoración fría', 'Confusión']
  },
  {
    id: 'int-006',
    medication1: 'metformina',
    medication2: 'cimetidina',
    severity: 'moderada',
    description: 'La cimetidina puede aumentar los niveles de metformina en sangre, incrementando el riesgo de efectos adversos.',
    recommendation: 'Considerar otros antiácidos H2 o reducir dosis de metformina bajo supervisión médica.',
    symptoms: ['Acidosis láctica', 'Problemas renales']
  },

  // Interacciones con medicamentos cardiovasculares
  {
    id: 'int-007',
    medication1: 'ieca',
    medication2: 'potasio',
    severity: 'moderada',
    description: 'Los inhibidores de la ECA (enalapril, lisinopril, ramipril) pueden aumentar los niveles de potasio. Los suplementos de potasio aumentan este riesgo.',
    recommendation: 'Evitar suplementos de potasio sin supervisión médica. Monitorear niveles de potasio regularmente.',
    symptoms: ['Debilidad muscular', 'Arritmias', 'Fatiga', 'Hormigueo']
  },
  {
    id: 'int-008',
    medication1: 'digoxina',
    medication2: 'diureticos',
    severity: 'moderada',
    description: 'Los diuréticos (furosemida, hidroclorotiazida) pueden causar pérdida de potasio, lo que aumenta el riesgo de toxicidad por digoxina.',
    recommendation: 'Monitorear niveles de potasio y digoxina. Considerar suplementación de potasio si es necesario.',
    symptoms: ['Náuseas', 'Vómitos', 'Visión borrosa', 'Arritmias', 'Confusión']
  },
  {
    id: 'int-009',
    medication1: 'digoxina',
    medication2: 'amiodarona',
    severity: 'grave',
    description: 'La amiodarona puede aumentar significativamente los niveles de digoxina en sangre, causando toxicidad.',
    recommendation: 'Reducir la dosis de digoxina en 50% cuando se inicie amiodarona. Monitorear niveles de digoxina.',
    symptoms: ['Toxicidad por digoxina', 'Arritmias graves', 'Náuseas severas']
  },
  {
    id: 'int-010',
    medication1: 'aspirina',
    medication2: 'anticoagulantes',
    severity: 'grave',
    description: 'La combinación de aspirina con anticoagulantes aumenta significativamente el riesgo de sangrado.',
    recommendation: 'Solo usar bajo supervisión médica estricta. Evaluar relación riesgo-beneficio.',
    symptoms: ['Sangrado gastrointestinal', 'Hemorragia', 'Moretones extensos']
  },

  // Interacciones con estatinas
  {
    id: 'int-011',
    medication1: 'estatinas',
    medication2: 'toronja',
    severity: 'moderada',
    description: 'El jugo de toronja puede aumentar los niveles de algunas estatinas (atorvastatina, simvastatina, lovastatina) en sangre, incrementando el riesgo de efectos secundarios.',
    recommendation: 'Evitar el consumo de jugo de toronja mientras se toman estas estatinas. La toronja entera también debe evitarse.',
    symptoms: ['Dolor muscular', 'Debilidad', 'Orina oscura', 'Problemas hepáticos']
  },
  {
    id: 'int-012',
    medication1: 'estatinas',
    medication2: 'claritromicina',
    severity: 'grave',
    description: 'La claritromicina puede aumentar significativamente los niveles de estatinas, causando rabdomiólisis.',
    recommendation: 'Suspender temporalmente la estatina durante el tratamiento con claritromicina.',
    symptoms: ['Dolor muscular intenso', 'Debilidad severa', 'Orina oscura', 'Insuficiencia renal']
  },

  // Interacciones con antibióticos
  {
    id: 'int-013',
    medication1: 'antiacidos',
    medication2: 'antibioticos',
    severity: 'leve',
    description: 'Los antiácidos pueden reducir la absorción de algunos antibióticos como tetraciclinas, fluoroquinolonas (ciprofloxacino, levofloxacino) y azitromicina.',
    recommendation: 'Tomar el antiácido al menos 2 horas antes o 4-6 horas después del antibiótico.',
    symptoms: ['Reducción de efectividad del antibiótico']
  },
  {
    id: 'int-014',
    medication1: 'metronidazol',
    medication2: 'alcohol',
    severity: 'moderada',
    description: 'El metronidazol combinado con alcohol causa una reacción tipo disulfiram (efecto antabuse) con síntomas desagradables.',
    recommendation: 'Evitar completamente el alcohol durante el tratamiento y hasta 48 horas después de terminarlo.',
    symptoms: ['Náuseas intensas', 'Vómitos', 'Dolor abdominal', 'Dolor de cabeza', 'Rubor facial']
  },

  // Interacciones con medicamentos para la tiroides
  {
    id: 'int-015',
    medication1: 'levotiroxina',
    medication2: 'calcio',
    severity: 'leve',
    description: 'Los suplementos de calcio pueden reducir la absorción de levotiroxina.',
    recommendation: 'Tomar levotiroxina al menos 4 horas antes o después del suplemento de calcio.',
    symptoms: ['Reducción de efectividad del medicamento para tiroides']
  },
  {
    id: 'int-016',
    medication1: 'levotiroxina',
    medication2: 'hierro',
    severity: 'leve',
    description: 'Los suplementos de hierro pueden reducir la absorción de levotiroxina.',
    recommendation: 'Tomar levotiroxina al menos 4 horas antes o después del suplemento de hierro.',
    symptoms: ['Reducción de efectividad del medicamento para tiroides']
  },

  // Interacciones con medicamentos para depresión/ansiedad
  {
    id: 'int-017',
    medication1: 'isrs',
    medication2: 'imao',
    severity: 'grave',
    description: 'La combinación de inhibidores de la monoaminooxidasa (IMAO) con inhibidores selectivos de la recaptación de serotonina (ISRS) puede causar síndrome serotoninérgico.',
    recommendation: 'No combinar. Esperar al menos 2 semanas (5 semanas para fluoxetina) después de suspender el ISRS antes de iniciar un IMAO.',
    symptoms: ['Agitación', 'Confusión', 'Fiebre', 'Rigidez muscular', 'Taquicardia', 'Puede ser mortal']
  },
  {
    id: 'int-018',
    medication1: 'isrs',
    medication2: 'tramadol',
    severity: 'moderada',
    description: 'La combinación puede aumentar el riesgo de síndrome serotoninérgico y convulsiones.',
    recommendation: 'Usar con precaución. Monitorear signos de toxicidad serotoninérgica.',
    symptoms: ['Síndrome serotoninérgico', 'Convulsiones', 'Temblor', 'Hiperreflexia']
  },

  // Otras interacciones importantes
  {
    id: 'int-019',
    medication1: 'levodopa',
    medication2: 'proteinas',
    severity: 'leve',
    description: 'Las proteínas de la dieta pueden interferir con la absorción de levodopa.',
    recommendation: 'Tomar levodopa 30-60 minutos antes de las comidas o distribuir la ingesta de proteínas uniformemente durante el día.',
    symptoms: ['Reducción de efectividad del medicamento para Parkinson']
  },
  {
    id: 'int-020',
    medication1: 'teofilina',
    medication2: 'tabaco',
    severity: 'moderada',
    description: 'El tabaco aumenta el metabolismo de la teofilina, reduciendo sus niveles en sangre.',
    recommendation: 'Los fumadores pueden necesitar dosis más altas. Ajustar dosis al dejar de fumar.',
    symptoms: ['Efectividad reducida', 'Síntomas de asma o EPOC no controlados']
  },
  {
    id: 'int-021',
    medication1: 'anticonceptivos',
    medication2: 'antibioticos',
    severity: 'leve',
    description: 'Algunos antibióticos (rifampicina, rifabutina) pueden reducir la efectividad de los anticonceptivos orales.',
    recommendation: 'Usar método anticonceptivo adicional mientras se toman estos antibióticos y por 7 días después.',
    symptoms: ['Posible falla anticonceptiva']
  },
  {
    id: 'int-022',
    medication1: 'bisfosfonatos',
    medication2: 'lacteos',
    severity: 'leve',
    description: 'Los productos lácteos pueden reducir significativamente la absorción de bisfosfonatos (alendronato, risedronato).',
    recommendation: 'Tomar bisfosfonatos con agua, en ayunas, al menos 30 minutos antes del primer alimento o bebida del día.',
    symptoms: ['Reducción de efectividad del tratamiento para osteoporosis']
  },

  // Interacciones con medicamentos para el dolor
  {
    id: 'int-023',
    medication1: 'tramadol',
    medication2: 'alcohol',
    severity: 'grave',
    description: 'El alcohol aumenta los efectos depresores del sistema nervioso central del tramadol, con riesgo de depresión respiratoria.',
    recommendation: 'Evitar completamente el alcohol mientras se toma tramadol.',
    symptoms: ['Sedación excesiva', 'Depresión respiratoria', 'Coma', 'Muerte']
  },
  {
    id: 'int-024',
    medication1: 'paracetamol',
    medication2: 'alcohol',
    severity: 'moderada',
    description: 'El consumo de alcohol junto con paracetamol aumenta el riesgo de daño hepático.',
    recommendation: 'Limitar o evitar el alcohol mientras se toma paracetamol regularmente. No exceder la dosis recomendada.',
    symptoms: ['Daño hepático', 'Náuseas', 'Ictericia']
  },

  // Interacciones con corticosteroides
  {
    id: 'int-025',
    medication1: 'corticosteroides',
    medication2: 'ain',
    severity: 'moderada',
    description: 'La combinación de corticosteroides y AINEs aumenta significativamente el riesgo de úlceras y sangrado gastrointestinal.',
    recommendation: 'Evitar la combinación. Si es necesario, usar el AINE de menor riesgo por el menor tiempo posible y considerar protectores gástricos.',
    symptoms: ['Úlcera péptica', 'Sangrado gastrointestinal', 'Dolor abdominal']
  },

  // Interacciones con medicamentos para gota
  {
    id: 'int-026',
    medication1: 'alopurinol',
    medication2: 'azatioprina',
    severity: 'grave',
    description: 'El alopurinol puede aumentar significativamente los niveles de azatioprina, causando toxicidad grave.',
    recommendation: 'Reducir la dosis de azatioprina a 25-33% de la dosis habitual. Monitoreo estrecho.',
    symptoms: ['Supresión de médula ósea', 'Infecciones', 'Sangrado']
  },

  // Interacciones con antiepilépticos
  {
    id: 'int-027',
    medication1: 'carbamazepina',
    medication2: 'jugotoronja',
    severity: 'leve',
    description: 'El jugo de toronja puede aumentar los niveles de carbamazepina en sangre.',
    recommendation: 'Evitar el consumo regular de jugo de toronja. Monitorear niveles del medicamento.',
    symptoms: ['Mareo', 'Visión doble', 'Náuseas', 'Ataxia']
  },

  // Interacciones con medicamentos oculares
  {
    id: 'int-028',
    medication1: 'timolol',
    medication2: 'beta-bloqueadores',
    severity: 'moderada',
    description: 'Las gotas oftálmicas de timolol pueden tener efectos sistémicos aditivos con los beta-bloqueadores orales.',
    recommendation: 'Monitorear presión arterial y frecuencia cardíaca. Considerar otros tratamientos oculares.',
    symptoms: ['Bradicardia', 'Hipotensión', 'Broncoespasmo']
  },

  // Interacciones con anticolinérgicos
  {
    id: 'int-029',
    medication1: 'anticolinergicos',
    medication2: 'anticolinergicos',
    severity: 'moderada',
    description: 'La combinación de múltiples medicamentos con efectos anticolinérgicos aumenta el riesgo de efectos adversos, especialmente en ancianos.',
    recommendation: 'Revisar todos los medicamentos. Reducir o eliminar aquellos que no sean esenciales. Monitorear función cognitiva.',
    symptoms: ['Sequedad de boca', 'Estreñimiento', 'Retención urinaria', 'Confusión', 'Caídas']
  },

  // Interacciones con antiagregantes
  {
    id: 'int-030',
    medication1: 'clopidogrel',
    medication2: 'omeprazol',
    severity: 'moderada',
    description: 'El omeprazol puede reducir la activación del clopidogrel, disminuyendo su efectividad antiagregante.',
    recommendation: 'Considerar usar pantoprazol o tomar omeprazol 12 horas después del clopidogrel.',
    symptoms: ['Reducción de efectividad antiagregante', 'Eventos cardiovasculares']
  }
];

// Función para buscar interacciones por nombre de medicamento
export function findInteractions(medicationName: string): Interaction[] {
  const normalizedName = medicationName.toLowerCase().trim();
  
  return medicationInteractions.filter(
    interaction => 
      interaction.medication1.toLowerCase().includes(normalizedName) ||
      interaction.medication2.toLowerCase().includes(normalizedName) ||
      normalizedName.includes(interaction.medication1.toLowerCase()) ||
      normalizedName.includes(interaction.medication2.toLowerCase())
  );
}

// Función para buscar interacciones entre dos medicamentos específicos
export function findInteractionBetween(med1: string, med2: string): Interaction | undefined {
  const norm1 = med1.toLowerCase().trim();
  const norm2 = med2.toLowerCase().trim();
  
  return medicationInteractions.find(
    interaction => 
      (interaction.medication1.toLowerCase().includes(norm1) || norm1.includes(interaction.medication1.toLowerCase())) &&
      (interaction.medication2.toLowerCase().includes(norm2) || norm2.includes(interaction.medication2.toLowerCase())) ||
      (interaction.medication1.toLowerCase().includes(norm2) || norm2.includes(interaction.medication1.toLowerCase())) &&
      (interaction.medication2.toLowerCase().includes(norm1) || norm1.includes(interaction.medication2.toLowerCase()))
  );
}

// Función para verificar interacciones de un nuevo medicamento con los existentes
export function checkNewMedicationInteractions(
  newMedicationName: string, 
  existingMedications: string[]
): Interaction[] {
  const interactions: Interaction[] = [];
  
  for (const existing of existingMedications) {
    const interaction = findInteractionBetween(newMedicationName, existing);
    if (interaction) {
      interactions.push(interaction);
    }
  }
  
  return interactions;
}

// Función para obtener el color según severidad
export function getSeverityColor(severity: InteractionSeverity): string {
  switch (severity) {
    case 'grave':
      return 'bg-red-500';
    case 'moderada':
      return 'bg-orange-500';
    case 'leve':
      return 'bg-yellow-500';
    default:
      return 'bg-gray-500';
  }
}

// Función para obtener el color de fondo según severidad
export function getSeverityBgColor(severity: InteractionSeverity): string {
  switch (severity) {
    case 'grave':
      return 'bg-red-50 border-red-200';
    case 'moderada':
      return 'bg-orange-50 border-orange-200';
    case 'leve':
      return 'bg-yellow-50 border-yellow-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
}
