import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import db from '@/lib/db';

export async function PUT(request, { params }) {
  try {
    const user = await validateSession();
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    const { name, email, type } = await request.json();
    
    if (!name || !email || !type) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    await db.updateUser(id, name, email, type);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar usuário' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = await validateSession();
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    const { id } = params;
    
    if (id === '1') {
      return NextResponse.json(
        { success: false, error: 'Não é possível excluir o administrador padrão' },
        { status: 400 }
      );
    }
    
    await db.deleteUser(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao excluir usuário' },
      { status: 500 }
    );
  }
}
