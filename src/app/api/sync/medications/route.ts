import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import type { Medication } from '@/types/medication';

// GET - Fetch all medications for a user
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

    const { data, error } = await supabase
      .from('medications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching medications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch medications' },
        { status: 500 }
      );
    }

    // Transform database rows to Medication type
    const medications: Medication[] = (data || []).map(row => ({
      id: row.id,
      name: row.name,
      genericName: row.generic_name || undefined,
      dose: row.dose,
      doseUnit: row.dose_unit as Medication['doseUnit'],
      frequencyType: row.frequency_type as Medication['frequencyType'],
      frequencyValue: row.frequency_value,
      schedules: row.schedules,
      instructions: row.instructions as Medication['instructions'],
      notes: row.notes || undefined,
      startDate: row.start_date,
      endDate: row.end_date || undefined,
      status: row.status as Medication['status'],
      prescribedBy: row.prescribed_by || undefined,
      color: row.color,
      stock: row.stock ?? undefined,
      stockUnit: row.stock_unit as Medication['stockUnit'] || undefined,
      lowStockThreshold: row.low_stock_threshold ?? undefined,
      lastStockUpdate: row.last_stock_update || undefined,
      isCritical: row.is_critical,
      criticalAlertDelay: row.critical_alert_delay,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));

    return NextResponse.json({ medications });
  } catch (error) {
    console.error('Unexpected error in GET /api/sync/medications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create a new medication
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
    const medication: Omit<Medication, 'id' | 'createdAt' | 'updatedAt'> = body.medication;

    const { data, error } = await supabase
      .from('medications')
      .insert({
        user_id: user.id,
        name: medication.name,
        generic_name: medication.genericName || null,
        dose: medication.dose,
        dose_unit: medication.doseUnit,
        frequency_type: medication.frequencyType,
        frequency_value: medication.frequencyValue,
        schedules: medication.schedules,
        instructions: medication.instructions || [],
        notes: medication.notes || null,
        start_date: medication.startDate,
        end_date: medication.endDate || null,
        status: medication.status || 'active',
        prescribed_by: medication.prescribedBy || null,
        color: medication.color,
        stock: medication.stock ?? 0,
        stock_unit: medication.stockUnit || medication.doseUnit,
        low_stock_threshold: medication.lowStockThreshold ?? 5,
        last_stock_update: null,
        is_critical: medication.isCritical ?? false,
        critical_alert_delay: medication.criticalAlertDelay ?? 60,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating medication:', error);
      return NextResponse.json(
        { error: 'Failed to create medication' },
        { status: 500 }
      );
    }

    // Transform back to Medication type
    const newMedication: Medication = {
      id: data.id,
      name: data.name,
      genericName: data.generic_name || undefined,
      dose: data.dose,
      doseUnit: data.dose_unit as Medication['doseUnit'],
      frequencyType: data.frequency_type as Medication['frequencyType'],
      frequencyValue: data.frequency_value,
      schedules: data.schedules,
      instructions: data.instructions as Medication['instructions'],
      notes: data.notes || undefined,
      startDate: data.start_date,
      endDate: data.end_date || undefined,
      status: data.status as Medication['status'],
      prescribedBy: data.prescribed_by || undefined,
      color: data.color,
      stock: data.stock ?? undefined,
      stockUnit: data.stock_unit as Medication['stockUnit'] || undefined,
      lowStockThreshold: data.low_stock_threshold ?? undefined,
      lastStockUpdate: data.last_stock_update || undefined,
      isCritical: data.is_critical,
      criticalAlertDelay: data.critical_alert_delay,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ medication: newMedication });
  } catch (error) {
    console.error('Unexpected error in POST /api/sync/medications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update a medication
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
    const { id, updates }: { id: string; updates: Partial<Medication> } = body;

    // Transform updates to database format
    const dbUpdates: Record<string, unknown> = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.genericName !== undefined) dbUpdates.generic_name = updates.genericName;
    if (updates.dose !== undefined) dbUpdates.dose = updates.dose;
    if (updates.doseUnit !== undefined) dbUpdates.dose_unit = updates.doseUnit;
    if (updates.frequencyType !== undefined) dbUpdates.frequency_type = updates.frequencyType;
    if (updates.frequencyValue !== undefined) dbUpdates.frequency_value = updates.frequencyValue;
    if (updates.schedules !== undefined) dbUpdates.schedules = updates.schedules;
    if (updates.instructions !== undefined) dbUpdates.instructions = updates.instructions;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.prescribedBy !== undefined) dbUpdates.prescribed_by = updates.prescribedBy;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
    if (updates.stockUnit !== undefined) dbUpdates.stock_unit = updates.stockUnit;
    if (updates.lowStockThreshold !== undefined) dbUpdates.low_stock_threshold = updates.lowStockThreshold;
    if (updates.lastStockUpdate !== undefined) dbUpdates.last_stock_update = updates.lastStockUpdate;
    if (updates.isCritical !== undefined) dbUpdates.is_critical = updates.isCritical;
    if (updates.criticalAlertDelay !== undefined) dbUpdates.critical_alert_delay = updates.criticalAlertDelay;
    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('medications')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating medication:', error);
      return NextResponse.json(
        { error: 'Failed to update medication' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Medication not found' },
        { status: 404 }
      );
    }

    // Transform back to Medication type
    const updatedMedication: Medication = {
      id: data.id,
      name: data.name,
      genericName: data.generic_name || undefined,
      dose: data.dose,
      doseUnit: data.dose_unit as Medication['doseUnit'],
      frequencyType: data.frequency_type as Medication['frequencyType'],
      frequencyValue: data.frequency_value,
      schedules: data.schedules,
      instructions: data.instructions as Medication['instructions'],
      notes: data.notes || undefined,
      startDate: data.start_date,
      endDate: data.end_date || undefined,
      status: data.status as Medication['status'],
      prescribedBy: data.prescribed_by || undefined,
      color: data.color,
      stock: data.stock ?? undefined,
      stockUnit: data.stock_unit as Medication['stockUnit'] || undefined,
      lowStockThreshold: data.low_stock_threshold ?? undefined,
      lastStockUpdate: data.last_stock_update || undefined,
      isCritical: data.is_critical,
      criticalAlertDelay: data.critical_alert_delay,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };

    return NextResponse.json({ medication: updatedMedication });
  } catch (error) {
    console.error('Unexpected error in PUT /api/sync/medications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a medication
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
        { error: 'Medication ID is required' },
        { status: 400 }
      );
    }

    // First delete related dose records
    await supabase
      .from('dose_records')
      .delete()
      .eq('medication_id', id)
      .eq('user_id', user.id);

    // Then delete the medication
    const { error } = await supabase
      .from('medications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting medication:', error);
      return NextResponse.json(
        { error: 'Failed to delete medication' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/sync/medications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
