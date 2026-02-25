// Tipos para el sistema de autenticación

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  isPremium: boolean;
  premiumExpiresAt?: Date;
  smsCredits: number;
  caregivers: Caregiver[];
}

export interface Caregiver {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string; // 'hijo', 'conyuge', 'medico', 'enfermera', 'otro'
  receiveAlerts: boolean;
  receiveMissedDose: boolean;
  receivePanicButton: boolean;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  error?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirmPassword: string;
}

// Datos de demo para testing
export const DEMO_USERS: User[] = [
  {
    id: 'demo-user-1',
    email: 'demo@medicontrol.com',
    name: 'María García',
    phone: '+34 612 345 678',
    createdAt: new Date('2024-01-15'),
    isPremium: false,
    smsCredits: 5,
    caregivers: [
      {
        id: 'cg-1',
        name: 'Carlos García',
        email: 'carlos@email.com',
        phone: '+34 611 111 111',
        relationship: 'hijo',
        receiveAlerts: true,
        receiveMissedDose: true,
        receivePanicButton: true,
        createdAt: new Date('2024-01-15')
      }
    ]
  },
  {
    id: 'demo-premium-1',
    email: 'premium@medicontrol.com',
    name: 'Juan Rodríguez',
    phone: '+34 699 999 999',
    createdAt: new Date('2023-06-01'),
    isPremium: true,
    premiumExpiresAt: new Date('2025-12-31'),
    smsCredits: 999,
    caregivers: [
      {
        id: 'cg-2',
        name: 'Ana Rodríguez',
        email: 'ana@email.com',
        phone: '+34 622 222 222',
        relationship: 'hija',
        receiveAlerts: true,
        receiveMissedDose: true,
        receivePanicButton: true,
        createdAt: new Date('2023-06-01')
      },
      {
        id: 'cg-3',
        name: 'Dr. Martínez',
        email: 'martinez@clinica.com',
        phone: '+34 633 333 333',
        relationship: 'medico',
        receiveAlerts: true,
        receiveMissedDose: true,
        receivePanicButton: false,
        createdAt: new Date('2023-08-15')
      }
    ]
  }
];
