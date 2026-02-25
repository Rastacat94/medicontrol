// Sistema de internacionalización (i18n) para MediControl
// Soporte: Español (principal), English

export type Language = 'es' | 'en';

export const languages: Language[] = ['es', 'en'];

export const defaultLanguage: Language = 'es';

// Detectar idioma del navegador
export function detectBrowserLanguage(): Language {
  if (typeof window === 'undefined') return defaultLanguage;
  
  const browserLang = navigator.language.split('-')[0];
  return languages.includes(browserLang as Language) 
    ? (browserLang as Language) 
    : defaultLanguage;
}

// Obtener idioma guardado o detectar
export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return defaultLanguage;
  
  const stored = localStorage.getItem('medicontrol-language');
  if (stored && languages.includes(stored as Language)) {
    return stored as Language;
  }
  return detectBrowserLanguage();
}

// Guardar preferencia de idioma
export function setStoredLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('medicontrol-language', lang);
  }
}

// Función de traducción simple
export function t(key: string, lang: Language = defaultLanguage): string {
  const keys = key.split('.');
  let value: unknown = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      // Fallback a español si no existe
      value = translations.es;
      for (const k2 of keys) {
        if (value && typeof value === 'object' && k2 in value) {
          value = (value as Record<string, unknown>)[k2];
        } else {
          return key; // Return key if not found
        }
      }
      break;
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Traducciones
export const translations: Record<Language, Record<string, unknown>> = {
  es: {
    // App general
    app: {
      name: 'MediControl',
      tagline: 'Tu asistente de medicamentos',
      description: 'Control de medicamentos personal',
    },
    
    // Navegación
    nav: {
      dashboard: 'Inicio',
      medications: 'Medicamentos',
      inventory: 'Inventario',
      alerts: 'Alertas',
      history: 'Historial',
      reports: 'Reportes',
      share: 'Compartir',
      settings: 'Configuración',
    },
    
    // Autenticación
    auth: {
      login: 'Iniciar Sesión',
      register: 'Crear Cuenta',
      logout: 'Cerrar sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      name: 'Nombre completo',
      phone: 'Teléfono',
      rememberMe: 'Recordarme',
      forgotPassword: '¿Olvidaste tu contraseña?',
      noAccount: '¿No tienes cuenta?',
      hasAccount: '¿Ya tienes cuenta?',
      signupFree: 'Regístrate gratis',
      loginTitle: 'Iniciar Sesión',
      loginSubtitle: 'Accede a tu cuenta de MediControl',
      registerTitle: 'Crear Cuenta',
      registerSubtitle: 'Únete a MediControl gratis',
      demoUser: 'Demo Usuario',
      demoPremium: 'Demo Premium',
      passwordStrength: 'Seguridad',
      acceptTerms: 'Acepto los Términos de Servicio y la Política de Privacidad',
    },
    
    // Dashboard
    dashboard: {
      title: 'Buen día',
      todayMedications: 'Medicamentos de hoy',
      pending: 'pendientes',
      taken: 'tomados',
      skipped: 'omitidos',
      noMedications: 'No tienes medicamentos configurados',
      addFirst: 'Agrega tu primer medicamento',
      nextDose: 'Próxima dosis',
      allTaken: '¡Todo tomado por hoy!',
    },
    
    // Medicamentos
    medications: {
      title: 'Mis Medicamentos',
      add: 'Agregar medicamento',
      scan: 'Escanear caja',
      edit: 'Editar',
      delete: 'Eliminar',
      name: 'Nombre del medicamento',
      dose: 'Dosis',
      frequency: 'Frecuencia',
      times: 'Horarios',
      instructions: 'Instrucciones',
      startDate: 'Fecha de inicio',
      endDate: 'Fecha de fin (opcional)',
      active: 'Activo',
      inactive: 'Inactivo',
      critical: 'Crítico',
      stock: 'Stock actual',
      lowStock: 'Stock bajo',
      reorder: 'Pedir más',
    },
    
    // Inventario
    inventory: {
      title: 'Control de Inventario',
      currentStock: 'Stock actual',
      remaining: 'restantes',
      daysLeft: 'días restantes',
      lowStockAlert: 'Alerta de stock bajo',
      needsReorder: 'Necesita reposición',
      updateStock: 'Actualizar stock',
      lastUpdated: 'Última actualización',
    },
    
    // Alertas
    alerts: {
      title: 'Alertas',
      missedDose: 'Dosis omitida',
      lowStock: 'Stock bajo',
      interaction: 'Interacción detectada',
      panicButton: 'Botón de pánico',
      sendAlert: 'Enviar alerta',
      alertSent: 'Alerta enviada',
      noAlerts: 'No hay alertas recientes',
    },
    
    // Interacciones
    interactions: {
      title: 'Interacciones Medicamentosas',
      severe: 'Severa',
      moderate: 'Moderada',
      mild: 'Leve',
      warning: 'Advertencia',
      description: 'Descripción',
      recommendation: 'Recomendación',
      consultDoctor: 'Consulta con tu médico',
    },
    
    // Historial
    history: {
      title: 'Historial de Dosis',
      today: 'Hoy',
      yesterday: 'Ayer',
      thisWeek: 'Esta semana',
      thisMonth: 'Este mes',
      noRecords: 'No hay registros',
      adherence: 'Cumplimiento',
    },
    
    // Reportes
    reports: {
      title: 'Reportes',
      weekly: 'Semanal',
      monthly: 'Mensual',
      download: 'Descargar PDF',
      share: 'Compartir con médico',
      adherenceRate: 'Tasa de cumplimiento',
    },
    
    // Compartir
    share: {
      title: 'Compartir',
      caregivers: 'Cuidadores',
      addCaregiver: 'Añadir cuidador',
      caregiverName: 'Nombre',
      caregiverPhone: 'Teléfono',
      caregiverEmail: 'Email',
      relationship: 'Relación',
      receiveAlerts: 'Recibir alertas',
      shareReport: 'Compartir reporte',
    },
    
    // Configuración
    settings: {
      title: 'Configuración',
      profile: 'Perfil',
      account: 'Mi Cuenta',
      notifications: 'Notificaciones',
      language: 'Idioma',
      theme: 'Tema',
      data: 'Datos',
      export: 'Exportar backup',
      import: 'Importar backup',
      deleteAll: 'Eliminar todos los datos',
      deleteConfirm: 'Esta acción no se puede deshacer',
      about: 'Acerca de',
      version: 'Versión',
      legal: 'Legal',
      privacy: 'Política de Privacidad',
      terms: 'Términos de Servicio',
    },
    
    // Premium
    premium: {
      title: 'Plan Escudo Familiar',
      subtitle: 'Protección completa para ti y los tuyos',
      monthly: 'Mensual',
      yearly: 'Anual',
      lifetime: 'Vitalicio',
      subscribe: 'Suscribirse',
      currentPlan: 'Plan actual',
      benefits: {
        unlimitedSms: 'SMS ilimitados de alerta',
        noAds: 'Sin publicidad',
        cloudBackup: 'Backup en la nube',
        prioritySupport: 'Soporte prioritario',
        familySharing: 'Compartir con familia',
      },
    },
    
    // SMS Packs
    sms: {
      title: 'Paquetes de SMS',
      credits: 'créditos',
      buy: 'Comprar',
      remaining: 'restantes',
      packs: {
        small: 'Pack 10 SMS',
        medium: 'Pack 50 SMS',
        large: 'Pack 100 SMS',
      },
    },
    
    // Onboarding
    onboarding: {
      welcome: '¡Bienvenido!',
      welcomeMessage: 'Hola, soy tu asistente de medicamentos',
      step1Title: 'Tus datos',
      step2Title: 'Tu primer medicamento',
      step3Title: 'Cuidador (opcional)',
      complete: '¡Todo listo!',
      skip: 'Omitir por ahora',
      back: 'Atrás',
      next: 'Siguiente',
      finish: 'Comenzar',
      scanBox: 'Escanear caja',
      typeName: 'Escribir nombre',
      addCaregiverQuestion: '¿Quieres que alguien te ayude?',
    },
    
    // Errores y mensajes
    errors: {
      required: 'Este campo es obligatorio',
      invalidEmail: 'Email no válido',
      weakPassword: 'Contraseña débil',
      passwordsDontMatch: 'Las contraseñas no coinciden',
      loginFailed: 'Email o contraseña incorrectos',
      emailExists: 'Este email ya está registrado',
      networkError: 'Error de conexión',
      unknownError: 'Ha ocurrido un error',
    },
    
    // Días de la semana
    days: {
      today: 'Hoy',
      yesterday: 'Ayer',
      tomorrow: 'Mañana',
      weekdays: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      weekdaysShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      months: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
               'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    },
    
    // Relaciones
    relationships: {
      hijo: 'Hijo/a',
      hija: 'Hija',
      conyuge: 'Cónyuge',
      padre: 'Padre',
      madre: 'Madre',
      hermano: 'Hermano/a',
      medico: 'Médico',
      enfermera: 'Enfermera/o',
      cuidador: 'Cuidador/a',
      amigo: 'Amigo/a',
      otro: 'Otro',
    },
    
    // Frecuencias
    frequencies: {
      once: 'Una vez al día',
      twice: 'Dos veces al día',
      three: 'Tres veces al día',
      four: 'Cuatro veces al día',
      every4h: 'Cada 4 horas',
      every6h: 'Cada 6 horas',
      every8h: 'Cada 8 horas',
      every12h: 'Cada 12 horas',
      weekly: 'Semanal',
      asNeeded: 'Según necesidad',
    },
  },
  
  en: {
    // App general
    app: {
      name: 'MediControl',
      tagline: 'Your medication assistant',
      description: 'Personal medication control',
    },
    
    // Navegación
    nav: {
      dashboard: 'Home',
      medications: 'Medications',
      inventory: 'Inventory',
      alerts: 'Alerts',
      history: 'History',
      reports: 'Reports',
      share: 'Share',
      settings: 'Settings',
    },
    
    // Autenticación
    auth: {
      login: 'Sign In',
      register: 'Create Account',
      logout: 'Sign out',
      email: 'Email address',
      password: 'Password',
      confirmPassword: 'Confirm password',
      name: 'Full name',
      phone: 'Phone',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot your password?',
      noAccount: "Don't have an account?",
      hasAccount: 'Already have an account?',
      signupFree: 'Sign up free',
      loginTitle: 'Sign In',
      loginSubtitle: 'Access your MediControl account',
      registerTitle: 'Create Account',
      registerSubtitle: 'Join MediControl for free',
      demoUser: 'Demo User',
      demoPremium: 'Demo Premium',
      passwordStrength: 'Strength',
      acceptTerms: 'I accept the Terms of Service and Privacy Policy',
    },
    
    // Dashboard
    dashboard: {
      title: 'Good day',
      todayMedications: "Today's medications",
      pending: 'pending',
      taken: 'taken',
      skipped: 'skipped',
      noMedications: 'You have no medications configured',
      addFirst: 'Add your first medication',
      nextDose: 'Next dose',
      allTaken: 'All taken for today!',
    },
    
    // Medicamentos
    medications: {
      title: 'My Medications',
      add: 'Add medication',
      scan: 'Scan box',
      edit: 'Edit',
      delete: 'Delete',
      name: 'Medication name',
      dose: 'Dose',
      frequency: 'Frequency',
      times: 'Times',
      instructions: 'Instructions',
      startDate: 'Start date',
      endDate: 'End date (optional)',
      active: 'Active',
      inactive: 'Inactive',
      critical: 'Critical',
      stock: 'Current stock',
      lowStock: 'Low stock',
      reorder: 'Reorder',
    },
    
    // Inventario
    inventory: {
      title: 'Inventory Control',
      currentStock: 'Current stock',
      remaining: 'remaining',
      daysLeft: 'days left',
      lowStockAlert: 'Low stock alert',
      needsReorder: 'Needs reorder',
      updateStock: 'Update stock',
      lastUpdated: 'Last updated',
    },
    
    // Alertas
    alerts: {
      title: 'Alerts',
      missedDose: 'Missed dose',
      lowStock: 'Low stock',
      interaction: 'Interaction detected',
      panicButton: 'Panic button',
      sendAlert: 'Send alert',
      alertSent: 'Alert sent',
      noAlerts: 'No recent alerts',
    },
    
    // Interacciones
    interactions: {
      title: 'Drug Interactions',
      severe: 'Severe',
      moderate: 'Moderate',
      mild: 'Mild',
      warning: 'Warning',
      description: 'Description',
      recommendation: 'Recommendation',
      consultDoctor: 'Consult your doctor',
    },
    
    // Historial
    history: {
      title: 'Dose History',
      today: 'Today',
      yesterday: 'Yesterday',
      thisWeek: 'This week',
      thisMonth: 'This month',
      noRecords: 'No records',
      adherence: 'Adherence',
    },
    
    // Reportes
    reports: {
      title: 'Reports',
      weekly: 'Weekly',
      monthly: 'Monthly',
      download: 'Download PDF',
      share: 'Share with doctor',
      adherenceRate: 'Adherence rate',
    },
    
    // Compartir
    share: {
      title: 'Share',
      caregivers: 'Caregivers',
      addCaregiver: 'Add caregiver',
      caregiverName: 'Name',
      caregiverPhone: 'Phone',
      caregiverEmail: 'Email',
      relationship: 'Relationship',
      receiveAlerts: 'Receive alerts',
      shareReport: 'Share report',
    },
    
    // Configuración
    settings: {
      title: 'Settings',
      profile: 'Profile',
      account: 'My Account',
      notifications: 'Notifications',
      language: 'Language',
      theme: 'Theme',
      data: 'Data',
      export: 'Export backup',
      import: 'Import backup',
      deleteAll: 'Delete all data',
      deleteConfirm: 'This action cannot be undone',
      about: 'About',
      version: 'Version',
      legal: 'Legal',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
    },
    
    // Premium
    premium: {
      title: 'Family Shield Plan',
      subtitle: 'Complete protection for you and yours',
      monthly: 'Monthly',
      yearly: 'Yearly',
      lifetime: 'Lifetime',
      subscribe: 'Subscribe',
      currentPlan: 'Current plan',
      benefits: {
        unlimitedSms: 'Unlimited alert SMS',
        noAds: 'No ads',
        cloudBackup: 'Cloud backup',
        prioritySupport: 'Priority support',
        familySharing: 'Share with family',
      },
    },
    
    // SMS Packs
    sms: {
      title: 'SMS Packages',
      credits: 'credits',
      buy: 'Buy',
      remaining: 'remaining',
      packs: {
        small: '10 SMS Pack',
        medium: '50 SMS Pack',
        large: '100 SMS Pack',
      },
    },
    
    // Onboarding
    onboarding: {
      welcome: 'Welcome!',
      welcomeMessage: 'Hi, I am your medication assistant',
      step1Title: 'Your details',
      step2Title: 'Your first medication',
      step3Title: 'Caregiver (optional)',
      complete: 'All set!',
      skip: 'Skip for now',
      back: 'Back',
      next: 'Next',
      finish: 'Start',
      scanBox: 'Scan box',
      typeName: 'Type name',
      addCaregiverQuestion: 'Do you want someone to help you?',
    },
    
    // Errores y mensajes
    errors: {
      required: 'This field is required',
      invalidEmail: 'Invalid email',
      weakPassword: 'Weak password',
      passwordsDontMatch: "Passwords don't match",
      loginFailed: 'Incorrect email or password',
      emailExists: 'This email is already registered',
      networkError: 'Connection error',
      unknownError: 'An error occurred',
    },
    
    // Días de la semana
    days: {
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: ['January', 'February', 'March', 'April', 'May', 'June',
               'July', 'August', 'September', 'October', 'November', 'December'],
    },
    
    // Relaciones
    relationships: {
      hijo: 'Son',
      hija: 'Daughter',
      conyuge: 'Spouse',
      padre: 'Father',
      madre: 'Mother',
      hermano: 'Sibling',
      medico: 'Doctor',
      enfermera: 'Nurse',
      cuidador: 'Caregiver',
      amigo: 'Friend',
      otro: 'Other',
    },
    
    // Frecuencias
    frequencies: {
      once: 'Once daily',
      twice: 'Twice daily',
      three: 'Three times daily',
      four: 'Four times daily',
      every4h: 'Every 4 hours',
      every6h: 'Every 6 hours',
      every8h: 'Every 8 hours',
      every12h: 'Every 12 hours',
      weekly: 'Weekly',
      asNeeded: 'As needed',
    },
  },
};
