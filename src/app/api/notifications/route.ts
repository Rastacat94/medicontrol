import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/notifications
// Obtiene las notificaciones del usuario autenticado
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    // Devolver notificaciones demo si no hay Supabase
    return NextResponse.json({
      success: true,
      notifications: getDemoNotifications(),
      unreadCount: 1,
    });
  }

  try {
    const supabase = await createServerSupabaseClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unreadOnly') === 'true';

    // Construir query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('is_read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('[API] Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    // Contar no leídas
    const { count: unreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
    });

  } catch (error) {
    console.error('[API] Error in notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notifications
// Marca notificaciones como leídas
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true });
  }

  try {
    const supabase = await createServerSupabaseClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Marcar todas como leídas
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) {
        console.error('[API] Error marking all as read:', error);
        return NextResponse.json(
          { error: 'Failed to mark notifications as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'All notifications marked as read' 
      });
    }

    if (notificationId) {
      // Marcar una específica como leída
      const { error } = await supabase
        .from('notifications')
        .update({ 
          is_read: true, 
          read_at: new Date().toISOString() 
        })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('[API] Error marking notification as read:', error);
        return NextResponse.json(
          { error: 'Failed to mark notification as read' },
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Notification marked as read' 
      });
    }

    return NextResponse.json(
      { error: 'Missing notificationId or markAllAsRead' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[API] Error in notifications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Notificaciones de demostración
function getDemoNotifications() {
  return [
    {
      id: 'demo-1',
      type: 'caregiver_view',
      title: '👨‍👩‍👧 María revisó tus registros',
      message: 'María, tu hija, acaba de revisar tus medicamentos y registros del día. ¡Estás acompañado/a! 💙',
      is_read: false,
      priority: 1,
      created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // Hace 5 minutos
      data: {
        caregiver_name: 'María',
        caregiver_relationship: 'hija',
        sections_viewed: ['medications', 'doses'],
      },
    },
    {
      id: 'demo-2',
      type: 'caregiver_view',
      title: '👨‍👩‍👧 Carlos revisó tus registros',
      message: 'Carlos, tu hijo, acaba de revisar tus medicamentos y registros del día. ¡Estás acompañado/a! 💙',
      is_read: true,
      priority: 1,
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ayer
      data: {
        caregiver_name: 'Carlos',
        caregiver_relationship: 'hijo',
        sections_viewed: ['medications'],
      },
    },
  ];
}
