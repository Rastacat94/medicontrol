'use client';

import { useEffect, useState } from 'react';
import { Bell, X, CheckCheck, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { 
  useNotificationStore, 
  getTimeAgo, 
  getNotificationIcon,
  type Notification 
} from '@/store/notification-store';

// Componente principal del centro de notificaciones
export function NotificationCenter() {
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead, isLoading } = useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  // Cargar notificaciones al montar
  useEffect(() => {
    fetchNotifications();
    // Polling cada 30 segundos
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Marcar como leída al abrir una notificación
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  // Marcar todas como leídas
  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-12 w-12 rounded-full"
          aria-label="Notificaciones"
        >
          <Bell className="h-6 w-6" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-6 w-6 rounded-full p-0 flex items-center justify-center text-sm font-bold bg-red-500 text-white animate-pulse"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-xl">
              <Bell className="h-6 w-6 text-blue-600" />
              Notificaciones
            </SheetTitle>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllRead}
                className="text-blue-600 hover:text-blue-700"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Marcar todas leídas
              </Button>
            )}
          </div>
        </SheetHeader>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState />
        ) : (
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-3">
              {notifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </SheetContent>
    </Sheet>
  );
}

// Tarjeta de notificación individual
interface NotificationCardProps {
  notification: Notification;
  onClick: () => void;
}

function NotificationCard({ notification, onClick }: NotificationCardProps) {
  const isUnread = !notification.is_read;
  const icon = getNotificationIcon(notification.type);
  const timeAgo = getTimeAgo(notification.created_at);

  return (
    <Card
      className={`
        cursor-pointer transition-all duration-200 hover:shadow-md
        ${isUnread 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500' 
          : 'bg-white'
        }
      `}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex gap-3">
          {/* Icono */}
          <div className={`
            flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl
            ${isUnread ? 'bg-blue-100' : 'bg-gray-100'}
          `}>
            {icon}
          </div>

          {/* Contenido */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h3 className={`
                text-base font-semibold leading-tight
                ${isUnread ? 'text-gray-900' : 'text-gray-700'}
              `}>
                {notification.title}
              </h3>
              {isUnread && (
                <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 mt-1" />
              )}
            </div>
            
            <p className="text-gray-600 text-sm mt-1 leading-relaxed">
              {notification.message}
            </p>

            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <ClockIcon className="h-3 w-3" />
                {timeAgo}
              </span>
              
              {isUnread && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                  Nueva
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Estado vacío
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Bell className="h-10 w-10 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        No hay notificaciones
      </h3>
      <p className="text-gray-500 text-sm">
        Cuando tus cuidadores revisen tus registros, te avisaremos aquí.
      </p>
    </div>
  );
}

// Icono de reloj simple
function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

// Componente de notificación destacada para el dashboard
export function NotificationHighlight() {
  const { notifications, fetchNotifications } = useNotificationStore();
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Obtener la notificación más reciente no leída y no descartada
  const latestNotification = notifications
    .filter(n => !n.is_read && !dismissed.includes(n.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  if (!latestNotification) {
    return null;
  }

  const icon = getNotificationIcon(latestNotification.type);
  const timeAgo = getTimeAgo(latestNotification.created_at);

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg animate-in slide-in-from-top duration-500">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            {icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg">
              {latestNotification.title}
            </h3>
            <p className="text-white/90 text-sm mt-1">
              {latestNotification.message}
            </p>
            <p className="text-white/70 text-xs mt-2">
              {timeAgo}
            </p>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
            onClick={() => setDismissed([...dismissed, latestNotification.id])}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Widget compacto para mostrar en el dashboard
export function NotificationWidget() {
  const { notifications, unreadCount, fetchNotifications } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Filtrar solo notificaciones de cuidador
  const caregiverNotifications = notifications
    .filter(n => n.type === 'caregiver_view')
    .slice(0, 3);

  if (caregiverNotifications.length === 0) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-green-200">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <Heart className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-green-800">Te acompañan</h3>
            <p className="text-sm text-green-600">
              {unreadCount > 0 
                ? `${unreadCount} notificación${unreadCount > 1 ? 'es' : ''} nueva${unreadCount > 1 ? 's' : ''}`
                : 'Sin notificaciones nuevas'
              }
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {caregiverNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`
                flex items-center gap-2 p-2 rounded-lg
                ${!notification.is_read ? 'bg-white/70' : 'bg-white/30'}
              `}
            >
              <span className="text-lg">
                {getNotificationIcon(notification.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {notification.data?.caregiver_name || 'Tu cuidador'}
                </p>
                <p className="text-xs text-gray-500">
                  {getTimeAgo(notification.created_at)}
                </p>
              </div>
              {!notification.is_read && (
                <div className="w-2 h-2 rounded-full bg-green-500" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default NotificationCenter;
