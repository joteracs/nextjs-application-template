import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { validateSession } from '../../../lib/auth';

export async function GET() {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const questions = await db.getAllQuestions();
    return NextResponse.json(questions);
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar questões' },
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

    const { subject, statement, alternatives, correctAnswer } = await request.json();
    
    if (!subject || !statement || !alternatives || correctAnswer === undefined) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (alternatives.length < 4) {
      return NextResponse.json(
        { message: 'É necessário pelo menos 4 alternativas' },
        { status: 400 }
      );
    }

    const questionId = await db.createQuestion(subject, statement, alternatives, correctAnswer);
    
    return NextResponse.json(
      { message: 'Questão criada com sucesso', id: questionId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao criar questão' },
      { status: 500 }
    );
  }
}
