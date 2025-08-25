import { NextResponse } from 'next/server';
import { login } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    const result = await login(email, password);
    
    const response = NextResponse.json({
      user: result.user,
      sessionToken: result.sessionToken
    });

    // Set session cookie
    response.cookies.set('session-token', result.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { message: error.message },
      { status: 401 }
    );
  }
}
