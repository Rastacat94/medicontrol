import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Caregiver, DEMO_USERS } from '@/types/auth';

interface AuthStore {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Acciones de autenticación
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  
  // Gestión de cuidadores
  addCaregiver: (caregiver: Omit<Caregiver, 'id' | 'createdAt'>) => void;
  updateCaregiver: (id: string, updates: Partial<Caregiver>) => void;
  removeCaregiver: (id: string) => void;
  
  // Monetización
  addSmsCredits: (credits: number) => void;
  activatePremium: (expiresAt: Date) => void;
  
  // Utilidades
  clearError: () => void;
  checkSession: () => void;
}

// Simulación de base de datos local
const USERS_KEY = 'medicontrol_users';
const SESSION_KEY = 'medicontrol_session';

const getStoredUsers = (): (User & { password: string })[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(USERS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  // Inicializar con usuarios demo
  const demoUsers = DEMO_USERS.map(u => ({ ...u, password: 'demo123' }));
  localStorage.setItem(USERS_KEY, JSON.stringify(demoUsers));
  return demoUsers;
};

const saveUsers = (users: (User & { password: string })[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const users = getStoredUsers();
        const foundUser = users.find(u => 
          u.email.toLowerCase() === email.toLowerCase() && 
          u.password === password
        );
        
        if (foundUser) {
          const { password: _, ...userWithoutPassword } = foundUser;
          const user: User = {
            ...userWithoutPassword,
            createdAt: new Date(userWithoutPassword.createdAt),
            premiumExpiresAt: userWithoutPassword.premiumExpiresAt 
              ? new Date(userWithoutPassword.premiumExpiresAt) 
              : undefined,
            caregivers: userWithoutPassword.caregivers?.map(c => ({
              ...c,
              createdAt: new Date(c.createdAt)
            })) || []
          };
          
          // Guardar sesión
          if (typeof window !== 'undefined') {
            localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, timestamp: Date.now() }));
          }
          
          set({ 
            user, 
            isAuthenticated: true, 
            isLoading: false,
            error: null 
          });
          
          return { success: true };
        }
        
        set({ 
          isLoading: false, 
          error: 'Email o contraseña incorrectos' 
        });
        return { success: false, error: 'Email o contraseña incorrectos' };
      },

      register: async (name: string, email: string, password: string, phone?: string) => {
        set({ isLoading: true, error: null });
        
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const users = getStoredUsers();
        
        // Verificar si el email ya existe
        if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
          set({ isLoading: false, error: 'Este email ya está registrado' });
          return { success: false, error: 'Este email ya está registrado' };
        }
        
        // Crear nuevo usuario
        const newUser: User & { password: string } = {
          id: `user-${Date.now()}`,
          email,
          name,
          phone,
          password,
          createdAt: new Date(),
          isPremium: false,
          smsCredits: 3, // Créditos de bienvenida
          caregivers: []
        };
        
        users.push(newUser);
        saveUsers(users);
        
        // Iniciar sesión automáticamente
        const { password: _, ...userWithoutPassword } = newUser;
        const user: User = {
          ...userWithoutPassword,
          createdAt: new Date(userWithoutPassword.createdAt),
          caregivers: []
        };
        
        // Guardar sesión
        if (typeof window !== 'undefined') {
          localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, timestamp: Date.now() }));
        }
        
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false,
          error: null 
        });
        
        return { success: true };
      },

      logout: () => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(SESSION_KEY);
        }
        set({ 
          user: null, 
          isAuthenticated: false,
          error: null 
        });
      },

      updateProfile: (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        
        const updatedUser = { ...user, ...updates };
        
        // Actualizar en la "base de datos"
        const users = getStoredUsers();
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...updates };
          saveUsers(users);
        }
        
        set({ user: updatedUser });
      },

      addCaregiver: (caregiverData) => {
        const { user, updateProfile } = get();
        if (!user) return;
        
        const newCaregiver: Caregiver = {
          ...caregiverData,
          id: `cg-${Date.now()}`,
          createdAt: new Date()
        };
        
        const updatedCaregivers = [...(user.caregivers || []), newCaregiver];
        updateProfile({ caregivers: updatedCaregivers });
      },

      updateCaregiver: (id: string, updates: Partial<Caregiver>) => {
        const { user, updateProfile } = get();
        if (!user) return;
        
        const updatedCaregivers = (user.caregivers || []).map(c => 
          c.id === id ? { ...c, ...updates } : c
        );
        updateProfile({ caregivers: updatedCaregivers });
      },

      removeCaregiver: (id: string) => {
        const { user, updateProfile } = get();
        if (!user) return;
        
        const updatedCaregivers = (user.caregivers || []).filter(c => c.id !== id);
        updateProfile({ caregivers: updatedCaregivers });
      },

      addSmsCredits: (credits: number) => {
        const { user, updateProfile } = get();
        if (!user) return;
        updateProfile({ smsCredits: (user.smsCredits || 0) + credits });
      },

      activatePremium: (expiresAt: Date) => {
        const { updateProfile } = get();
        updateProfile({ 
          isPremium: true, 
          premiumExpiresAt: expiresAt,
          smsCredits: 999 // SMS ilimitados para premium
        });
      },

      clearError: () => set({ error: null }),

      checkSession: () => {
        if (typeof window === 'undefined') return;
        
        const sessionStr = localStorage.getItem(SESSION_KEY);
        if (!sessionStr) return;
        
        try {
          const session = JSON.parse(sessionStr);
          const users = getStoredUsers();
          const foundUser = users.find(u => u.id === session.userId);
          
          if (foundUser) {
            const { password: _, ...userWithoutPassword } = foundUser;
            const user: User = {
              ...userWithoutPassword,
              createdAt: new Date(userWithoutPassword.createdAt),
              premiumExpiresAt: userWithoutPassword.premiumExpiresAt 
                ? new Date(userWithoutPassword.premiumExpiresAt) 
                : undefined,
              caregivers: userWithoutPassword.caregivers?.map(c => ({
                ...c,
                createdAt: new Date(c.createdAt)
              })) || []
            };
            
            set({ user, isAuthenticated: true });
          }
        } catch (e) {
          console.error('Error checking session:', e);
        }
      }
    }),
    {
      name: 'medicontrol-auth',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
