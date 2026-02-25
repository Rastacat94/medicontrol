'use client';

// Premium Store - Plan Escudo Familiar
// Modelo sostenible: Desarrollador NO paga nada
import { useState } from 'react';
import { useMonetizationStore } from '@/store/monetization-store';
import { SMS_PACKS, PREMIUM_PRICING, FREE_TIER } from '@/types/monetization';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Crown,
  Shield,
  Bell,
  Cloud,
  FileText,
  Users,
  MessageSquare,
  Check,
  Star,
  CreditCard,
  Gift,
  Zap,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface PremiumStoreProps {
  open: boolean;
  onClose: () => void;
}

export function PremiumStore({ open, onClose }: PremiumStoreProps) {
  const { 
    subscription, 
    smsCredits, 
    subscribe, 
    purchaseSMSPack, 
    isPremium,
    getRemainingDays,
    getSmsDiscount
  } = useMonetizationStore();
  
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly' | 'lifetime' | null>(null);
  const [selectedSMSPack, setSelectedSMSPack] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const premium = isPremium();
  const remainingDays = getRemainingDays();
  const smsDiscount = getSmsDiscount();

  const handleSubscribe = (plan: 'monthly' | 'yearly' | 'lifetime') => {
    setSelectedPlan(plan);
  };

  const handleConfirmPayment = () => {
    if (selectedPlan) {
      // En producción: aquí iría Stripe/PayPal
      subscribe(selectedPlan);
      setShowPaymentSuccess(true);
      setSelectedPlan(null);
      setTimeout(() => setShowPaymentSuccess(false), 3000);
    }
  };

  const handlePurchaseSMS = (packId: string) => {
    setSelectedSMSPack(packId);
    purchaseSMSPack(packId);
    setTimeout(() => setSelectedSMSPack(null), 2000);
  };

  // Features premium ACTUALIZADOS (sin "SMS ilimitados")
  const premiumFeatures = [
    { icon: <MessageSquare className="h-5 w-5" />, text: '20 SMS/mes incluidos', highlight: true },
    { icon: <Zap className="h-5 w-5" />, text: '20% descuento en packs SMS extra' },
    { icon: <Shield className="h-5 w-5" />, text: 'Sin publicidad' },
    { icon: <Cloud className="h-5 w-5" />, text: 'Backup automático en la nube' },
    { icon: <FileText className="h-5 w-5" />, text: 'Reportes médicos detallados' },
    { icon: <Users className="h-5 w-5" />, text: 'Hasta 5 cuidadores' },
    { icon: <Bell className="h-5 w-5" />, text: 'Botón de pánico activo' },
    { icon: <Sparkles className="h-5 w-5" />, text: 'Soporte prioritario' },
  ];

  // Features GRATIS (notificaciones push)
  const freeFeatures = [
    { icon: <Bell className="h-5 w-5 text-green-600" />, text: 'Notificaciones push ILIMITADAS (gratis)' },
    { icon: <Shield className="h-5 w-5 text-green-600" />, text: 'Alertas de interacciones' },
    { icon: <FileText className="h-5 w-5 text-green-600" />, text: 'Reportes básicos' },
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Crown className="h-6 w-6 text-yellow-500" />
            Plan Escudo Familiar
          </DialogTitle>
          <DialogDescription className="text-base">
            Tranquilidad total para ti y tu familia
          </DialogDescription>
        </DialogHeader>

        {showPaymentSuccess && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
            <Check className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-800">¡Compra exitosa!</p>
              <p className="text-sm text-green-600">Tu plan está activo</p>
            </div>
          </div>
        )}

        <div className="space-y-6 py-4">
          {/* Free Push Notification Banner */}
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Bell className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold text-green-800">
                    🎉 Notificaciones Push 100% GRATIS
                  </p>
                  <p className="text-sm text-green-700">
                    Recibe todos los recordatorios sin costo. Los SMS son opcionales para emergencias.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Status */}
          {premium ? (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Crown className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-green-800">
                      Ya eres Premium
                    </p>
                    <p className="text-sm text-green-600">
                      {subscription.plan === 'lifetime' 
                        ? `Plan Vitalicio • ${smsCredits} SMS disponibles` 
                        : `${remainingDays} días restantes • ${smsCredits} SMS`}
                    </p>
                  </div>
                  <Badge className="bg-green-600">Activo</Badge>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Current SMS Credits */}
              <div className="flex items-center justify-between px-2">
                <span className="text-sm text-gray-600">Tus SMS disponibles:</span>
                <Badge variant="outline" className="text-lg">
                  {smsCredits} SMS
                </Badge>
              </div>

              {/* Trial Banner */}
              {!subscription.trialUsed && (
                <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Gift className="h-6 w-6 text-purple-600" />
                        <div>
                          <p className="font-medium">¡Prueba Premium gratis!</p>
                          <p className="text-sm text-gray-600">7 días + 5 SMS de cortesía</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border-purple-300 text-purple-700"
                        onClick={() => {
                          useMonetizationStore.getState().extendTrial();
                        }}
                      >
                        Activar prueba
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Premium Plans */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  Planes Premium
                </h3>
                
                <div className="grid gap-3">
                  {/* Monthly */}
                  <Card 
                    className={`cursor-pointer transition-all hover:border-blue-300 ${
                      selectedPlan === 'monthly' ? 'border-blue-500 ring-2 ring-blue-200' : ''
                    }`}
                    onClick={() => handleSubscribe('monthly')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">Plan Mensual</p>
                          <p className="text-sm text-gray-500">
                            Incluye {PREMIUM_PRICING.monthly.smsIncluded} SMS/mes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${PREMIUM_PRICING.monthly.price}</p>
                          <p className="text-xs text-gray-500">/mes</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Yearly - Popular */}
                  <Card 
                    className={`cursor-pointer transition-all hover:border-blue-300 border-2 ${
                      selectedPlan === 'yearly' ? 'border-blue-500 ring-2 ring-blue-200' : 'border-blue-200 bg-blue-50'
                    }`}
                    onClick={() => handleSubscribe('yearly')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold">Plan Anual</p>
                            <Badge className="bg-blue-600">Más popular</Badge>
                          </div>
                          <p className="text-sm text-blue-600 font-medium">
                            {PREMIUM_PRICING.yearly.savings} • {PREMIUM_PRICING.yearly.smsIncluded} SMS/mes
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${PREMIUM_PRICING.yearly.price}</p>
                          <p className="text-xs text-gray-500">/año</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Lifetime */}
                  <Card 
                    className={`cursor-pointer transition-all hover:border-yellow-300 ${
                      selectedPlan === 'lifetime' ? 'border-yellow-500 ring-2 ring-yellow-200' : 'bg-gradient-to-r from-yellow-50 to-amber-50'
                    }`}
                    onClick={() => handleSubscribe('lifetime')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Star className="h-5 w-5 text-yellow-500" />
                            <p className="font-semibold">Plan Vitalicio</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            Un pago • {PREMIUM_PRICING.lifetime.smsIncluded} SMS iniciales incluidos
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold">${PREMIUM_PRICING.lifetime.price}</p>
                          <p className="text-xs text-gray-500">único pago</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Subscribe Button */}
              {selectedPlan && (
                <Button 
                  className="w-full h-12 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  onClick={handleConfirmPayment}
                >
                  <CreditCard className="h-5 w-5 mr-2" />
                  Suscribirse ahora
                </Button>
              )}

              {/* SMS Packs */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">Packs de SMS Extra</h3>
                  {premium && (
                    <Badge className="bg-green-100 text-green-700">
                      {smsDiscount * 100}% descuento
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Para alertas críticas a cuidadores cuando no respondes
                </p>
                
                <div className="grid grid-cols-2 gap-3">
                  {SMS_PACKS.map((pack) => {
                    const finalPrice = premium 
                      ? (pack.price * (1 - smsDiscount)).toFixed(2) 
                      : pack.price;
                    
                    return (
                      <Card 
                        key={pack.id}
                        className={`cursor-pointer transition-all hover:border-blue-300 ${
                          pack.popular ? 'border-blue-200 bg-blue-50' : ''
                        } ${selectedSMSPack === pack.id ? 'ring-2 ring-green-300' : ''}`}
                        onClick={() => handlePurchaseSMS(pack.id)}
                      >
                        <CardContent className="p-4 text-center">
                          {pack.popular && (
                            <Badge className="mb-2 bg-blue-600">Popular</Badge>
                          )}
                          <p className="font-semibold">{pack.name}</p>
                          <p className="text-3xl font-bold my-2">{pack.smsCount}</p>
                          <p className="text-sm text-gray-500">SMS</p>
                          <div className="mt-2">
                            {premium && (
                              <p className="text-xs text-gray-400 line-through">${pack.price}</p>
                            )}
                            <p className="text-xl font-bold">${finalPrice}</p>
                          </div>
                          {pack.savings && (
                            <p className="text-xs text-green-600 mt-1">{pack.savings}</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* Features List */}
          <div className="space-y-3 pt-4 border-t">
            <h3 className="font-semibold text-lg">¿Qué incluye Premium?</h3>
            <div className="grid gap-2">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className={`flex items-center gap-3 p-2 rounded-lg ${feature.highlight ? 'bg-blue-50' : ''}`}>
                  <div className="text-blue-600">{feature.icon}</div>
                  <span className={`text-sm ${feature.highlight ? 'font-semibold text-blue-800' : ''}`}>
                    {feature.text}
                  </span>
                  <Check className="h-4 w-4 text-green-500 ml-auto" />
                </div>
              ))}
            </div>
          </div>

          {/* Free Features Reminder */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-sm font-semibold text-gray-700">Siempre gratis para todos:</p>
            {freeFeatures.map((feature, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                {feature.icon}
                <span>{feature.text}</span>
              </div>
            ))}
          </div>

          {/* Terms */}
          <div className="text-xs text-gray-400 text-center pt-4 border-t">
            <p>Los pagos se procesan de forma segura.</p>
            <p>Puedes cancelar en cualquier momento desde Configuración.</p>
            <p className="mt-2 text-gray-500">
              💡 Tip: Las notificaciones push son gratuitas e ilimitadas. 
              Los SMS son opcionales para emergencias.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
