'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { LoginForm } from './login-form';
import { RegisterForm } from './register-form';
import { Loader2, Pill, Shield, Bell, Users } from 'lucide-react';

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const { isAuthenticated, checkSession, isLoading } = useAuthStore();

  useEffect(() => {
    // Verificar si hay una sesión guardada
    checkSession();
  }, [checkSession]);

  // Mientras verifica la sesión
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
            <Pill className="w-10 h-10 text-white animate-pulse" />
          </div>
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Si ya está autenticado, no mostrar nada (el padre debería redirigir)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-700 p-12 flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Pill className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">MediControl</span>
            </div>
          </div>

          <div className="space-y-8">
            <h1 className="text-4xl font-bold text-white leading-tight">
              Tu salud en buenas manos.<br />
              <span className="text-blue-200">Nunca olvides un medicamento.</span>
            </h1>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Recordatorios Inteligentes</h3>
                  <p className="text-blue-200 text-sm">Alertas personalizadas para cada medicamento</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Alertas de Interacciones</h3>
                  <p className="text-blue-200 text-sm">Detectamos combinaciones peligrosas</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Cuidadores Conectados</h3>
                  <p className="text-blue-200 text-sm">Tu familia puede recibir alertas de dosis omitidas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-blue-200 text-sm">
            <span>🔒 Datos encriptados</span>
            <span>•</span>
            <span>📱 Funciona offline</span>
            <span>•</span>
            <span>✓ Cumple GDPR</span>
          </div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Pill className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">MediControl</h1>
              <p className="text-gray-500 mt-1">Tu gestor de medicamentos</p>
            </div>

            {/* Auth Form */}
            {mode === 'login' ? (
              <LoginForm onSwitchToRegister={() => setMode('register')} />
            ) : (
              <RegisterForm onSwitchToLogin={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
