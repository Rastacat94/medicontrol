import { NextResponse } from 'next/server';

export async function GET() {
  // En producción, aquí verificarías el token JWT o sesión
  // Por ahora devolvemos que la verificación debe hacerse en cliente
  
  return NextResponse.json({ 
    success: true, 
    message: 'Session check should be done client-side' 
  });
}

export async function DELETE() {
  // Logout - en producción invalidarías el token
  
  return NextResponse.json({ 
    success: true, 
    message: 'Session cleared' 
  });
}
