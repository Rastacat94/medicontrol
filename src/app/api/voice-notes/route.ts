import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/voice-notes
// Obtiene las notas de voz del usuario
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({
      success: true,
      voiceNotes: [],
    });
  }

  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const medicationId = searchParams.get('medicationId');

    let query = supabase
      .from('voice_notes')
      .select(`
        id,
        medication_id,
        audio_url,
        audio_base64,
        duration_seconds,
        transcription,
        recorded_at,
        dose_time,
        dose_date,
        is_shared,
        medications(name)
      `)
      .eq('user_id', user.id)
      .order('recorded_at', { ascending: false });

    if (startDate && endDate) {
      query = query.gte('dose_date', startDate).lte('dose_date', endDate);
    }

    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[API] Error fetching voice notes:', error);
      return NextResponse.json({ error: 'Failed to fetch voice notes' }, { status: 500 });
    }

    // Transformar datos
    const voiceNotes = (data || []).map(note => ({
      id: note.id,
      medicationId: note.medication_id,
      medicationName: note.medications?.name || null,
      audioUrl: note.audio_url,
      audioBase64: note.audio_base64,
      durationSeconds: note.duration_seconds,
      transcription: note.transcription,
      recordedAt: note.recorded_at,
      doseTime: note.dose_time,
      doseDate: note.dose_date,
      isShared: note.is_shared,
    }));

    return NextResponse.json({ success: true, voiceNotes });

  } catch (error) {
    console.error('[API] Error in voice notes API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/voice-notes
// Crea una nueva nota de voz
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true, id: 'demo-' + Date.now() });
  }

  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      medicationId, 
      audioBase64, 
      durationSeconds, 
      transcription,
      doseTime,
      doseDate 
    } = body;

    const { data, error } = await supabase
      .from('voice_notes')
      .insert({
        user_id: user.id,
        medication_id: medicationId || null,
        audio_base64: audioBase64,
        duration_seconds: durationSeconds || 10,
        transcription: transcription || null,
        dose_time: doseTime || null,
        dose_date: doseDate || new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      console.error('[API] Error creating voice note:', error);
      return NextResponse.json({ error: 'Failed to create voice note' }, { status: 500 });
    }

    return NextResponse.json({ success: true, voiceNote: data });

  } catch (error) {
    console.error('[API] Error in voice notes API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/voice-notes
// Elimina una nota de voz
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ success: true });
  }

  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('voice_notes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('[API] Error deleting voice note:', error);
      return NextResponse.json({ error: 'Failed to delete voice note' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[API] Error in voice notes API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
