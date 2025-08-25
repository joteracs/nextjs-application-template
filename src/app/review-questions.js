import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { validateSession } from './lib/auth';

export default function ReviewQuestions() {
  const [user, setUser] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchUserAndAnswers = async () => {
      const sessionUser = await validateSession();
      if (!sessionUser) {
        router.push('/login');
      } else {
        setUser(sessionUser);
        const res = await fetch(`/api/answers?userId=${sessionUser.id}`);
        if (res.ok) {
          const data = await res.json();
          setAnswers(data);
        }
      }
    };
    fetchUserAndAnswers();
  }, [router]);

  const handleCardFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNextCard = () => {
    setCurrentCard((prev) => (prev + 1) % answers.length);
    setIsFlipped(false);
  };

  const handlePrevCard = () => {
    setCurrentCard((prev) => (prev - 1 + answers.length) % answers.length);
    setIsFlipped(false);
  };

  if (!user) {
    return <div>Carregando...</div>;
  }

  if (answers.length === 0) {
    return (
      <div className="dashboard-layout">
        <div className="sidebar">
          <div className="sidebar-header">
            <h2>Revisar Questões</h2>
          </div>
          <ul className="sidebar-nav">
            <li><a href="/dashboard">Voltar ao Dashboard</a></li>
            <li><a href="/solve-questions">Resolver Questões</a></li>
          </ul>
        </div>
        <div className="main-content">
          <div className="header">
            <h1>Revisar Questões Resolvidas</h1>
          </div>
          <div className="card">
            <p>Você ainda não respondeu nenhuma questão. <a href="/solve-questions">Comece a resolver questões agora!</a></p>
          </div>
        </div>
      </div>
    );
  }

  const currentAnswer = answers[currentCard];
  const currentQuestion = currentAnswer.question;

  return (
    <div className="dashboard-layout">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Revisar Questões</h2>
        </div>
        <ul className="sidebar-nav">
          <li><a href="/dashboard">Voltar ao Dashboard</a></li>
          <li><a href="/solve-questions">Resolver Questões</a></li>
        </ul>
      </div>
      <div className="main-content">
        <div className="header">
          <h1>Revisar Questões Resolvidas (Flashcards)</h1>
          <div className="progress">
            <p>Cartão {currentCard + 1} de {answers.length}</p>
          </div>
        </div>
        <div className="flashcard-container">
          <div className={`flashcard ${isFlipped ? 'flipped' : ''}`} onClick={handleCardFlip}>
            <div className="flashcard-front">
              <div className="flashcard-content">
                <h3>Pergunta</h3>
                <p>{currentQuestion.statement}</p>
                <p><small>Matéria: {currentQuestion.subject}</small></p>
              </div>
            </div>
            <div className="flashcard-back">
              <div className="flashcard-content">
                <h3>Resposta</h3>
                <p>Alternativa correta: {currentQuestion.alternatives[currentQuestion.correct_answer]}</p>
                <p>Sua resposta: {currentQuestion.alternatives[currentAnswer.given_answer]}</p>
                <p className={currentAnswer.is_correct ? 'success-message' : 'error-message'}>
                  {currentAnswer.is_correct ? '✓ Correto' : '✗ Incorreto'}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flashcard-actions">
          <button className="btn btn-secondary" onClick={handlePrevCard} disabled={answers.length <= 1}>
            Anterior
          </button>
          <button className="btn btn-primary" onClick={handleNextCard} disabled={answers.length <= 1}>
            Próximo
          </button>
        </div>
      </div>
    </div>
  );
}
