import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Tipo de notificación
export interface Notification {
  id: string;
  type: 'caregiver_view' | 'caregiver_alert' | 'medication_reminder' | 'missed_dose' | 'low_stock' | 'system';
  title: string;
  message: string;
  is_read: boolean;
  priority: number;
  created_at: string;
  data?: {
    caregiver_name?: string;
    caregiver_relationship?: string;
    caregiver_user_id?: string;
    viewed_at?: string;
    sections_viewed?: string[];
    [key: string]: unknown;
  };
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  lastChecked: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Notification) => void;
  clearNotifications: () => void;
}

// Sin datos demo - cada usuario empieza limpio
const EMPTY_NOTIFICATIONS: Notification[] = [];

export const useNotificationStore = create<NotificationStore>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      lastChecked: null,

      fetchNotifications: async () => {
        set({ isLoading: true });
        try {
          const response = await fetch('/api/notifications');
          const data = await response.json();
          
          if (data.success) {
            set({ 
              notifications: data.notifications,
              unreadCount: data.unreadCount,
              lastChecked: new Date().toISOString(),
            });
          } else {
            // Si falla, usar array vacío
            set({ 
              notifications: EMPTY_NOTIFICATIONS,
              unreadCount: 0,
              lastChecked: new Date().toISOString(),
            });
          }
        } catch (error) {
          console.error('Error fetching notifications:', error);
          // En caso de error, usar array vacío
          set({ 
            notifications: EMPTY_NOTIFICATIONS,
            unreadCount: 0,
          });
        } finally {
          set({ isLoading: false });
        }
      },

      markAsRead: async (id: string) => {
        // Optimistic update
        set(state => {
          const notifications = state.notifications.map(n =>
            n.id === id ? { ...n, is_read: true } : n
          );
          return { 
            notifications,
            unreadCount: notifications.filter(n => !n.is_read).length 
          };
        });

        // Sync with server
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationId: id }),
          });
        } catch (error) {
          console.error('Error marking notification as read:', error);
        }
      },

      markAllAsRead: async () => {
        // Optimistic update
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, is_read: true })),
          unreadCount: 0,
        }));

        // Sync with server
        try {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ markAllAsRead: true }),
          });
        } catch (error) {
          console.error('Error marking all as read:', error);
        }
      },

      addNotification: (notification) => {
        set(state => ({
          notifications: [notification, ...state.notifications].slice(0, 50),
          unreadCount: state.unreadCount + (notification.is_read ? 0 : 1),
        }));
      },

      clearNotifications: () => set({ 
        notifications: [], 
        unreadCount: 0,
        lastChecked: null,
      }),
    }),
    {
      name: 'medicontrol-notifications-v2',
      partialize: (state) => ({
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        lastChecked: state.lastChecked,
      }),
    }
  )
);

// Hook para polling de notificaciones (para tiempo real)
export const useNotificationPolling = (intervalMs: number = 60000) => {
  const { fetchNotifications } = useNotificationStore();
  
  // Iniciar polling cuando el hook se usa
  if (typeof window !== 'undefined') {
    // Fetch inicial
    fetchNotifications();
    
    // Configurar intervalo
    const interval = setInterval(fetchNotifications, intervalMs);
    
    // Cleanup function (se puede usar en useEffect)
    return () => clearInterval(interval);
  }
  
  return null;
};

// Utilidades
export const getTimeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'ahora mismo';
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short' 
  });
};

export const getNotificationIcon = (type: Notification['type']): string => {
  const icons: Record<string, string> = {
    'caregiver_view': '👨‍👩‍👧',
    'caregiver_alert': '🔔',
    'medication_reminder': '💊',
    'missed_dose': '⚠️',
    'low_stock': '📦',
    'system': '⚙️',
  };
  return icons[type] || '📌';
};
