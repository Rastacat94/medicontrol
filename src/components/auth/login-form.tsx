'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Eye, EyeOff, Mail, Lock, Loader2, LogIn } from 'lucide-react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    const result = await login(email, password);
    if (result.success) {
      // El estado se actualiza automáticamente en el store
    }
  };

  const handleDemoLogin = async (type: 'user' | 'premium') => {
    clearError();
    if (type === 'user') {
      await login('demo@medicontrol.com', 'demo123');
    } else {
      await login('premium@medicontrol.com', 'demo123');
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Iniciar Sesión</h2>
          <p className="text-gray-500 mt-2">Accede a tu cuenta de MediControl</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me & Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Recordarme</span>
            </label>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-4">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm text-gray-400">o prueba con</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Demo Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleDemoLogin('user')}
            disabled={isLoading}
            className="py-3 px-4 border-2 border-blue-200 text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50"
          >
            👤 Demo Usuario
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('premium')}
            disabled={isLoading}
            className="py-3 px-4 border-2 border-amber-200 text-amber-600 font-medium rounded-xl hover:bg-amber-50 transition-all disabled:opacity-50"
          >
            👑 Demo Premium
          </button>
        </div>

        {/* Switch to Register */}
        <p className="mt-8 text-center text-gray-600">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Regístrate gratis
          </button>
        </p>
      </div>

      {/* Demo Credentials Info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm text-blue-700 text-center">
          <strong>Credenciales demo:</strong><br />
          Usuario: demo@medicontrol.com | Premium: premium@medicontrol.com<br />
          <span className="text-blue-600">Contraseña: demo123</span>
        </p>
      </div>
    </div>
  );
}
