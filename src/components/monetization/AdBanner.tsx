'use client';

import { useEffect, useState } from 'react';
import { useMonetizationStore } from '@/store/monetization-store';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ExternalLink, 
  X, 
  Pill, 
  Heart, 
  Activity,
  Shield
} from 'lucide-react';

interface AdBannerProps {
  type?: 'banner' | 'native';
  className?: string;
}

// Simulated health ads (in production, these would come from AdMob)
const HEALTH_ADS = [
  {
    id: 'ad-1',
    title: '💊 Farmacia Salud - 30% OFF',
    description: 'Medicamentos para la diabetes, hipertensión y más. Envío gratis hoy',
    cta: 'Ver ofertas',
    sponsor: 'Farmacia Salud',
    icon: <Pill className="h-5 w-5" />,
    color: 'blue',
  },
  {
    id: 'ad-2',
    title: '🩺 Glucómetros en oferta',
    description: 'Control de glucosa en casa con envío gratis. -40% hoy',
    cta: 'Comprar ahora',
    sponsor: 'MediTech',
    icon: <Activity className="h-5 w-5" />,
    color: 'green',
  },
  {
    id: 'ad-3',
    title: '❤️ Omega 3 y CoQ10',
    description: 'Salud cardiovascular. Segunda unidad al 50% off',
    cta: 'Ver productos',
    sponsor: 'Farmacity',
    icon: <Heart className="h-5 w-5" />,
    color: 'red',
  },
  {
    id: 'ad-4',
    title: '🏥 Delivery de medicamentos',
    description: 'Recibe tus medicamentos en casa en 2 horas. Primera entrega gratis',
    cta: 'Pedir ahora',
    sponsor: 'Dr. Ahorro',
    icon: <Shield className="h-5 w-5" />,
    color: 'purple',
  },
  {
    id: 'ad-5',
    title: '💊 Vitaminas y suplementos',
    description: 'Vitamina D3, B12, Calcio. 3x2 en todos los suplementos',
    cta: 'Aprovechar',
    sponsor: 'VitaFarm',
    icon: <Pill className="h-5 w-5" />,
    color: 'blue',
  },
  {
    id: 'ad-6',
    title: '🚨 Tensiómetro digital',
    description: 'Monitorea tu presión arterial en casa. Precisión clínica -25%',
    cta: 'Ver detalle',
    sponsor: 'CardioHealth',
    icon: <Activity className="h-5 w-5" />,
    color: 'green',
  },
];

export function AdBanner({ type = 'banner', className = '' }: AdBannerProps) {
  const { shouldShowAds, isPremium } = useMonetizationStore();
  const [currentAd, setCurrentAd] = useState(HEALTH_ADS[0]);
  const [dismissed, setDismissed] = useState(false);
  const [clicked, setClicked] = useState(false);

  // Rotate ads
  useEffect(() => {
    if (!shouldShowAds()) return;
    
    const interval = setInterval(() => {
      const randomAd = HEALTH_ADS[Math.floor(Math.random() * HEALTH_ADS.length)];
      setCurrentAd(randomAd);
    }, 30000); // Rotate every 30 seconds

    return () => clearInterval(interval);
  }, [shouldShowAds]);

  // Don't show ads for premium users
  if (!shouldShowAds() || isPremium() || dismissed) {
    return null;
  }

  const colorClasses: Record<string, string> = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
    purple: 'border-purple-200 bg-purple-50',
  };

  const iconColorClasses: Record<string, string> = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    red: 'text-red-600 bg-red-100',
    purple: 'text-purple-600 bg-purple-100',
  };

  if (type === 'native') {
    return (
      <Card className={`${colorClasses[currentAd.color]} ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${iconColorClasses[currentAd.color]}`}>
              {currentAd.icon}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-medium text-sm">{currentAd.title}</p>
                <Badge variant="outline" className="text-xs">Patrocinado</Badge>
              </div>
              <p className="text-xs text-gray-600 mb-2">{currentAd.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{currentAd.sponsor}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setClicked(true)}
                  className="h-7 text-xs"
                >
                  {currentAd.cta}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setDismissed(true)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Banner type (bottom banner)
  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 ${className}`}>
      <Card className={`${colorClasses[currentAd.color]} rounded-none border-x-0 border-b-0`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${iconColorClasses[currentAd.color]}`}>
              {currentAd.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{currentAd.title}</p>
              <p className="text-xs text-gray-500 truncate">{currentAd.sponsor}</p>
            </div>
            <Button 
              size="sm"
              onClick={() => setClicked(true)}
              className="shrink-0"
            >
              {currentAd.cta}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setDismissed(true)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center mt-1">
            <Button 
              variant="link" 
              className="text-xs text-gray-400 h-auto p-0"
              onClick={() => {
                // Would open premium store
                alert('¡Actualiza a Premium para eliminar la publicidad!');
              }}
            >
              Sin publicidad con Premium
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Ad placeholder component for development
export function AdPlaceholder({ message = 'Espacio publicitario' }: { message?: string }) {
  const { shouldShowAds } = useMonetizationStore();

  if (!shouldShowAds()) return null;

  return (
    <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center text-gray-400 text-sm bg-gray-50">
      {message}
    </div>
  );
}
