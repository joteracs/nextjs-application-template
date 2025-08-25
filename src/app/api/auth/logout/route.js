import { NextResponse } from 'next/server';
import { logout } from '@/lib/auth';

export async function POST() {
  try {
    await logout();
    
    const response = NextResponse.json({ success: true });
    response.cookies.delete('session-token');
    
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao fazer logout' },
      { status: 500 }
    );
  }
}
