'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Eye, EyeOff, Mail, Lock, User, Phone, Loader2, UserPlus, Check } from 'lucide-react';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

export function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const { register, isLoading, error, clearError } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (name.length < 2) {
      errors.name = 'El nombre debe tener al menos 2 caracteres';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Ingresa un email válido';
    }
    
    if (password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    if (!acceptTerms) {
      errors.terms = 'Debes aceptar los términos y condiciones';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    if (!validateForm()) return;
    
    const result = await register(name, email, password, phone || undefined);
    if (result.success) {
      // El estado se actualiza automáticamente en el store
    }
  };

  const passwordStrength = () => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getStrengthColor = () => {
    const strength = passwordStrength();
    if (strength <= 1) return 'bg-red-500';
    if (strength <= 2) return 'bg-orange-500';
    if (strength <= 3) return 'bg-yellow-500';
    if (strength <= 4) return 'bg-green-400';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    const strength = passwordStrength();
    if (strength <= 1) return 'Muy débil';
    if (strength <= 2) return 'Débil';
    if (strength <= 3) return 'Media';
    if (strength <= 4) return 'Fuerte';
    return 'Muy fuerte';
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Crear Cuenta</h2>
          <p className="text-gray-500 mt-2">Únete a MediControl gratis</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (validationErrors.name) {
                    setValidationErrors({ ...validationErrors, name: '' });
                  }
                }}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  validationErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Tu nombre"
                required
              />
            </div>
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationErrors.email) {
                    setValidationErrors({ ...validationErrors, email: '' });
                  }
                }}
                className={`w-full pl-12 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  validationErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="tu@email.com"
                required
              />
            </div>
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
            )}
          </div>

          {/* Phone (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono <span className="text-gray-400">(opcional)</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                placeholder="+34 612 345 678"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (validationErrors.password) {
                    setValidationErrors({ ...validationErrors, password: '' });
                  }
                }}
                className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  validationErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Mínimo 6 caracteres"
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
            
            {/* Password Strength Indicator */}
            {password && (
              <div className="mt-2">
                <div className="flex gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full transition-all ${
                        i <= passwordStrength() ? getStrengthColor() : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Seguridad: <span className="font-medium">{getStrengthLabel()}</span>
                </p>
              </div>
            )}
            
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (validationErrors.confirmPassword) {
                    setValidationErrors({ ...validationErrors, confirmPassword: '' });
                  }
                }}
                className={`w-full pl-12 pr-12 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all ${
                  validationErrors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-gray-200'
                }`}
                placeholder="Repite la contraseña"
                required
              />
              {confirmPassword && password === confirmPassword && (
                <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-green-500" />
              )}
            </div>
            {validationErrors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.confirmPassword}</p>
            )}
          </div>

          {/* Terms */}
          <div>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (validationErrors.terms) {
                    setValidationErrors({ ...validationErrors, terms: '' });
                  }
                }}
                className="w-4 h-4 mt-0.5 text-green-600 rounded border-gray-300 focus:ring-green-500"
              />
              <span className="text-sm text-gray-600">
                Acepto los{' '}
                <button type="button" className="text-green-600 hover:underline">
                  Términos de Servicio
                </button>{' '}
                y la{' '}
                <button type="button" className="text-green-600 hover:underline">
                  Política de Privacidad
                </button>
              </span>
            </label>
            {validationErrors.terms && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.terms}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 focus:ring-4 focus:ring-green-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creando cuenta...
              </>
            ) : (
              'Crear Cuenta Gratis'
            )}
          </button>
        </form>

        {/* Benefits */}
        <div className="mt-6 p-4 bg-green-50 rounded-xl">
          <p className="text-sm text-green-700 font-medium mb-2">Al registrarte obtienes:</p>
          <ul className="text-sm text-green-600 space-y-1">
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              3 SMS de alerta gratis
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Gestión ilimitada de medicamentos
            </li>
            <li className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              Recordatorios y alertas de interacciones
            </li>
          </ul>
        </div>

        {/* Switch to Login */}
        <p className="mt-6 text-center text-gray-600">
          ¿Ya tienes cuenta?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-green-600 hover:text-green-700 font-semibold"
          >
            Inicia sesión
          </button>
        </p>
      </div>
    </div>
  );
}
