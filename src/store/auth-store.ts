import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase';
import { User, Caregiver } from '@/types/auth';
import type { SupabaseClient } from '@supabase/supabase-js';

interface AuthStore {
  // Estado
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Acciones de autenticación
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  
  // Gestión de cuidadores
  addCaregiver: (caregiver: Omit<Caregiver, 'id' | 'createdAt'>) => void;
  updateCaregiver: (id: string, updates: Partial<Caregiver>) => void;
  removeCaregiver: (id: string) => void;
  
  // Monetización
  addSmsCredits: (credits: number) => void;
  activatePremium: (expiresAt: Date) => void;
  
  // Utilidades
  clearError: () => void;
  checkSession: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
}

// Helper para convertir perfil de DB a User
const dbUserToUser = (dbUser: Record<string, unknown>, caregivers: Caregiver[] = []): User => {
  return {
    id: dbUser.id as string,
    email: dbUser.email as string,
    name: dbUser.name as string,
    phone: dbUser.phone as string | undefined,
    avatar: dbUser.avatar as string | undefined,
    createdAt: new Date(dbUser.created_at as string),
    isPremium: dbUser.is_premium as boolean,
    premiumExpiresAt: dbUser.premium_expires_at ? new Date(dbUser.premium_expires_at as string) : undefined,
    smsCredits: dbUser.sms_credits as number,
    caregivers,
  };
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
        
        try {
          const supabase = createClient();
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }
          
          if (data.user) {
            // Fetch user profile from our users table
            const { data: profile, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
            
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching profile:', profileError);
            }
            
            // Fetch caregivers
            const { data: caregivers } = await supabase
              .from('caregivers')
              .select('*')
              .eq('user_id', data.user.id);
            
            const user: User = profile 
              ? dbUserToUser(profile, (caregivers || []).map(c => ({
                  id: c.id as string,
                  name: c.name as string,
                  email: c.email as string,
                  phone: c.phone as string,
                  relationship: c.relationship as string,
                  receiveAlerts: c.receive_alerts as boolean,
                  createdAt: new Date(c.created_at as string),
                })))
              : {
                  id: data.user.id,
                  email: data.user.email!,
                  name: data.user.user_metadata?.name || 'Usuario',
                  createdAt: new Date(),
                  isPremium: false,
                  smsCredits: 3,
                  caregivers: [],
                };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            
            return { success: true };
          }
          
          set({ isLoading: false, error: 'Error desconocido' });
          return { success: false, error: 'Error desconocido' };
          
        } catch (error) {
          console.error('Login error:', error);
          set({ isLoading: false, error: 'Error de conexión' });
          return { success: false, error: 'Error de conexión' };
        }
      },

      register: async (name: string, email: string, password: string, phone?: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const supabase = createClient();
          
          // Crear usuario en Supabase Auth
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
                phone,
              },
            },
          });
          
          if (error) {
            set({ isLoading: false, error: error.message });
            return { success: false, error: error.message };
          }
          
          if (data.user) {
            // Crear perfil en la tabla users
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                email,
                name,
                phone,
                is_premium: false,
                sms_credits: 3, // Créditos de bienvenida
              });
            
            if (insertError) {
              console.error('Error creating user profile:', insertError);
              // No detenemos el flujo, el trigger puede haber creado el perfil
            }
            
            const user: User = {
              id: data.user.id,
              email,
              name,
              phone,
              createdAt: new Date(),
              isPremium: false,
              smsCredits: 3,
              caregivers: [],
            };
            
            set({ 
              user, 
              isAuthenticated: true, 
              isLoading: false,
              error: null 
            });
            
            return { success: true };
          }
          
          set({ isLoading: false, error: 'Error desconocido' });
          return { success: false, error: 'Error desconocido' };
          
        } catch (error) {
          console.error('Register error:', error);
          set({ isLoading: false, error: 'Error de conexión' });
          return { success: false, error: 'Error de conexión' };
        }
      },

      logout: async () => {
        try {
          const supabase = createClient();
          await supabase.auth.signOut();
        } catch (error) {
          console.error('Logout error:', error);
        }
        
        set({ 
          user: null, 
          isAuthenticated: false,
          error: null 
        });
      },

      updateProfile: async (updates: Partial<User>) => {
        const { user } = get();
        if (!user) return;
        
        try {
          const supabase = createClient();
          
          const dbUpdates: Record<string, unknown> = {};
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
          if (updates.avatar !== undefined) dbUpdates.avatar = updates.avatar;
          if (updates.isPremium !== undefined) dbUpdates.is_premium = updates.isPremium;
          if (updates.premiumExpiresAt !== undefined) dbUpdates.premium_expires_at = updates.premiumExpiresAt;
          if (updates.smsCredits !== undefined) dbUpdates.sms_credits = updates.smsCredits;
          
          await supabase
            .from('users')
            .update(dbUpdates)
            .eq('id', user.id);
          
          const updatedUser = { ...user, ...updates };
          set({ user: updatedUser });
          
        } catch (error) {
          console.error('Error updating profile:', error);
        }
      },

      addCaregiver: async (caregiverData) => {
        const { user, updateProfile } = get();
        if (!user) return;
        
        try {
          const supabase = createClient();
          
          const { data, error } = await supabase
            .from('caregivers')
            .insert({
              user_id: user.id,
              name: caregiverData.name,
              email: caregiverData.email,
              phone: caregiverData.phone,
              relationship: caregiverData.relationship,
              receive_alerts: caregiverData.receiveAlerts,
            })
            .select()
            .single();
          
          if (error) {
            console.error('Error adding caregiver:', error);
            return;
          }
          
          const newCaregiver: Caregiver = {
            id: data.id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            relationship: data.relationship,
            receiveAlerts: data.receive_alerts,
            createdAt: new Date(data.created_at),
          };
          
          const updatedCaregivers = [...(user.caregivers || []), newCaregiver];
          updateProfile({ caregivers: updatedCaregivers });
          
        } catch (error) {
          console.error('Error adding caregiver:', error);
        }
      },

      updateCaregiver: async (id: string, updates: Partial<Caregiver>) => {
        const { user, updateProfile } = get();
        if (!user) return;
        
        try {
          const supabase = createClient();
          
          const dbUpdates: Record<string, unknown> = {};
          if (updates.name !== undefined) dbUpdates.name = updates.name;
          if (updates.email !== undefined) dbUpdates.email = updates.email;
          if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
          if (updates.relationship !== undefined) dbUpdates.relationship = updates.relationship;
          if (updates.receiveAlerts !== undefined) dbUpdates.receive_alerts = updates.receiveAlerts;
          
          await supabase
            .from('caregivers')
            .update(dbUpdates)
            .eq('id', id);
          
          const updatedCaregivers = (user.caregivers || []).map(c => 
            c.id === id ? { ...c, ...updates } : c
          );
          updateProfile({ caregivers: updatedCaregivers });
          
        } catch (error) {
          console.error('Error updating caregiver:', error);
        }
      },

      removeCaregiver: async (id: string) => {
        const { user, updateProfile } = get();
        if (!user) return;
        
        try {
          const supabase = createClient();
          
          await supabase
            .from('caregivers')
            .delete()
            .eq('id', id);
          
          const updatedCaregivers = (user.caregivers || []).filter(c => c.id !== id);
          updateProfile({ caregivers: updatedCaregivers });
          
        } catch (error) {
          console.error('Error removing caregiver:', error);
        }
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
          smsCredits: 999
        });
      },

      clearError: () => set({ error: null }),

      checkSession: async () => {
        try {
          const supabase = createClient();
          
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session?.user) {
            // Fetch user profile
            const { data: profile } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            // Fetch caregivers
            const { data: caregivers } = await supabase
              .from('caregivers')
              .select('*')
              .eq('user_id', session.user.id);
            
            const user: User = profile 
              ? dbUserToUser(profile, (caregivers || []).map(c => ({
                  id: c.id as string,
                  name: c.name as string,
                  email: c.email as string,
                  phone: c.phone as string,
                  relationship: c.relationship as string,
                  receiveAlerts: c.receive_alerts as boolean,
                  createdAt: new Date(c.created_at as string),
                })))
              : {
                  id: session.user.id,
                  email: session.user.email!,
                  name: session.user.user_metadata?.name || 'Usuario',
                  createdAt: new Date(),
                  isPremium: false,
                  smsCredits: 3,
                  caregivers: [],
                };
            
            set({ user, isAuthenticated: true });
          }
        } catch (error) {
          console.error('Error checking session:', error);
        }
      },

      fetchUserProfile: async () => {
        const { user } = get();
        if (!user) return;
        
        try {
          const supabase = createClient();
          
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();
          
          const { data: caregivers } = await supabase
            .from('caregivers')
            .select('*')
            .eq('user_id', user.id);
          
          if (profile) {
            const updatedUser = dbUserToUser(profile, (caregivers || []).map(c => ({
              id: c.id as string,
              name: c.name as string,
              email: c.email as string,
              phone: c.phone as string,
              relationship: c.relationship as string,
              receiveAlerts: c.receive_alerts as boolean,
              createdAt: new Date(c.created_at as string),
            })));
            
            set({ user: updatedUser });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
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
