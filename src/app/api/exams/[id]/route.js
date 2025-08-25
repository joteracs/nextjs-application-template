import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import db from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const user = await validateSession();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    const { id } = params;
    const exam = await db.getExamById(id);
    
    if (!exam) {
      return NextResponse.json(
        { success: false, error: 'Prova não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, exam });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar prova' },
      { status: 500 }
    );
  }
}

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
    const { title, subject, questions, duration } = await request.json();
    
    if (!title || !subject || !questions || !questions.length || !duration) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    await db.updateExam(id, title, subject, questions, duration);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar prova' },
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
    await db.deleteExam(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao excluir prova' },
      { status: 500 }
    );
  }
}
