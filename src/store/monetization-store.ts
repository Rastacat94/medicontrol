import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Subscription, 
  SubscriptionPlan, 
  SubscriptionStatus,
  Pharmacy,
  PharmacyOrder,
  RefillRequest,
  AdConfig,
  SMS_PACKS,
  SMSPack,
  PREMIUM_PRICING,
  FREE_TIER
} from '@/types/monetization';
import { v4 as uuidv4 } from 'uuid';

interface MonetizationStore {
  // Subscription state
  subscription: Subscription;
  
  // SMS credits (usuario debe comprar antes de usar)
  smsCredits: number;
  
  // Ad configuration
  adConfig: AdConfig;
  
  // Pharmacy state
  pharmacies: Pharmacy[];
  orders: PharmacyOrder[];
  
  // Push notifications (GRATIS - método principal)
  pushEnabled: boolean;
  pushToken: string | null;
  
  // Actions
  subscribe: (plan: SubscriptionPlan) => void;
  cancelSubscription: () => void;
  extendTrial: () => void;
  
  // SMS credits - COMPRAR ANTES DE USAR
  purchaseSMSPack: (packId: string) => { success: boolean; credits: number };
  consumeSMSCredit: () => boolean;
  hasSMSCredits: () => boolean;
  getSMSCredits: () => number;
  
  // Push notifications (GRATIS)
  enablePush: (token: string) => void;
  disablePush: () => void;
  
  // Ads
  toggleAds: (enabled: boolean) => void;
  shouldShowAds: () => boolean;
  
  // Pharmacy
  loadPharmacies: () => void;
  createOrder: (request: RefillRequest, pharmacyId: string) => PharmacyOrder;
  getOrders: () => PharmacyOrder[];
  
  // Premium features
  isPremium: () => boolean;
  getRemainingDays: () => number;
  getSmsDiscount: () => number;
}

const FREE_SUBSCRIPTION: Subscription = {
  plan: 'free',
  status: 'active',
  startDate: new Date().toISOString(),
  autoRenew: false,
  smsCredits: FREE_TIER.smsWelcome, // 3 SMS gratis de bienvenida
  trialUsed: false,
};

// Farmacias simuladas (en producción, APIs reales)
const SAMPLE_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharm-1',
    name: 'Farmacia Directa',
    logo: '/pharmacies/direct.png',
    deliveryEnabled: true,
    minOrder: 10,
    deliveryFee: 2.99,
    estimatedTime: '1-2 horas',
    rating: 4.5,
    apiProvider: 'direct',
    affiliateCommission: 5
  },
  {
    id: 'pharm-2',
    name: 'FarmaNow',
    logo: '/pharmacies/farmanow.png',
    deliveryEnabled: true,
    minOrder: 15,
    deliveryFee: 1.99,
    estimatedTime: '30-60 min',
    rating: 4.7,
    apiProvider: 'direct',
    affiliateCommission: 8
  },
  {
    id: 'pharm-3',
    name: 'TuFarmacia Online',
    logo: '/pharmacies/tufarmacia.png',
    deliveryEnabled: true,
    minOrder: 20,
    deliveryFee: 0, // Envío gratis
    estimatedTime: '2-4 horas',
    rating: 4.4,
    apiProvider: 'direct',
    affiliateCommission: 6
  },
  {
    id: 'pharm-4',
    name: ' PharmaExpress',
    logo: '/pharmacies/express.png',
    deliveryEnabled: true,
    minOrder: 12,
    deliveryFee: 3.49,
    estimatedTime: '45-90 min',
    rating: 4.6,
    apiProvider: 'other',
    affiliateCommission: 7
  },
];

