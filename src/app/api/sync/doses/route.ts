import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import type { DoseRecord } from '@/types/medication';

// GET - Fetch dose records for a user
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const medicationId = searchParams.get('medicationId');

    let query = supabase
      .from('dose_records')
      .select('*')
      .eq('user_id', user.id);

    if (startDate) {
      query = query.gte('date', startDate);
    }
    if (endDate) {
      query = query.lte('date', endDate);
    }
    if (medicationId) {
      query = query.eq('medication_id', medicationId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching dose records:', error);
      return NextResponse.json(
        { error: 'Failed to fetch dose records' },
        { status: 500 }
      );
    }

    // Transform database rows to DoseRecord type
    const doseRecords: DoseRecord[] = (data || []).map(row => ({
      id: row.id,
      medicationId: row.medication_id,
      scheduledTime: row.scheduled_time,
      actualTime: row.actual_time || undefined,
      date: row.date,
      status: row.status as DoseRecord['status'],
      notes: row.notes || undefined,
      createdAt: row.created_at,
    }));

    return NextResponse.json({ doseRecords });
  } catch (error) {
    console.error('Unexpected error in GET /api/sync/doses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new dose record
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const doseRecord: Omit<DoseRecord, 'id' | 'createdAt'> = body.doseRecord;

    const { data, error } = await supabase
      .from('dose_records')
      .insert({
        user_id: user.id,
        medication_id: doseRecord.medicationId,
        scheduled_time: doseRecord.scheduledTime,
        actual_time: doseRecord.actualTime || null,
        date: doseRecord.date,
        status: doseRecord.status,
        notes: doseRecord.notes || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dose record:', error);
      return NextResponse.json(
        { error: 'Failed to create dose record' },
        { status: 500 }
      );
    }

    // Transform back to DoseRecord type
    const newDoseRecord: DoseRecord = {
      id: data.id,
      medicationId: data.medication_id,
      scheduledTime: data.scheduled_time,
      actualTime: data.actual_time || undefined,
      date: data.date,
      status: data.status as DoseRecord['status'],
      notes: data.notes || undefined,
      createdAt: data.created_at,
    };

    return NextResponse.json({ doseRecord: newDoseRecord });
  } catch (error) {
    console.error('Unexpected error in POST /api/sync/doses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a dose record
export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, updates }: { id: string; updates: Partial<DoseRecord> } = body;

    // Transform updates to database format
    const dbUpdates: Record<string, unknown> = {};
    if (updates.scheduledTime !== undefined) dbUpdates.scheduled_time = updates.scheduledTime;
    if (updates.actualTime !== undefined) dbUpdates.actual_time = updates.actualTime;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    const { data, error } = await supabase
      .from('dose_records')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dose record:', error);
      return NextResponse.json(
        { error: 'Failed to update dose record' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Dose record not found' },
        { status: 404 }
      );
    }

    // Transform back to DoseRecord type
    const updatedDoseRecord: DoseRecord = {
      id: data.id,
      medicationId: data.medication_id,
      scheduledTime: data.scheduled_time,
      actualTime: data.actual_time || undefined,
      date: data.date,
      status: data.status as DoseRecord['status'],
      notes: data.notes || undefined,
      createdAt: data.created_at,
    };

    return NextResponse.json({ doseRecord: updatedDoseRecord });
  } catch (error) {
    console.error('Unexpected error in PUT /api/sync/doses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a dose record
export async function DELETE(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Dose record ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('dose_records')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting dose record:', error);
      return NextResponse.json(
        { error: 'Failed to delete dose record' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/sync/doses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Batch sync dose records (for offline sync)
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { doseRecords }: { doseRecords: DoseRecord[] } = body;

    if (!Array.isArray(doseRecords) || doseRecords.length === 0) {
      return NextResponse.json(
        { error: 'No dose records provided' },
        { status: 400 }
      );
    }

    // Prepare records for insertion/update
    const recordsToUpsert = doseRecords.map(record => ({
      id: record.id,
      user_id: user.id,
      medication_id: record.medicationId,
      scheduled_time: record.scheduledTime,
      actual_time: record.actualTime || null,
      date: record.date,
      status: record.status,
      notes: record.notes || null,
    }));

    const { data, error } = await supabase
      .from('dose_records')
      .upsert(recordsToUpsert, { onConflict: 'id' })
      .select();

    if (error) {
      console.error('Error batch syncing dose records:', error);
      return NextResponse.json(
        { error: 'Failed to sync dose records' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      count: data?.length || 0 
    });
  } catch (error) {
    console.error('Unexpected error in PATCH /api/sync/doses:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
