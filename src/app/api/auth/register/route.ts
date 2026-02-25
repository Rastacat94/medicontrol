import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone } = await request.json();
    
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, error: 'Nombre, email y contraseña son requeridos' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }
    
    // En producción: verificar si email existe en BD, hashear password, etc.
    
    return NextResponse.json({ 
      success: true, 
      message: 'Registration processing' 
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
