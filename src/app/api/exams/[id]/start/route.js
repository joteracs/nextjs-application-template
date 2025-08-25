import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(request, { params }) {
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
    
    const existingAttempt = await db.getUserExamAttempt(user.id, id);
    
    if (existingAttempt) {
      return NextResponse.json(
        { success: false, error: 'Você já iniciou esta prova' },
        { status: 400 }
      );
    }
    
    const attemptId = await db.createExamAttempt(user.id, id);
    
    return NextResponse.json({ success: true, attemptId });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao iniciar prova' },
      { status: 500 }
    );
  }
}
