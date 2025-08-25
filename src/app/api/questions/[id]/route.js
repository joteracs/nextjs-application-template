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
    const question = await db.getQuestionById(id);
    
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Questão não encontrada' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, question });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar questão' },
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
    const { subject, statement, alternatives, correctAnswer } = await request.json();
    
    if (!subject || !statement || !alternatives || !alternatives.length || correctAnswer === undefined) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    await db.updateQuestion(id, subject, statement, alternatives, correctAnswer);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar questão' },
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
    await db.deleteQuestion(id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao excluir questão' },
      { status: 500 }
    );
  }
}
