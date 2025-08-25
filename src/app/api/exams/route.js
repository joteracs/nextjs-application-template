import { NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const user = await validateSession();
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    const exams = await db.getAllExams();
    
    return NextResponse.json({ success: true, exams });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar provas' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await validateSession();
    
    if (!user || user.type !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Acesso negado' },
        { status: 403 }
      );
    }
    
    const { title, subject, questions, duration } = await request.json();
    
    if (!title || !subject || !questions || !questions.length || !duration) {
      return NextResponse.json(
        { success: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    const examId = await db.createExam(title, subject, questions, duration);
    
    return NextResponse.json({ success: true, examId });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Erro ao criar prova' },
      { status: 500 }
    );
  }
}
