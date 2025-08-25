import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { validateSession } from '../../../lib/auth';

export async function GET() {
  try {
    const user = await validateSession();
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const users = await db.getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar usuários' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await validateSession();
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const { name, email, password, type } = await request.json();
    
    if (!name || !email || !password || !type) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const userId = await db.createUser(name, email, password, type);
    
    return NextResponse.json(
      { message: 'Usuário criado com sucesso', id: userId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao criar usuário' },
      { status: 500 }
    );
  }
}
