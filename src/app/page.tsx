'use client';

import { useMedicationStore } from '@/store/medication-store';
import { useMonetizationStore } from '@/store/monetization-store';
import { useAuthStore } from '@/store/auth-store';
import { Header } from '@/components/medication/Header';
import { Dashboard } from '@/components/medication/Dashboard';
import { MedicationList } from '@/components/medication/MedicationList';
import { HistoryView } from '@/components/medication/HistoryView';
import { ReportsView } from '@/components/medication/ReportsView';
import { SettingsView } from '@/components/medication/SettingsView';
import { ShareView } from '@/components/medication/ShareView';
import { InventoryView } from '@/components/medication/InventoryView';
import { AlertsView } from '@/components/medication/AlertsView';
import { MedicationScanner } from '@/components/medication/MedicationScanner';
import { MedicationForm } from '@/components/medication/MedicationForm';
import { PremiumStore } from '@/components/monetization/PremiumStore';
import { PharmacyOrder } from '@/components/monetization/PharmacyOrder';
import { AdBanner } from '@/components/monetization/AdBanner';
import { AuthPage } from '@/components/auth/auth-page';
import { OnboardingWizard } from '@/components/onboarding';
import { useEffect, useState } from 'react';
import { Plus, Camera, Crown, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Medication } from '@/types/medication';

const ONBOARDED_KEY = 'medicontrol-onboarded';

export default function Home() {
  const { currentView, medications, getLowStockMedications, checkMissedDoses } = useMedicationStore();
  const { isPremium, shouldShowAds } = useMonetizationStore();
  const { isAuthenticated, checkSession, isLoading } = useAuthStore();
  
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedData, setScannedData] = useState<Partial<Medication> | undefined>();
  const [onboardingScannedData, setOnboardingScannedData] = useState<Partial<Medication> | undefined>();
  const [showPremiumStore, setShowPremiumStore] = useState(false);
  const [showPharmacyOrder, setShowPharmacyOrder] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | undefined>();

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const premium = isPremium();
  const showAds = shouldShowAds();
  const lowStockMeds = getLowStockMedications();
  const missedDoses = checkMissedDoses();

  // Check if user needs onboarding
  useEffect(() => {
    const hasOnboarded = localStorage.getItem(ONBOARDED_KEY);
    if (!hasOnboarded && isAuthenticated) {
      // Small delay to prevent hydration issues
      requestAnimationFrame(() => {
        setShowOnboarding(true);
      });
    }
  }, [isAuthenticated]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(ONBOARDED_KEY, 'true');
    setShowOnboarding(false);
    setOnboardingScannedData(undefined);
  };

  const handleScannedMedication = (data: Partial<Medication>) => {
    setScannedData(data);
    setShowAddModal(true);
  };

  const handleReorderMedication = (med: Medication) => {
    setSelectedMedication(med);
    setShowPharmacyOrder(true);
  };

  // Handle scan request from onboarding
  const handleOnboardingScanRequest = () => {
    setShowScanner(true);
  };

  // When scanner returns data during onboarding
  const handleScannerDataForOnboarding = (data: Partial<Medication>) => {
    setOnboardingScannedData(data);
    setShowScanner(false);
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'medications':
        return <MedicationList />;
      case 'inventory':
        return <InventoryView onShowPharmacyFinder={() => setShowPharmacyOrder(true)} />;
      case 'alerts':
        return <AlertsView />;
      case 'history':
        return <HistoryView />;
      case 'reports':
        return <ReportsView />;
      case 'share':
        return <ShareView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <Dashboard />;
    }
  };

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    return <AuthPage />;
  }

  // Show onboarding wizard for new users
  if (showOnboarding) {
    return (
      <>
        <OnboardingWizard
          onComplete={handleOnboardingComplete}
          onScanRequest={handleOnboardingScanRequest}
          scannedMedication={onboardingScannedData}
        />
        {/* Scanner modal for onboarding */}
        <MedicationScanner
          open={showScanner}
          onClose={() => setShowScanner(false)}
          onMedicationScanned={handleScannerDataForOnboarding}
        />
      </>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 ${showAds && !premium ? 'pb-28' : ''}`}>
      <Header />
      
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Premium/Upsell Banner */}
        {!premium && (
          <Card className="mb-6 border-purple-200 bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-full">
                    <Crown className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-purple-800">
                      Plan Escudo Familiar
                    </p>
                    <p className="text-sm text-purple-600">
                      SMS ilimitados • Sin publicidad • Backup en la nube
                    </p>
                  </div>
                </div>
                <Button 
                  onClick={() => setShowPremiumStore(true)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Ver planes
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Low Stock Alert with Reorder */}
        {lowStockMeds.length > 0 && (
          <Card className="mb-4 border-amber-200 bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-amber-800">
                    {lowStockMeds.length} medicamento{lowStockMeds.length > 1 ? 's' : ''} con stock bajo
                  </p>
                  <p className="text-sm text-amber-600">
                    {lowStockMeds.map(m => m.name).join(', ')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedMedication(lowStockMeds[0]);
                      setShowPharmacyOrder(true);
                    }}
                  >
                    <Store className="h-4 w-4 mr-1" />
                    Pedir ahora
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {renderView()}
      </main>

      {/* Floating action buttons for mobile */}
      {currentView === 'dashboard' && (
        <div className="fixed bottom-6 right-6 flex flex-col gap-3 md:hidden">
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700"
            onClick={() => setShowScanner(true)}
          >
            <Camera className="h-6 w-6" />
          </Button>
          <Button
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setScannedData(undefined);
              setShowAddModal(true);
            }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Modals */}
      <MedicationScanner
        open={showScanner}
        onClose={() => setShowScanner(false)}
        onMedicationScanned={handleScannedMedication}
      />

      <MedicationForm
        open={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setScannedData(undefined);
        }}
        scannedData={scannedData}
      />

      <PremiumStore
        open={showPremiumStore}
        onClose={() => setShowPremiumStore(false)}
      />

      <PharmacyOrder
        open={showPharmacyOrder}
        onClose={() => setShowPharmacyOrder(false)}
        medication={selectedMedication}
      />

      {/* Ad Banner (only for free users) */}
      {showAds && !premium && <AdBanner type="banner" />}
    </div>
  );
}
