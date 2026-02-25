'use client';

import { useMedicationStore } from '@/store/medication-store';
import { useAuthStore } from '@/store/auth-store';
import { useNotificationStore } from '@/store/notification-store';
import { 
  LayoutDashboard, 
  Pill, 
  History, 
  FileText, 
  Settings, 
  Share2, 
  AlertCircle,
  Menu,
  X,
  Package,
  Bell,
  Camera,
  User,
  LogOut,
  Crown,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ViewMode } from '@/types/medication';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

interface NavItem {
  id: ViewMode;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Inicio', icon: <LayoutDashboard className="h-5 w-5" /> },
  { id: 'medications', label: 'Medicamentos', icon: <Pill className="h-5 w-5" /> },
  { id: 'inventory', label: 'Inventario', icon: <Package className="h-5 w-5" /> },
  { id: 'alerts', label: 'Alertas', icon: <Bell className="h-5 w-5" /> },
  { id: 'history', label: 'Historial', icon: <History className="h-5 w-5" /> },
  { id: 'reports', label: 'Reportes', icon: <FileText className="h-5 w-5" /> },
  { id: 'share', label: 'Compartir', icon: <Share2 className="h-5 w-5" /> },
  { id: 'settings', label: 'Configuración', icon: <Settings className="h-5 w-5" /> },
];

export function Header() {
  const { currentView, setCurrentView, medications, getDaySummary, getLowStockMedications, checkMissedDoses } = useMedicationStore();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { unreadCount, fetchNotifications } = useNotificationStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  
  // Cargar notificaciones
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);
  
  const today = new Date().toISOString().split('T')[0];
  const todaySummary = getDaySummary(today);
  const activeMeds = medications.filter((m) => m.status === 'active').length;
  const pendingDoses = todaySummary.pending;
  const lowStockCount = getLowStockMedications().length;
  const missedDosesCount = checkMissedDoses().length;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">MediControl</h1>
              <p className="text-xs text-gray-500">Control de medicamentos</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={currentView === item.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  'flex items-center gap-2',
                  currentView === item.id 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                {item.icon}
                <span className="hidden lg:inline">{item.label}</span>
              </Button>
            ))}
          </nav>

          {/* Status indicators */}
          <div className="hidden md:flex items-center gap-3">
            {/* Notification Center */}
            <NotificationCenter />
            
            {/* User Profile */}
            {isAuthenticated && user && (
              <div className="relative">
                <button
                  onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.isPremium ? '👑 Premium' : `${user.smsCredits} SMS`}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border py-2 z-50">
                    <div className="px-4 py-2 border-b">
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                      {user.isPremium && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          <Crown className="h-3 w-3" /> Premium
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setCurrentView('settings');
                        setProfileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Configuración
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setProfileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            )}
            
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-gray-700">{activeMeds}</span>
              <span className="text-gray-500">meds</span>
            </div>
            {missedDosesCount > 0 && (
              <button
                onClick={() => setCurrentView('alerts')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
              >
                <Bell className="h-4 w-4" />
                <span className="text-sm font-medium">{missedDosesCount} alerta{missedDosesCount !== 1 ? 's' : ''}</span>
              </button>
            )}
            {lowStockCount > 0 && (
              <button
                onClick={() => setCurrentView('inventory')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors"
              >
                <Package className="h-4 w-4" />
                <span className="text-sm font-medium">{lowStockCount} stock bajo</span>
              </button>
            )}
            {pendingDoses > 0 && missedDosesCount === 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 text-blue-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">{pendingDoses} pendiente{pendingDoses !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <NotificationCenter />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentView === item.id ? 'default' : 'ghost'}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={cn(
                    'justify-start gap-3',
                    currentView === item.id 
                      ? 'bg-blue-600 text-white hover:bg-blue-700' 
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  {item.icon}
                  {item.label}
                </Button>
              ))}
            </nav>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <span className="font-medium">{activeMeds}</span> medicamentos activos
              </div>
              {pendingDoses > 0 && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">{pendingDoses} pendiente{pendingDoses !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
            
            {/* Mobile User Info & Logout */}
            {isAuthenticated && user && (
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={logout}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
