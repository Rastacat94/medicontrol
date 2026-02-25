import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import type { User, Caregiver } from '@/types/auth';
import type { UserProfile } from '@/types/medication';

// GET - Fetch user profile with caregivers
export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authUser.id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('Error fetching user:', userError);
      return NextResponse.json(
        { error: 'Failed to fetch user' },
        { status: 500 }
      );
    }

    // Fetch user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', authUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }

    // Fetch caregivers
    const { data: caregiversData, error: caregiversError } = await supabase
      .from('caregivers')
      .select('*')
      .eq('user_id', authUser.id);

    if (caregiversError) {
      console.error('Error fetching caregivers:', caregiversError);
    }

    // Transform to User type
    const user: User | null = userData ? {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || undefined,
      avatar: userData.avatar || undefined,
      createdAt: new Date(userData.created_at),
      isPremium: userData.is_premium,
      premiumExpiresAt: userData.premium_expires_at 
        ? new Date(userData.premium_expires_at) 
        : undefined,
      smsCredits: userData.sms_credits,
      caregivers: (caregiversData || []).map((cg): Caregiver => ({
        id: cg.id,
        name: cg.name,
        email: cg.email,
        phone: cg.phone,
        relationship: cg.relationship,
        receiveAlerts: cg.receive_alerts,
        receiveMissedDose: cg.receive_missed_dose,
        receivePanicButton: cg.receive_panic_button,
        createdAt: new Date(cg.created_at),
      })),
    } : null;

    // Transform to UserProfile type
    const profile: UserProfile | null = profileData ? {
      id: profileData.id,
      name: userData?.name || '',
      age: profileData.age || undefined,
      allergies: profileData.allergies || undefined,
      conditions: profileData.conditions || undefined,
      emergencyContact: profileData.emergency_contact_name ? {
        name: profileData.emergency_contact_name,
        phone: profileData.emergency_contact_phone || '',
        relationship: profileData.emergency_contact_relationship || '',
      } : undefined,
      primaryDoctor: profileData.primary_doctor_name ? {
        name: profileData.primary_doctor_name,
        phone: profileData.primary_doctor_phone || '',
        specialty: profileData.primary_doctor_specialty || '',
      } : undefined,
      createdAt: profileData.created_at,
      updatedAt: profileData.updated_at,
    } : null;

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error('Unexpected error in GET /api/sync/user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Create user profile (for new users)
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, phone } = body;

    // Create user record
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email: email || authUser.email,
        name: name || authUser.email?.split('@')[0] || 'User',
        phone: phone || null,
        is_premium: false,
        sms_credits: 3, // Welcome credits
      })
      .select()
      .single();

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        user_id: authUser.id,
        name: userData.name,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }

    const user: User = {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone || undefined,
      createdAt: new Date(userData.created_at),
      isPremium: userData.is_premium,
      premiumExpiresAt: userData.premium_expires_at 
        ? new Date(userData.premium_expires_at) 
        : undefined,
      smsCredits: userData.sms_credits,
      caregivers: [],
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Unexpected error in POST /api/sync/user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { userUpdates, profileUpdates } = body as {
      userUpdates?: Partial<User>;
      profileUpdates?: Partial<UserProfile>;
    };

    // Update user data
    if (userUpdates) {
      const dbUserUpdates: Record<string, unknown> = {};
      if (userUpdates.name !== undefined) dbUserUpdates.name = userUpdates.name;
      if (userUpdates.phone !== undefined) dbUserUpdates.phone = userUpdates.phone;
      if (userUpdates.avatar !== undefined) dbUserUpdates.avatar = userUpdates.avatar;
      dbUserUpdates.updated_at = new Date().toISOString();

      const { error: userUpdateError } = await supabase
        .from('users')
        .update(dbUserUpdates)
        .eq('id', authUser.id);

      if (userUpdateError) {
        console.error('Error updating user:', userUpdateError);
        return NextResponse.json(
          { error: 'Failed to update user' },
          { status: 500 }
        );
      }
    }

    // Update user profile
    if (profileUpdates) {
      const dbProfileUpdates: Record<string, unknown> = {};
      if (profileUpdates.age !== undefined) dbProfileUpdates.age = profileUpdates.age;
      if (profileUpdates.allergies !== undefined) dbProfileUpdates.allergies = profileUpdates.allergies;
      if (profileUpdates.conditions !== undefined) dbProfileUpdates.conditions = profileUpdates.conditions;
      if (profileUpdates.emergencyContact !== undefined) {
        dbProfileUpdates.emergency_contact_name = profileUpdates.emergencyContact.name;
        dbProfileUpdates.emergency_contact_phone = profileUpdates.emergencyContact.phone;
        dbProfileUpdates.emergency_contact_relationship = profileUpdates.emergencyContact.relationship;
      }
      if (profileUpdates.primaryDoctor !== undefined) {
        dbProfileUpdates.primary_doctor_name = profileUpdates.primaryDoctor.name;
        dbProfileUpdates.primary_doctor_phone = profileUpdates.primaryDoctor.phone;
        dbProfileUpdates.primary_doctor_specialty = profileUpdates.primaryDoctor.specialty;
      }
      dbProfileUpdates.updated_at = new Date().toISOString();

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', authUser.id)
        .single();

      if (existingProfile) {
        await supabase
          .from('user_profiles')
          .update(dbProfileUpdates)
          .eq('user_id', authUser.id);
      } else {
        await supabase
          .from('user_profiles')
          .insert({
            user_id: authUser.id,
            name: userUpdates?.name || 'User',
            ...dbProfileUpdates,
          });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in PUT /api/sync/user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH - Add/update caregiver
export async function PATCH(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Supabase is not configured' },
      { status: 503 }
    );
  }

  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, caregiver, caregiverId, updates } = body as {
      action: 'add' | 'update' | 'delete';
      caregiver?: Omit<Caregiver, 'id' | 'createdAt'>;
      caregiverId?: string;
      updates?: Partial<Caregiver>;
    };

    switch (action) {
      case 'add': {
        if (!caregiver) {
          return NextResponse.json(
            { error: 'Caregiver data is required' },
            { status: 400 }
          );
        }

        const { data, error } = await supabase
          .from('caregivers')
          .insert({
            user_id: authUser.id,
            name: caregiver.name,
            email: caregiver.email,
            phone: caregiver.phone,
            relationship: caregiver.relationship,
            receive_alerts: caregiver.receiveAlerts,
            receive_missed_dose: caregiver.receiveMissedDose,
            receive_panic_button: caregiver.receivePanicButton,
          })
          .select()
          .single();

        if (error) {
          console.error('Error adding caregiver:', error);
          return NextResponse.json(
            { error: 'Failed to add caregiver' },
            { status: 500 }
          );
        }

        const newCaregiver: Caregiver = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          relationship: data.relationship,
          receiveAlerts: data.receive_alerts,
          receiveMissedDose: data.receive_missed_dose,
          receivePanicButton: data.receive_panic_button,
          createdAt: new Date(data.created_at),
        };

        return NextResponse.json({ caregiver: newCaregiver });
      }

      case 'update': {
        if (!caregiverId || !updates) {
          return NextResponse.json(
            { error: 'Caregiver ID and updates are required' },
            { status: 400 }
          );
        }

        const dbUpdates: Record<string, unknown> = {};
        if (updates.name !== undefined) dbUpdates.name = updates.name;
        if (updates.email !== undefined) dbUpdates.email = updates.email;
        if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
        if (updates.relationship !== undefined) dbUpdates.relationship = updates.relationship;
        if (updates.receiveAlerts !== undefined) dbUpdates.receive_alerts = updates.receiveAlerts;
        if (updates.receiveMissedDose !== undefined) dbUpdates.receive_missed_dose = updates.receiveMissedDose;
        if (updates.receivePanicButton !== undefined) dbUpdates.receive_panic_button = updates.receivePanicButton;

        const { data, error } = await supabase
          .from('caregivers')
          .update(dbUpdates)
          .eq('id', caregiverId)
          .eq('user_id', authUser.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating caregiver:', error);
          return NextResponse.json(
            { error: 'Failed to update caregiver' },
            { status: 500 }
          );
        }

        const updatedCaregiver: Caregiver = {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          relationship: data.relationship,
          receiveAlerts: data.receive_alerts,
          receiveMissedDose: data.receive_missed_dose,
          receivePanicButton: data.receive_panic_button,
          createdAt: new Date(data.created_at),
        };

        return NextResponse.json({ caregiver: updatedCaregiver });
      }

      case 'delete': {
        if (!caregiverId) {
          return NextResponse.json(
            { error: 'Caregiver ID is required' },
            { status: 400 }
          );
        }

        const { error } = await supabase
          .from('caregivers')
          .delete()
          .eq('id', caregiverId)
          .eq('user_id', authUser.id);

        if (error) {
          console.error('Error deleting caregiver:', error);
          return NextResponse.json(
            { error: 'Failed to delete caregiver' },
            { status: 500 }
          );
        }

        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Unexpected error in PATCH /api/sync/user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