export const useMonetizationStore = create<MonetizationStore>()(
  persist(
    (set, get) => ({
      // Initial state
      subscription: FREE_SUBSCRIPTION,
      smsCredits: FREE_TIER.smsWelcome, // 3 SMS gratis iniciales
      adConfig: {
        enabled: true,
        provider: 'adsense',
        showBanner: true,
        showNative: false,
        healthOnly: true,
      },
      pharmacies: SAMPLE_PHARMACIES,
      orders: [],
      pushEnabled: true,
      pushToken: null,
      
      // Subscription actions
      subscribe: (plan) => {
        const now = new Date();
        let endDate: Date;
        const pricing = PREMIUM_PRICING[plan === 'monthly' ? 'monthly' : plan === 'yearly' ? 'yearly' : 'lifetime'];
        
        switch (plan) {
          case 'monthly':
            endDate = new Date(now.setMonth(now.getMonth() + 1));
            break;
          case 'yearly':
            endDate = new Date(now.setFullYear(now.getFullYear() + 1));
            break;
          case 'lifetime':
            endDate = new Date('2099-12-31');
            break;
          default:
            endDate = new Date(now.setMonth(now.getMonth() + 1));
        }
        
        set({
          subscription: {
            plan,
            status: 'active',
            startDate: new Date().toISOString(),
            endDate: endDate.toISOString(),
            autoRenew: plan !== 'lifetime',
            smsCredits: pricing.smsIncluded, // SMS incluidos según plan
            trialUsed: get().subscription.trialUsed,
          },
          smsCredits: get().smsCredits + pricing.smsIncluded, // Agregar los incluidos
          adConfig: { ...get().adConfig, enabled: false }, // Sin ads para premium
        });
      },
      
      cancelSubscription: () => {
        set({
          subscription: {
            ...get().subscription,
            status: 'cancelled',
            autoRenew: false,
          }
        });
      },
      
      extendTrial: () => {
        const now = new Date();
        const trialEnd = new Date(now.setDate(now.getDate() + 7));
        
        set({
          subscription: {
            ...get().subscription,
            status: 'trial',
            endDate: trialEnd.toISOString(),
            trialUsed: true,
          },
          smsCredits: get().smsCredits + 5, // 5 SMS extra de prueba
        });
      },
      
      // SMS actions - COMPRAR ANTES DE USAR
      purchaseSMSPack: (packId) => {
        const pack = SMS_PACKS.find(p => p.id === packId);
        if (!pack) return { success: false, credits: 0 };
        
        // Aplicar descuento si es premium
        const currentCredits = get().smsCredits;
        const isPremiumUser = get().isPremium();
        const discount = isPremiumUser ? 0.2 : 0; // 20% descuento para premium
        
        // En producción: aquí iría la llamada a Stripe/PayPal
        // Por ahora simulamos la compra exitosa
        
        set({
          smsCredits: currentCredits + pack.smsCount,
        });
        
        return { success: true, credits: pack.smsCount };
      },
      
      consumeSMSCredit: () => {
        const credits = get().smsCredits;
        if (credits <= 0) return false;
        
        set({ smsCredits: credits - 1 });
        return true;
      },
      
      hasSMSCredits: () => {
        return get().smsCredits > 0;
      },
      
      getSMSCredits: () => {
        return get().smsCredits;
      },
      
      // Push notifications (GRATIS - método principal)
      enablePush: (token) => {
        set({ 
          pushEnabled: true, 
          pushToken: token 
        });
      },
      
      disablePush: () => {
        set({ 
          pushEnabled: false, 
          pushToken: null 
        });
      },
      
      // Ads actions
      toggleAds: (enabled) => {
        set({
          adConfig: { ...get().adConfig, enabled }
        });
      },
      
      shouldShowAds: () => {
        const state = get();
        // No ads for premium users
        if (state.isPremium()) return false;
        return state.adConfig.enabled;
      },
      
      // Pharmacy actions
      loadPharmacies: () => {
        set({ pharmacies: SAMPLE_PHARMACIES });
      },
      
      createOrder: (request, pharmacyId) => {
        const pharmacy = get().pharmacies.find(p => p.id === pharmacyId);
        if (!pharmacy) throw new Error('Farmacia no encontrada');
        
        // Precios simulados (en producción, API de farmacia)
        const basePrice = 15.00; // USD simulado
        const total = basePrice + pharmacy.deliveryFee;
        const commission = total * (pharmacy.affiliateCommission / 100);
        
        const order: PharmacyOrder = {
          id: uuidv4(),
          pharmacyId,
          medicationId: request.medicationId,
          medicationName: request.medicationName,
          quantity: request.requestedQuantity,
          price: basePrice,
          deliveryFee: pharmacy.deliveryFee,
          total,
          status: 'pending',
          createdAt: new Date().toISOString(),
          estimatedDelivery: pharmacy.estimatedTime,
          _commission: commission,
        };
        
        set({ orders: [...get().orders, order] });
        return order;
      },
      
      getOrders: () => get().orders,
      
      // Premium helpers
      isPremium: () => {
        const sub = get().subscription;
        if (sub.plan === 'free') return false;
        if (sub.status !== 'active' && sub.status !== 'trial') return false;
        if (sub.endDate && new Date(sub.endDate) < new Date()) return false;
        return true;
      },
      
      getRemainingDays: () => {
        const sub = get().subscription;
        if (!sub.endDate) return 0;
        
        const end = new Date(sub.endDate);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
      },
      
      getSmsDiscount: () => {
        return get().isPremium() ? 0.2 : 0; // 20% descuento para premium
      },
    }),
    {
      name: 'monetization-storage',
      version: 2, // Incrementado para nueva versión
    }
  )
);

// === RESUMEN DEL MODELO PARA EL DESARROLLADOR ===
// 
// 💰 TÚ NO PAGAS NADA:
// 
// 1. PUSH NOTIFICATIONS → 100% GRATIS (Firebase)
//    - Úsalas como método principal de alertas
//    - Ilimitadas, sin costo
// 
// 2. SMS → USUARIO PAGA ANTES
//    - 3 SMS gratis de bienvenida (costo ~$0.18)
//    - Luego debe comprar packs
//    - Packs con margen de ganancia
// 
// 3. PREMIUM → USUARIO PAGA ANTES
//    - Incluye 20-50 SMS según plan
//    - Precio cubre costos + margen
// 
// 4. ADS → GENERAS INGRESOS
//    - AdSense para web (gratuito)
//    - AdMob para apps (requiere cuenta)
// 
// 5. AFILIADOS FARMACIAS → COMISIÓN
//    - 5-8% por cada pedido
//    - Sin costo para ti
// 
// 📊 COSTOS ESTIMADOS:
// - Vercel: GRATIS
// - Supabase: GRATIS (hasta 500MB)
// - Firebase Push: GRATIS
// - SMS inicial: ~$0.18 por usuario nuevo
// 
// 📈 INGRESOS ESTIMADOS:
// - Premium: 100% ganancia después de SMS incluidos
// - SMS Packs: 40-60% margen
// - Ads: Variable según tráfico
// - Afiliados: 5-8% de cada venta
