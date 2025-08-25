import { NextResponse } from 'next/server';
import db from '../../../lib/db';
import { validateSession } from '../../../lib/auth';

export async function GET(request) {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId !== user.id.toString()) {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const answers = await db.getUserAnswers(userId);
    return NextResponse.json(answers);
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao buscar respostas' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await validateSession();
    if (!user) {
      return NextResponse.json(
        { message: 'Não autorizado' },
        { status: 401 }
      );
    }

    const { userId, questionId, givenAnswer, isCorrect } = await request.json();
    
    if (!userId || !questionId || givenAnswer === undefined || isCorrect === undefined) {
      return NextResponse.json(
        { message: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    if (userId !== user.id) {
      return NextResponse.json(
        { message: 'Acesso negado' },
        { status: 403 }
      );
    }

    const answerId = await db.saveAnswer(userId, questionId, givenAnswer, isCorrect);
    
    return NextResponse.json(
      { message: 'Resposta salva com sucesso', id: answerId },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Erro ao salvar resposta' },
      { status: 500 }
    );
  }
}
