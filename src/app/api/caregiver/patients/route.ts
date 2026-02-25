import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/caregiver/patients
// Obtiene la lista de pacientes que el usuario cuida
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase not configured', patients: [] },
      { status: 200 }
    );
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

    // Obtener pacientes usando la función de Supabase
    const { data: patients, error } = await supabase
      .rpc('get_my_patients');

    if (error) {
      console.error('[API] Error getting patients:', error);
      return NextResponse.json(
        { error: 'Failed to get patients', patients: [] },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      patients: patients || [],
    });

  } catch (error) {
    console.error('[API] Error in caregiver patients:', error);
    return NextResponse.json(
      { error: 'Internal server error', patients: [] },
      { status: 500 }
    );
  }
}
