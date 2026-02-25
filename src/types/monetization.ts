// Sistema de monetización para MediControl
// Modelo: 100% GRATIS para el desarrollador
// Los usuarios financian los servicios premium

// === COSTOS REALES (para referencia interna) ===
// Twilio SMS España: ~$0.06 USD/SMS
// Twilio SMS LatAm: ~$0.03 USD/SMS
// Firebase Push: $0 (GRATIS ilimitado)
// Stripe fee: 2.9% + $0.30

// === SMS PACKS ===
// Precios con margen para cubrir costos + ganancia
export interface SMSPack {
  id: string;
  name: string;
  smsCount: number;
  price: number;
  currency: string;
  popular?: boolean;
  savings?: string;
  // Costo real para el dev (interno)
  _costToDev?: number;
}

export const SMS_PACKS: SMSPack[] = [
  { 
    id: 'starter', 
    name: 'Pack Inicial', 
    smsCount: 10, 
    price: 1.99,  // Usuario paga $1.99
    currency: 'USD',
    _costToDev: 0.60  // Tú pagas $0.60 → Ganas $1.39
  },
  { 
    id: 'basic', 
    name: 'Pack Básico', 
    smsCount: 30, 
    price: 3.99,  // Usuario paga $3.99
    currency: 'USD', 
    popular: true,
    savings: 'Más popular',
    _costToDev: 1.80  // Tú pagas $1.80 → Ganas $2.19
  },
  { 
    id: 'family', 
    name: 'Pack Familiar', 
    smsCount: 100, 
    price: 9.99,  // Usuario paga $9.99
    currency: 'USD', 
    savings: 'Ahorra 50%',
    _costToDev: 6.00  // Tú pagas $6.00 → Ganas $3.99
  },
  { 
    id: 'caregiver', 
    name: 'Pack Cuidador', 
    smsCount: 250, 
    price: 19.99,  // Usuario paga $19.99
    currency: 'USD', 
    savings: 'Mejor valor',
    _costToDev: 15.00  // Tú pagas $15.00 → Ganas $4.99
  },
];

// === PREMIUM SUBSCRIPTION ===
export type SubscriptionPlan = 'free' | 'monthly' | 'yearly' | 'lifetime';
export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'trial';

export interface Subscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: string;
  endDate?: string;
  autoRenew: boolean;
  smsCredits: number; // Créditos disponibles
  trialUsed: boolean;
}

export interface PremiumFeatures {
  smsMonthlyIncluded: number;  // SMS incluidos por mes
  discountOnSms: number;        // % descuento en packs SMS
  noAds: boolean;
  cloudBackup: boolean;
  detailedReports: boolean;
  multipleCaregivers: boolean;
  prioritySupport: boolean;
  familySharing: boolean;
  panicButton: boolean;
}

// Precios Premium - con margen para SMS incluidos
export const PREMIUM_PRICING = {
  monthly: { 
    price: 4.99,  // Precio ajustado para cubrir SMS
    currency: 'USD', 
    period: 'mes',
    smsIncluded: 20  // 20 SMS/mes = ~$1.20 costo para ti
  },
  yearly: { 
    price: 39.99, 
    currency: 'USD', 
    period: 'año', 
    savings: 'Ahorra 33%',
    smsIncluded: 20  // 20 SMS/mes
  },
  lifetime: { 
    price: 99.99, 
    currency: 'USD', 
    period: 'único pago',
    smsIncluded: 50  // 50 SMS iniciales, luego compran packs
  },
};

export const PREMIUM_FEATURES: PremiumFeatures = {
  smsMonthlyIncluded: 20,      // 20 SMS/mes incluidos (no ilimitado)
  discountOnSms: 20,           // 20% descuento en packs SMS extra
  noAds: true,
  cloudBackup: true,
  detailedReports: true,
  multipleCaregivers: true,    // Hasta 5 cuidadores
  prioritySupport: true,
  familySharing: true,
  panicButton: true,
};

// === FREE TIER ===
export const FREE_TIER = {
  maxMedications: 10,
  maxCaregivers: 1,
  smsWelcome: 3,  // 3 SMS de bienvenida (costo ~$0.18)
  showAds: true,
  basicReports: true,
  pushNotifications: 'unlimited',  // GRATIS ilimitado
};

// === NOTA IMPORTANTE ===
// PUSH NOTIFICATIONS son 100% GRATIS vía Firebase Cloud Messaging
// Úsalas como método principal de alertas
// SMS solo para emergencias críticas o cuando el usuario lo paga

// === PHARMACY INTEGRATION ===
export interface Pharmacy {
  id: string;
  name: string;
  logo: string;
  deliveryEnabled: boolean;
  minOrder: number;
  deliveryFee: number;
  estimatedTime: string;
  rating: number;
  apiProvider: 'rappi' | 'direct' | 'other';
  // Comisión que recibes por cada pedido
  affiliateCommission: number;  // % del pedido
}

export const PHARMACIES: Pharmacy[] = [
  {
    id: 'pharma-direct',
    name: 'Farmacia Directa',
    logo: '/pharmacies/pharma-direct.png',
    deliveryEnabled: true,
    minOrder: 10,
    deliveryFee: 2.99,
    estimatedTime: '1-2 horas',
    rating: 4.5,
    apiProvider: 'direct',
    affiliateCommission: 5  // 5% de comisión
  },
  {
    id: 'farma-now',
    name: 'FarmaNow',
    logo: '/pharmacies/farma-now.png',
    deliveryEnabled: true,
    minOrder: 15,
    deliveryFee: 1.99,
    estimatedTime: '30-60 min',
    rating: 4.7,
    apiProvider: 'direct',
    affiliateCommission: 8  // 8% de comisión
  }
];

export interface PharmacyOrder {
  id: string;
  pharmacyId: string;
  medicationId: string;
  medicationName: string;
  quantity: number;
  price: number;
  deliveryFee: number;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery?: string;
  // Tu comisión
  _commission?: number;
}

export interface RefillRequest {
  medicationId: string;
  medicationName: string;
  currentStock: number;
  requestedQuantity: number;
  urgent: boolean;
}

// === AD PLACEMENT ===
export interface AdConfig {
  enabled: boolean;
  provider: 'admob' | 'adsense' | 'none';
  bannerUnitId?: string;
  nativeUnitId?: string;
  showBanner: boolean;
  showNative: boolean;
  healthOnly: boolean;
}

export const AD_CONFIG: AdConfig = {
  enabled: true,
  provider: 'adsense',  // Gratis, sin cuenta de developer
  showBanner: true,
  showNative: false,
  healthOnly: true
};

// === MÉTRICAS DE NEGOCIO ===
export const BUSINESS_METRICS = {
  // Para que el desarrollador tenga $0 de costo:
  // 1. Push notifications = GRATIS (úsalo como default)
  // 2. SMS = Usuario paga ANTES de usar
  // 3. Premium = Usuario paga ANTES de acceder
  // 4. Ads = Genera ingresos pasivos
  
  breakEvenUsers: 50,  // Usuarios para cubrir costos de servidor
  targetRevenue: 100,  // USD/mes objetivo inicial
};
